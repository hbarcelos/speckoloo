import ValidationError from './validation-error.factory'

export default factory => {
  return data => {
    const instances = [...data]
      .map(factory)

    return Object.create(null, {
      toJSON: {
        value: function toJSON (context = 'default') {
          return instances.map(item => item.toJSON(context))
        }
      },
      validate: {
        value: function validate (context = 'default') {
          const errors = instances.reduce((acc, item, key) => {
            try {
              item.validate(context)
              return acc
            } catch (e) {
              return { ...acc, [`item#${key}`]: e.details }
            }
          }, {})

          if (Object.keys(errors).length > 0) {
            throw ValidationError('Invalid entity aggregate!', { details: errors })
          }

          return this
        }
      },
      at: {
        value: function at (n) {
          return instances[n]
        }
      },
      [Symbol.iterator]: {
        value: function * iterator () {
          yield * instances[Symbol.iterator]()
        }
      }
    })
  }
}
