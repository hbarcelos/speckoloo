export function allowAny (value, field, data) {
  return data
}

export function forbidAny (value, field, data) {
  return { error: `Field ${field} does not accept any value` }
}

export function delegate (context) {
  return entity => {
    try {
      entity.validate(context)
      return { data: entity }
    } catch (e) {
      if (e.name === 'ValidationError') {
        return { error: e.details }
      }

      return { error: e.message }
    }
  }
}
