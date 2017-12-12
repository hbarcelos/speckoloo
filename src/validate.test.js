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

test('Given missing data for field in a schema with `skippable` = true for such field, when `validate` is called, then it should not throw and return the object itself', t => {
  const schema = {
    prop1: {
      validator: allowAny
    },
    prop2: {
      validator: forbidAny,
      skippable: true
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

  t.is(error.code, 'ERR_VALIDATION')
  t.true(error.details.hasOwnProperty('prop1'))
  t.true(error.details.hasOwnProperty('prop2'))
})

test('Given validator returning falsy for valid data, when `validate` is called for valid instance, then it should not throw an error', async t => {
  const schema = {
    prop1: {
      validator: () => undefined
    },
    prop2: {
      validator: () => false
    },
    prop3: {
      validator: () => null
    },
    prop4: {
      validator: () => ''
    }
  }

  const data = {
    prop1: 'a',
    prop2: 'b',
    prop3: 'c',
    prop4: 'd'
  }

  t.notThrows(() => subject(schema, data))
})

test('Given validator returning a truthy non-object value for valid data, when `validate` is called for valid instance, then it should not throw an error', async t => {
  const schema = {
    prop1: {
      validator: () => 'OK'
    },
    prop2: {
      validator: () => 'OK'
    }
  }

  const data = {
    prop1: 'a',
    prop2: 'b'
  }

  t.notThrows(() => subject(schema, data))
})
