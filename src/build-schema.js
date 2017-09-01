import { allowAny } from './default-validators'
import { omit, pick, intersection } from './common'

export default function buildSchema (definition, contexts) {
  const defaultSchema = fillDefaultValues(definition)

  const contextSchemas = Object.entries(contexts)
    .reduce(
      (acc, [ contextName, contextDefinition ]) => ({
        ...acc,
        [contextName]: applyOperators(contextDefinition, defaultSchema, contextName)
      }),
      {}
    )

  return {
    default: defaultSchema,
    ...contextSchemas
  }
}

function fillDefaultValues (propertyDefinition) {
  return Object.entries(propertyDefinition)
    .reduce(
      (acc, [ propertyName, definition ]) => ({
        ...acc,
        [propertyName]: {
          ...definition,
          validator: definition.validator || allowAny,
          skippable: !!definition.skippable
        }
      }),
      {}
    )
}

function applyOperators (contextDefinition, defaultSchema, contextName) {
  const {
    $exclude = [],
    $include = [],
    $skip = [],
    $modify = {}
  } = contextDefinition

  if ($include.length > 0 && $exclude.length > 0) {
    process.emitWarning(`Both $include and $exclude operators were used in context ${contextName}. Beware that $include will take precedence.`)
  }

  const finalSchema = $include.length > 0
    ? applyInclude($include, defaultSchema)
    : applyExclude($exclude, defaultSchema)

  const finalKeys = Object.keys(finalSchema)

  // @TODO: refactor this!
  const validatorsToModify = pick($modify, finalKeys)
  const validatorPatch = Object.entries(validatorsToModify)
    .reduce(
      (acc, [ propertyName, newValidator ]) => ({
        ...acc,
        [propertyName]: {
          validator: newValidator
        }
      }),
      {}
    )

  const skippablesToModify = intersection($skip, finalKeys)
  const skippablePatch = skippablesToModify
    .reduce(
      (acc, propertyName) => ({
        ...acc,
        [propertyName]: {
          skippable: true
        }
      }),
      {}
    )

  return Object.entries(finalSchema)
    .reduce(
      (acc, [ key, definition ]) =>
        Object.assign(
          acc,
          {
            [key]: {
              ...definition,
              ...validatorPatch[key],
              ...skippablePatch[key]
            }
          }
        ),
      {}
    )
}

function applyInclude ($include, schema) {
  if ($include.length > 0) {
    return pick(schema, $include)
  }

  return schema
}

function applyExclude ($exclude, schema) {
  if ($exclude.length > 0) {
    return omit(schema, $exclude)
  }

  return schema
}
