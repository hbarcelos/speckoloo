import { test } from 'ava'
import subject from './factory'
import { pick } from './common'

test('Given simple schema and validData, when factory is called, should create property acessors to all and only the keys described in schema', t => {
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
  const result = factory(data)

  t.deepEqual(Object.keys(result), Object.keys(data))
})

test('Given schema with contexts and valid data, when factory is called, should create property acessors to all and only the keys described in schema', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {},

    $contexts: {
      context1: {},
      context2: {}
    }
  }

  const data = {
    myProp1: 'a',
    myProp2: 'b',
    myProp3: 'c'
  }

  const factory = subject(schema)
  const result = factory(data)

  t.deepEqual(Object.keys(result), Object.keys(data))
})

test('Given simple schema and missing data, when factory is called, should create property acessors to all and only the keys described in schema', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {}
  }

  const data = {
    myProp1: 'a',
    myProp2: 'b'
  }

  const factory = subject(schema)
  const result = factory(data)

  t.is(Object.keys(result).length, 3)
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

test('Given valid data, when factory is called, then it should create an object with `construtor` property pointing to the same factory', t => {
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

  const result = factory(data)

  t.is(result.constructor, factory)
})

test('Given two identical schemas, when an entity from the first one is created from an entity from the second one, then the factory must apply duck typing and return an object from the first type', t => {
  const schema1 = {
    myProp1: {},
    myProp2: {},
    myProp3: {}
  }
  const schema2 = {
    myProp1: {},
    myProp2: {},
    myProp3: {}
  }

  const data = {
    myProp1: 'a',
    myProp2: 'b',
    myProp3: 'c'
  }

  const instanceFactory = subject(schema1)
  const anotherInstanceFactory = subject(schema2)

  const result = instanceFactory(anotherInstanceFactory(data))

  t.is(result.constructor, instanceFactory)
})

test('Given schema, when factory is called, then it should return an object which is not `instnaceof` the factory', t => {
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
  const instance = factory(data)

  const error = t.throws(() => instance instanceof factory)
  t.regex(error.message, /function has non-object prototype/i)
})

test('Given already instantiated entity, when factory is called, then it should create a copy of the original data', t => {
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

  const firstInstance = factory(data)

  const secondInstance = factory(firstInstance)

  t.not(secondInstance, firstInstance)
  t.deepEqual(secondInstance, firstInstance)
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

test('Given valid data with nested entity, when factory is called for parent entity with data that is already an instance of child, then it should create an object referencing the child entity', t => {
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
    childEntity: childFactory({
      childProp1: 'b',
      childProp2: 'c',
      childProp3: 'd'
    })
  }

  const result = parentFactory(validData)

  t.deepEqual(result.childEntity, childFactory(validData.childEntity))
})

test('Given already instantiated composite entity, when factory is called, then it should create a copy of the original nested entity', t => {
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

  const firstInstance = parentFactory(validData)

  const secondInstance = parentFactory(firstInstance)

  t.not(secondInstance.childEntity, firstInstance.childEntity)
  t.deepEqual(secondInstance.childEntity, firstInstance.childEntity)
})

test('Given schema with $methods, when factory is called, then it should create an object with all methods from schema', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {},
    $methods: {
      myMethod () {
        return `${this.myProp1}, ${this.myProp2}, ${this.myProp3}`
      }
    }
  }
  const data = {
    myProp1: 'a',
    myProp2: 'b',
    myProp3: 'c'
  }
  const factory = subject(schema)

  const result = factory(data).myMethod()

  t.deepEqual(result, 'a, b, c')
})

test('Given no data, when factory is called, then it should properly return an empty entity', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {}
  }

  const factory = subject(schema)

  const result = factory()

  t.deepEqual(result.toJSON(), {})
})

test('Given data that does not contain any valid property, when factory is called, then it should return an empty entity', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {}
  }

  const factory = subject(schema)

  const result = factory({
    unexistentProp: 'x'
  })

  t.deepEqual(result.toJSON(), {})
})

test('Given schema with property `factory` as Number, when factory is called, then it should return an entity that contains the referred property', t => {
  const schema = {
    myProp1: {
      fatory: Number
    },
    myProp2: {}
  }

  const factory = subject(schema)

  const data = {
    myProp2: '200'
  }

  const result = factory(data)

  t.deepEqual(result.toJSON(), data)
})

test('Given schema with property `factory`, when factory is called with missing data for such property, then it should return an entity that does not contain the referred property', t => {
  const schema = {
    myProp1: {
      fatory: String
    },
    myProp2: {}
  }

  const factory = subject(schema)

  const data = {
    myProp2: 'a'
  }

  const result = factory(data)

  t.deepEqual(result.toJSON(), data)
  t.is(result.myProp1, undefined)
})

test('Given data that is not an object, when factory is called, then it should return an empty entity', t => {
  const schema = {
    myProp1: {},
    myProp2: {},
    myProp3: {},
    toUpperCase: {}, // will it blow up for string?
    length: {} // will it blow up for arrays?
  }

  const factory = subject(schema)

  const invalidParams = [
    null,
    'some string',
    [],
    ['non-empty array'],
    123123,
    Symbol('foo'),
    /regex/
  ]

  invalidParams.map(param => {
    t.deepEqual(factory(param).toJSON(), {})
  })
})

test('Given data with no value for nested entity, when factory is called for parent entity, then the resulting object should not have a property for such nested entity', t => {
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

  const missingData = {
    parentProp1: 'a'
  }

  const result = parentFactory(missingData)

  t.deepEqual(result.toJSON(), missingData)
})

test('Given data with falsy value for nested entity, when factory is called for parent entity, then the resulting object should not have a property for such nested entity', t => {
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

  const falsyValues = [undefined, null, false, '', 0, NaN]

  falsyValues.map(value => {
    const invalidData = {
      parentProp1: 'a',
      childEntity: null
    }

    const result = parentFactory(invalidData)

    t.deepEqual(result.toJSON(), pick(invalidData, ['parentProp1']), `Failed for ${value}`)
  })
})

test('Given data with truthy non-object value for nested entity, when factory is called for parent entity, then the resulting object should have a property with an empty value for such nested entity', t => {
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

  const truthyValues = [true, 'non-empty string', 1]

  truthyValues.map(value => {
    const invalidData = {
      parentProp1: 'a',
      childEntity: true
    }

    const result = parentFactory(invalidData)

    t.deepEqual(result.toJSON().childEntity, {}, `Failed for ${value}`)
  })
})
