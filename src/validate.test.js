import { test } from 'ava'
import subject from './validate'
import { allowAny, forbidAny } from './default-validators'

test('Given valid data for a schema, when `validate` is called, then it should not throw and return the object itself', t => {
  const schema = {
    prop1: {
      validator: allowAny
    }
  }

  const data = {
    prop1: 'a'
  }

  const result = subject(schema, data)

  t.is(result, data)
})

test('Given invalid data for a schema, when `validate` is called, then it should throw an error describing all validation errors within the `details` property', async t => {
  const schema = {
    prop1: {
      validator: forbidAny
    },
    prop2: {
      validator: forbidAny
    }
  }

  const data = {
    prop1: 'a',
    prop2: 'b'
  }

  const error = await t.throws(() => subject(schema, data))

  t.is(error.name, 'ValidationError')
  t.true(error.details.hasOwnProperty('prop1'))
  t.true(error.details.hasOwnProperty('prop2'))
})
