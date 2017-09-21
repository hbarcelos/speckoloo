import { pick, omitBy, identity, isUndefinedOrNull } from './common'
import validate from './validate'
import toJSON from './to-json'
import buildSchema from './build-schema'

const DEFAULT_CONTEXT_NAME = 'default'

const buildPrototypeDescriptors = (schema, methods) => {
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
    toJSON: {
      value: function (context = DEFAULT_CONTEXT_NAME) {
        /**
         * Handles the case when calling `JSON.stringify` directly on the entity.
         * In this case, `toJSON` is called with an empty string as first argument.
         *
         * @see { @link https://mzl.la/2hgTyXG }
         */
        context = context || DEFAULT_CONTEXT_NAME

        checkContext(this.$schema, context)

        return toJSON(this.$schema[context], this)
      }
    },
    validate: {
      value: function (context = DEFAULT_CONTEXT_NAME) {
        context = context || DEFAULT_CONTEXT_NAME

        checkContext(this.$schema, context)

        return validate(this.$schema[context], this)
      }
    }
  }
}

function checkContext (schema, context) {
  if (schema[context] === undefined) {
    throw new Error(`Invalid context "${context}"`)
  }
}

function nestedFactoryWrapper (factory) {
  if (factory === undefined) {
    return
  }

  return data =>
    isUndefinedOrNull(data)
      ? undefined
      : factory(data)
}

function buildEntityPropertyDescriptors (allowedData, schemaDefinition) {
  return Object.entries(allowedData)
    .reduce(
      (acc, [ key, value ]) => {
        const finalFactory = nestedFactoryWrapper(schemaDefinition[key].factory) || identity
        const finalValue = finalFactory(value)
        const readOnly = !!schemaDefinition[key].readOnly

        const baseDescriptor = {
          get () { return finalValue },
          enumerable: true,
          configurable: true
        }

        const setterDescriptor = !readOnly
          ? { set (newValue) { return finalFactory(newValue) } }
          : {}

        return Object.assign(
          acc,
          {
            [key]: Object.assign(baseDescriptor, setterDescriptor)
          }
        )
      },
      {}
    )
}

export default schemaDefinition => {
  const { $methods = {}, $contexts = {}, ...definition } = schemaDefinition

  const schema = buildSchema(definition, $contexts)

  const defaultValues = Object.entries(definition)
    .reduce((acc, [ propertyName, def ]) => {
      if (def.default) {
        return Object.assign(acc, { [propertyName]: def.default })
      }
      return acc
    }, {})

  const schemaKeys = Object.keys(definition)
  const prototype = Object.create(null, buildPrototypeDescriptors(schema, $methods))

  const factory = (data = {}) => {
    /**
     * The line bellow also covers the case when data is `null`.
     */
    data = Object.assign({}, defaultValues, data || {})

    const allowedData = Object.keys(data).length === 0
      ? {}
      : omitBy(pick(data, schemaKeys), isUndefinedOrNull)

    const instance = Object.create(
      prototype,
      buildEntityPropertyDescriptors(allowedData, schemaDefinition)
    )

    return Object.defineProperty(instance, '$factory', {
      value: factory
    })
  }

  return factory
}
