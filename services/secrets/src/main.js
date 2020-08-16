require('../../prelude');
const Debug = require('debug');
const tcdb = require('taskcluster-db');
const builder = require('../src/api');
const loader = require('taskcluster-lib-loader');
const SchemaSet = require('taskcluster-lib-validate');
const { MonitorManager } = require('taskcluster-lib-monitor');
const { App } = require('taskcluster-lib-app');
const libReferences = require('taskcluster-lib-references');
const config = require('taskcluster-lib-config');

let debug = Debug('secrets:server');

let load = loader({
  cfg: {
    requires: ['profile'],
    setup: ({ profile }) => config({
      profile,
      serviceName: 'secrets',
    }),
  },

  monitor: {
    requires: ['process', 'profile', 'cfg'],
    setup: ({ process, profile, cfg }) => MonitorManager.setup({
      serviceName: 'secrets',
      processName: process,
      verify: profile !== 'production',
      ...cfg.monitoring,
    }),
  },

  schemaset: {
    requires: ['cfg'],
    setup: ({ cfg }) => new SchemaSet({
      serviceName: 'secrets',
    }),
  },

  db: {
    requires: ['cfg', 'process', 'monitor'],
    setup: ({ cfg, process, monitor }) => tcdb.setup({
      readDbUrl: cfg.postgres.readDbUrl,
      writeDbUrl: cfg.postgres.writeDbUrl,
      azureCryptoKey: cfg.azure.cryptoKey,
      dbCryptoKeys: cfg.postgres.dbCryptoKeys,
      serviceName: 'secrets',
      monitor: monitor.childMonitor('db'),
      statementTimeout: process === 'server' ? 30000 : 0,
    }),
  },

  generateReferences: {
    requires: ['cfg', 'schemaset'],
    setup: ({ cfg, schemaset }) => libReferences.fromService({
      schemaset,
      references: [builder.reference(), MonitorManager.reference('secrets')],
    }).generateReferences(),
  },

  api: {
    requires: ['cfg', 'db', 'schemaset', 'monitor'],
    setup: async ({ cfg, db, schemaset, monitor }) => builder.build({
      rootUrl: cfg.taskcluster.rootUrl,
      context: { cfg, db },
      monitor: monitor.childMonitor('api'),
      schemaset,
    }),
  },

  server: {
    requires: ['cfg', 'api'],
    setup: ({ cfg, api }) => App({
      port: Number(process.env.PORT || cfg.server.port),
      env: cfg.server.env,
      forceSSL: cfg.server.forceSSL,
      trustProxy: cfg.server.trustProxy,
      apis: [api],
    }),
  },

  expire: {
    requires: ['cfg', 'db', 'monitor'],
    setup: ({ cfg, db, monitor }, ownName) => {
      return monitor.oneShot(ownName, async () => {
        debug('Expiring secrets');
        const [{ expire_secrets: count }] = (await db.fns.expire_secrets());
        debug('Expired ' + count + ' secrets');
      });
    },
  },
}, {
  profile: process.env.NODE_ENV,
  process: process.argv[2],
});

// If this file is executed launch component from first argument
if (!module.parent) {
  load.crashOnError(process.argv[2]);
}

module.exports = load;
