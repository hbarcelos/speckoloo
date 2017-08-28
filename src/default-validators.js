export function allowAny (value, field, data) {
  return data
}

export function forbidAny (value, field, data) {
  return { error: `Field ${field} does not accept any value` }
}

export function delegate (entity) {
  try {
    entity.validate()
    return { data: entity }
  } catch (e) {
    if (Array.isArray(e)) {
      return { error: e.map(e => e.details) }
    }

    return { error: e.details }
  }
}
