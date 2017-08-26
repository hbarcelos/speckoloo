import { test } from 'ava'
import subject from './to-json'

test('Given data with same keys as schema, when toJSON is called, then is should return the same values', t => {
  const schema = {
    prop1: {},
    prop2: {}
  }

  const data = {
    prop1: 'a',
    prop2: 'b'
  }

  const result = subject(schema, data)

  t.deepEqual(result, data)
})

test('Given data with more keys than schema, when toJSON is called, then is should return data stripped from the extra keys', t => {
  const schema = {
    prop1: {},
    prop2: {}
  }

  const data = {
    prop1: 'a',
    prop2: 'b',
    notInSchema: 'c'
  }

  const result = subject(schema, data)

  t.deepEqual(result, {
    prop1: 'a',
    prop2: 'b'
  })
})

test('Given data with less keys than schema, when toJSON is called, then is should return data with none of the missing keys', t => {
  const schema = {
    prop1: {},
    prop2: {}
  }

  const data = {
    prop1: 'a'
  }

  const result = subject(schema, data)

  t.deepEqual(result, {
    prop1: 'a'
  })
})
