import { pick, identity } from './common'
import validate from './validate'
import toJSON from './to-json'
import buildSchema from './build-schema'

const buildDescriptors = (schema, validate) => ({
  $schema: {
    value: schema
  },
  toJSON: {
    value: function (context = 'default') {
      checkContext(this.$schema, context)

      return toJSON(this.$schema[context], this)
    }
  },
  validate: {
    value: function (context = 'default') {
      checkContext(this.$schema, context)

      return validate(this.$schema[context], this)
    }
  }
})

function checkContext (schema, context) {
  if (schema[context] === undefined) {
    throw new Error('Invalid context')
  }
}

export default schemaDefinition => {
  const schemaKeys = Object.keys(schemaDefinition)

  const schema = buildSchema(schemaDefinition)

  return data => {
    const allowedData = pick(data, schemaKeys)

    return Object.assign(
      Object.create(null, buildDescriptors(schema, validate)),
      Object.keys(allowedData).reduce(
        (acc, currentKey) =>
          Object.assign(
            acc,
            { [currentKey]: (schemaDefinition[currentKey].factory || identity)(allowedData[currentKey]) }
          ),
        {}
      )
    )
  }
}
