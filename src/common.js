export const pick = (obj, keys) => Object.keys(obj).reduce((result, currentKey) => {
  keys.includes(currentKey) &&
    (result[currentKey] = obj[currentKey])
  return result
}, {})

export const omit = (obj, keys) => Object.keys(obj).reduce((result, currentKey) => {
  !keys.includes(currentKey) &&
    (result[currentKey] = obj[currentKey])
  return result
}, {})

export const identity = a => a

export const intersection = (a, b) => Array.from(
  new Set([...a]
    .filter(x => (new Set([...b])).has(x)))
)
