import { pick, identity } from './common'
import validate from './validate'
import toJSON from './to-json'
import buildSchema from './build-schema'

const buildDescriptors = (schema, validate) => ({
  $schema: {
    value: schema
  },
  toJSON: {
    value: function () {
      return toJSON(this.$schema, this)
    }
  },
  validate: {
    value: function () {
      return validate(this.$schema, this)
    }
  }
})

export default schemaDefinition => {
  const schemaKeys = Object.keys(schemaDefinition)

  const schema = buildSchema(schemaDefinition)

  return data => {
    const $data = pick(data, schemaKeys)

    return Object.assign(
      Object.create(null, buildDescriptors(schema, validate)),
      Object.keys($data).reduce(
        (acc, currentKey) =>
          Object.assign(
            acc,
            { [currentKey]: (schemaDefinition[currentKey].factory || identity)($data[currentKey]) }
          ),
        {}
      )
    )
  }
}
