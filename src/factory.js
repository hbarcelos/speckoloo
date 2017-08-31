import { pick, identity } from './common'
import validate from './validate'
import toJSON from './to-json'
import buildSchema from './build-schema'

const buildDescriptors = (schema, factory, methods) => {
  const methodDescriptors = Object.entries(methods)
    .reduce(
      (acc, [ methodName, method ]) => ({
        ...acc,
        [methodName]: { value: method }
      }),
      {}
    )

  return {
    ...methodDescriptors,
    $schema: {
      value: schema
    },
    $factory: {
      value: factory
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
  }
}

function checkContext (schema, context) {
  if (schema[context] === undefined) {
    throw new Error('Invalid context')
  }
}

export default schemaDefinition => {
  const { $methods = {}, $contexts = {}, ...definition } = schemaDefinition

  const schema = buildSchema(definition, $contexts)

  const schemaKeys = Object.keys(definition)
  const factory = data => {
    const allowedData = pick(data, schemaKeys)

    return Object.assign(
      Object.create(null, buildDescriptors(schema, factory, $methods)),
      Object.entries(allowedData).reduce(
        (acc, [ key, value ]) =>
          Object.assign(
            acc,
            { [key]: (schemaDefinition[key].factory || identity)(value) }
          ),
        {}
      )
    )
  }

  return factory
}
