import Ajv from 'ajv';
import metaSchema from 'ajv/lib/refs/json-schema-draft-06.json';

const ajv = new Ajv({ format: 'full', verbose: true, allErrors: true });

ajv.addMetaSchema(metaSchema);

export default ajv;
