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

export const omitBy = (obj, predicate) => Object.keys(obj).reduce((result, currentKey) => {
  !predicate(obj[currentKey]) &&
    (result[currentKey] = obj[currentKey])
  return result
}, {})

export const identity = a => a

export const not = fn => (...args) => !fn(...args)

export const intersection = (a, b) => Array.from(
  new Set([...a]
    .filter(x => (new Set([...b])).has(x)))
)

export const isUndefinedOrNull = x => x === undefined || x === null

export const compose2 = (f, g) => (...args) => f(g(...args))

export const compose = (...fns) => fns.reduce(compose2)

export const pipe = (...fns) => fns.reduceRight(compose2)

export const partial = (fn, arg1) => (...args) => fn(arg1, ...args)
export const curry = (fn, ...args) =>
  args.length === fn.length
    ? fn(...args)
    : curry.bind(this, fn, ...args)
