const pick = (obj, keys) => Object.keys(obj).reduce((result, currentKey) => {
  keys.includes(currentKey) &&
    (result[currentKey] = obj[currentKey])
  return result
}, {})

const identity = a => a

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
  }
})

export default schema => data => {
  const $data = pick(data, Object.keys(schema))

  return Object.assign(
    Object.create(null, buildDescriptors(schema)),
    Object.keys($data).reduce(
      (acc, currentKey) =>
        Object.assign(acc, { [currentKey]: (schema[currentKey].factory || identity)($data[currentKey]) }),
      {}
    )
  )
}
