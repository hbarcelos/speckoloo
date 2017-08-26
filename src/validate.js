export default function validate (schema, data) {
  const allErrors = Object.keys(schema).reduce((acc, currentKey) => {
    const { error } = schema[currentKey].validator(data[currentKey], currentKey, data)
    return error ? { ...acc, [currentKey]: error } : acc
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
