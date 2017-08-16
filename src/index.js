const pick = (obj, keys) => Object.keys(obj).reduce((result, currentKey) => {
  keys.includes(currentKey) &&
    (result[currentKey] = obj[currentKey])
  return result
}, {})

export default schema => data => Object.assign({}, data, {
  __SCHEMA: schema,
  toJSON () { return pick(data, Object.keys(schema)) }
})
