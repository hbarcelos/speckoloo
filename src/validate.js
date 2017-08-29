export default function validate (schema, data) {
  const allErrors = Object.entries(schema).reduce((acc, [ propertyName, definition ]) => {
    const { error } = (definition.validator(data[propertyName], propertyName, data) || {})
    return error ? { ...acc, [propertyName]: error } : acc
  }, undefined)

  if (allErrors) {
    throw Object.assign(Object.create(Error.prototype), {
      message: 'Validation Error!',
      name: 'ValidationError',
      details: allErrors
    })
  }

  return data
}
