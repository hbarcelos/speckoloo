import { test } from 'ava'
import factoryFor from './factory'
import subject from './collection-factory'

test('Given a single object factory and an array of data, when collection factory is called, then it should return an entity that is a collection of entities', t => {
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
