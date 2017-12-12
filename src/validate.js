import ValidationError from './validation-error.factory'

export default function validate (schema, data) {
  const allErrors = Object.entries(schema).reduce((acc, [ propertyName, definition ]) => {
    if (definition.skippable && data[propertyName] === undefined) {
      return acc
    }

    const { error } = (definition.validator(data[propertyName], propertyName, data) || {})
    return error ? { ...acc, [propertyName]: error } : acc
  }, undefined)

  if (allErrors) {
    throw ValidationError('Invalid entity!', { details: allErrors })
  }

  return data
}
