const baseConfigProperties = {
  rules: { type: 'object' },
  excludedFiles: { type: 'array' },
  extends: { anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
  plugins: { type: 'array' },
}

const configSchema = {
  type: 'object',
  properties: baseConfigProperties,
  additionalProperties: false,
}

module.exports = configSchema
