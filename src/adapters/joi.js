import Joi from 'joi'

export default joiSchema => (value, key) => {
  const { error } = Joi.validate(
    { [key]: value },
    Joi.object({ [key]: joiSchema })
  )
  if (!error) {
    return
  }

  return {
    error: error.details[0].message
  }
}
