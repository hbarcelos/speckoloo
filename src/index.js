const pick = (obj, keys) => Object.keys(obj).reduce((result, currentKey) => {
  keys.includes(currentKey) &&
    (result[currentKey] = obj[currentKey])
  return result
}, {})

const identity = a => a
const allowAny = (value, field, data) => ({ data })

const defaultNestedEntityValidator = entity => {
  try {
    entity.validate()
    return { data: entity }
  } catch (e) {
    return { error: e.details }
  }
}

const buildDescriptors = ($schema) => ({
  $schema: {
    value: $schema
  },
  toJSON: {
    value: function () {
      return Object.keys(this).reduce(
        (acc, currentKey) =>
          Object.assign(
            acc,
            {
              [currentKey]: typeof this[currentKey].toJSON === 'function'
                ? this[currentKey].toJSON()
                : this[currentKey]
            }
          ),
        {}
      )
    }
  },
  validate: {
    value: function () {
      const allErrors = Object.keys($schema).reduce((acc, currentKey) => {
        const { error } = $schema[currentKey].validator(this[currentKey], currentKey, this)
        return error ? { ...acc, [currentKey]: error } : acc
      }, undefined)

      if (allErrors) {
        throw Object.assign(Object.create(Error.prototype), {
          message: 'Validation Error!',
          name: 'ValidationError',
          details: allErrors
        })
      }
    }
  }
})

export default schema => data => {
  const schemaKeys = Object.keys(schema)

  const $data = pick(data, schemaKeys)

  const $schema = schemaKeys.reduce((acc, currentKey) => {
    const defaultValidator = schema[currentKey].factory
      ? defaultNestedEntityValidator
      : allowAny

    return {
      ...acc,
      [currentKey]: {
        ...schema[currentKey],
        validator: schema[currentKey].validator || defaultValidator
      }
    }
  }, {})

  return Object.assign(
    Object.create(null, buildDescriptors($schema)),
    Object.keys($data).reduce(
      (acc, currentKey) =>
        Object.assign(
          acc,
          { [currentKey]: (schema[currentKey].factory || identity)($data[currentKey]) }
        ),
      {}
    )
  )
}
