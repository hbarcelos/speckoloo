import { test } from 'ava'
import subject from './factory'

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

test('Given valid data with nested entity, when factory is called for parent entity, then it should create an object referencing the child entity', t => {
  const childSchema = {
    childProp1: {},
    childProp2: {},
    childProp3: {}
  }
  const childFactory = subject(childSchema)

  const parentSchema = {
    parentProp1: {},
    childEntity: {
      factory: childFactory
    }
  }
  const parentFactory = subject(parentSchema)

  const validData = {
    parentProp1: 'a',
    childEntity: {
      childProp1: 'b',
      childProp2: 'c',
      childProp3: 'd'
    }
  }

  const result = parentFactory(validData)

  t.deepEqual(result.childEntity, childFactory(validData.childEntity))
})

test('Given nested child data with extra properties, when factory is called for parent entity, then it should create an object referencing the child entity excluding the extra properties', t => {
  const childSchema = {
    childProp1: {}
  }
  const childFactory = subject(childSchema)

  const parentSchema = {
    childEntity: {
      factory: childFactory
    }
  }
  const parentFactory = subject(parentSchema)

  const extraPropertiesOnNestedChildData = {
    childEntity: {
      childProp1: 'b',
      childProp2: 'c'
    }
  }

  const expected = {
    childEntity: {
      childProp1: 'b'
    }
  }

  const result = parentFactory(extraPropertiesOnNestedChildData).toJSON()
  t.deepEqual(result, expected)
})

test('Given missing nested child data, when factory is called for parent entity, then it should create an object that does not contain the property related to the child entity', t => {
  const childSchema = {
    childProp1: {}
  }
  const childFactory = subject(childSchema)

  const parentSchema = {
    prop1: {},
    childEntity: {
      factory: childFactory
    }
  }
  const parentFactory = subject(parentSchema)

  const missingChildEntityData = {
    prop1: 'a'
  }

  const expected = {
    prop1: 'a'
  }

  const result = parentFactory(missingChildEntityData).toJSON()
  t.deepEqual(result, expected)
})
