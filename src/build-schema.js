import { allowAny } from './default-validators'

export default function buildSchema (definition) {
  return Object.keys(definition)
    .reduce((acc, currentKey) => {
      return {
        ...acc,
        [currentKey]: {
          ...definition[currentKey],
          validator: definition[currentKey].validator || allowAny
        }
      }
    }, {})
}
