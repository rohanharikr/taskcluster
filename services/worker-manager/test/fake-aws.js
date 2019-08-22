/* eslint-disable guard-for-in */
const sinon = require('sinon');
const uuid = require('uuid');

class EC2 {
  constructor({apiVersion, credentials}) {
    this.apiVersion = apiVersion;
    this.credentials = credentials;
  }

  runInstances(launchConfig) {
    let Groups = ['groupA'];
    let OwnerId = '1234512345';

    let Instances = [];
    for (let i = 0; i < launchConfig.MaxCount; i++) {
      let instance = {
        InstanceId: uuid.v4(),
        AmiLaunchIndex: 'i',
        ImageId: launchConfig.ImageId,
        InstanceType: launchConfig.InstanceType || 'm1.small',
        Architecture: 'x86',
        Placement: {
          AvailabilityZone: (launchConfig.Placement && launchConfig.Placement.AvailabilityZone) || `${EC2.prototype.region}-1`,
        },
        PrivateIpAddress: '1.1.1.1',
        State: {
          Name: 'running',
        },
        StateReason: {
          Message: 'somebody launched it',
        },
      };

      Instances.push(instance);
    }

    return {
      promise: async () => Promise.resolve({
        Instances,
        Groups,
        OwnerId,
      }),
    };
  }
}

module.exports = {
  config: {
    update: function(options) {
      for (let prop in options) {
        EC2.prototype[prop] = options[prop];
      }
    },
  },
  EC2: EC2,
  getPubkey: () => fs.readFileSync(path.resolve(__dirname, 'fixtures/fakeAWSpubkey')).toString()
};
