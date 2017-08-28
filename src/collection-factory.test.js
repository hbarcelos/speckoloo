import { test } from 'ava'
import factoryFor from './factory'
import { forbidAny } from './default-validators'
import subject from './collection-factory'

test('Given a single object factory and an array of data, when collection factory is called with raw data, then it should return an entity that is a collection of entities', t => {
  const singleSchema = {
    prop1: {},
    prop2: {}
  }

  const singleFactory = factoryFor(singleSchema)

  const collectionFactory = subject(singleFactory)

  const validData = [{
    prop1: 'a',
    prop2: 'b'
  }, {
    prop1: 'c',
    prop2: 'd'
  }]

  const result = collectionFactory(validData)

  t.deepEqual(result.toJSON(), validData)
})

test('Given a single object factory and an array of data, when collection factory is called with an instance of the collection, then it should return an entity that is a collection of entities', t => {
  const singleSchema = {
    prop1: {},
    prop2: {}
  }

  const singleFactory = factoryFor(singleSchema)

  const collectionFactory = subject(singleFactory)

  const validDataWithInstance = collectionFactory([{
    prop1: 'a',
    prop2: 'b'
  }, {
    prop1: 'c',
    prop2: 'd'
  }])

  const result = collectionFactory(validDataWithInstance)

  t.deepEqual(result.toJSON(), validDataWithInstance.toJSON())
})

test('Given a single object factory and an array of invalid data, when `validate()` factory is called, then it should throw an error for each one of the invalid entity', t => {
  const singleSchema = {
    prop1: {
      validator: forbidAny
    },
    prop2: {
      validator: forbidAny
    }
  }

  const singleFactory = factoryFor(singleSchema)

  const collectionFactory = subject(singleFactory)

  const validData = [{
    prop1: 'a',
    prop2: 'b'
  }, {
    prop1: 'c',
    prop2: 'd'
  }]

  const result = collectionFactory(validData)

  const errors = t.throws(() => result.validate())
  t.true(errors.length === 2)
  t.truthy(errors[0].details.prop1)
  t.truthy(errors[0].details.prop2)
  t.truthy(errors[1].details.prop1)
  t.truthy(errors[1].details.prop2)
})
