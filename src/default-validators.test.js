import { test } from 'ava'
import { delegate } from './default-validators'
import factory from './factory'

test('[delegate] Given delegate with invalid context, when validator is called, then it should properly handle the error', t => {
  const schema = {
    myProp1: {},
    $contexts: {}
  }

  const instance = factory(schema)({})

  const result = delegate('invalidContext')(instance)

  t.regex(result.error, /invalid context/i)
})
