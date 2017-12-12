const ValidationErrorFactory = (message, { details }) => {
  const error = Object.create(Error.prototype, {
    constructor: {
      value: ValidationErrorFactory
    },
    code: {
      value: 'ERR_VALIDATION'
    },
    message: {
      value: message
    },
    details: {
      value: details
    },
    toJSON: {
      value: function _toJSON () {
        return {
          message: this.message,
          code: this.code,
          details: this.details
        }
      }
    }
  })

  Error.captureStackTrace(error, ValidationErrorFactory)

  return error
}

export { ValidationErrorFactory as default }
