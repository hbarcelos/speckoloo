import { allowAny } from './default-validators'
import { omit, pick } from './common'

export default function buildSchema (definition, contexts) {
  const defaultSchema = fillDefaultValidators(definition)

  const contextSchemas = Object.entries(contexts)
    .reduce(
      (acc, [ contextName, contextDefinition ]) => ({
        [contextName]: applyOperators(contextDefinition, defaultSchema, contextName)
      }),
      {}
    )

  return {
    default: defaultSchema,
    ...contextSchemas
  }
}

function fillDefaultValidators (propertyDefinition) {
  return Object.entries(propertyDefinition)
    .reduce(
      (acc, [ propertyName, definition ]) => ({
        ...acc,
        [propertyName]: {
          ...definition,
          validator: definition.validator || allowAny
        }
      }),
      {}
    )
}

function applyOperators (contextDefinition, defaultSchema, contextName) {
  const {
    $exclude = [],
    $include = [],
    $modify = {}
  } = contextDefinition

  if ($include.length > 0 && $exclude.length > 0) {
    process.emitWarning(`Both $include and $exclude operators were used in context ${contextName}. Beware that $include will take precedence.`)
  }

  let finalSchema = defaultSchema

  if ($exclude.length > 0 && $include.length === 0) {
    finalSchema = omit(defaultSchema, $exclude)
  }

  if ($include.length > 0) {
    finalSchema = pick(defaultSchema, $include)
  }

  const validatorsToModify = pick($modify, Object.keys(finalSchema))
  const patch = Object.entries(validatorsToModify)
    .reduce(
      (acc, [ propertyName, newValidator ]) => ({
        ...acc,
        [propertyName]: {
          ...finalSchema[propertyName],
          validator: newValidator
        }
      }),
      {}
    )

  return { ...finalSchema, ...patch }
}
