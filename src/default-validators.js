export function allowAny (value, field, data) {
  return data
}

export function forbidAny (value, field, data) {
  return { error: `Field ${field} does not accept any value` }
}

/**
 * There are 2 available signatures:
 *
 * @param {string} context the context name
 * @param {object = { required: false }} options the options
 *
 * Or:
 *
 * @param {object = { required: false }} options the options
 */
export function delegate (arg1, arg2) {
  let required = false
  let context

  if (arg1 && typeof arg1 !== 'string') {
    required = arg1.required || false
  } else {
    context = arg1
    required = (arg2 && arg2.required) || false
  }

  return (entity, key) => {
    if (entity === undefined) {
      if (required) {
        return { error: `${key} is required` }
      }

      return entity
    }

    try {
      entity.validate(context)
      return { data: entity }
    } catch (e) {
      if (e.code === 'ERR_VALIDATION') {
        return { error: e.details }
      }

      return { error: e.message }
    }
  }
}
