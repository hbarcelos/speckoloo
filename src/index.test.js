import { test } from 'ava'
import subject from './index'

test('Given valid data, when factory is called, then it should create an object with all keys from schema', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {}
  }
  const data = {
    myProp1: 'a',
    myProp2: 'b',
    myProp3: 'c'
  }
  const factory = subject(schema)

  const result = factory(data).toJSON()

  t.deepEqual(result, data)
})

test('Given data with extra fields, when factory is called, then it should create an object with only the keys from schema, dropping the unspecified ones', t => {
  const schema = {
    myProp1: {},
    myProp2: {}
  }
  const data = {
    myProp1: 'a',
    myProp2: 'b',
    unespecifiedField1: 'c'
  }
  const expected = {
    myProp1: 'a',
    myProp2: 'b'
  }
  const factory = subject(schema)

  const result = factory(data).toJSON()

  t.deepEqual(result, expected)
})
