import { pick, omitBy, identity, not } from './common'
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

function nestedFactoryWrapper (factory) {
  if (factory === undefined) {
    return
  }

  return data =>
    Object.keys(data).length === 0
      ? undefined
      : factory(data)
}

export default schemaDefinition => {
  const { $methods = {}, $contexts = {}, ...definition } = schemaDefinition

  const schema = buildSchema(definition, $contexts)

  const schemaKeys = Object.keys(definition)
  const factory = (data = {}) => {
    const allowedData = Object.keys(data).length === 0
      ? {}
      : omitBy(pick(
        data, // handles case where data was defined as a falsy value
        schemaKeys
      ), not(identity))

    return Object.assign(
      Object.create(null, buildDescriptors(schema, factory, $methods)),
      Object.entries(allowedData).reduce(
        (acc, [ key, value ]) =>
          Object.assign(
            acc,
            { [key]: (nestedFactoryWrapper(schemaDefinition[key].factory) || identity)(value) }
          ),
        {}
      )
    )
  }

  return factory
}
