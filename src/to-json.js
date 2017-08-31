import { intersection } from './common.js'

export default function toJSON (schema, data) {
  const intersectionKeys = intersection(Object.keys(data), Object.keys(schema))
  return intersectionKeys.reduce((acc, currentKey) => {
    if (data[currentKey] === undefined) {
      return acc
    }

    return Object.assign(
      acc,
      {
        [currentKey]: typeof data[currentKey].toJSON === 'function'
          ? data[currentKey].toJSON()
          : data[currentKey]
      }
    )
  }, {})
}
