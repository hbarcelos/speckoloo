import { test } from 'ava'
import { factoryFor, collectionFactoryFor, defaultValidators } from './index'
import { omit, pick } from './common'

const validators = {
  requiredString: (value, field, data) => {
    if (typeof value !== 'string') {
      return {
        error: [`${field} should be a non-empty string`]
      }
    }

    return { data }
  },
  requiredNumber: (value, field, data) => {
    if (typeof value !== 'number') {
      return {
        error: [`${field} should be a valid number`]
      }
    }

    return { data }
  }
}

test('Given entity with validation and valid data, when validate is called, then it should not throw and return itself', t => {
  const schema = {
    prop1: {
      validator: validators.requiredString
    }
  }

  const validData = {
    prop1: 'a'
  }

  const factory = factoryFor(schema)

  const instance = factory(validData)

  const result = instance.validate()

  t.is(result, instance)
})

test('Given entity with validation and invalid data, when validate is called, then it should throw', t => {
  const schema = {
    prop1: {
      validator: validators.requiredString
    },
    prop2: {
      validator: validators.requiredString
    }
  }

  const invalidData = {
    prop1: 'a'
  }

  const factory = factoryFor(schema)

  const instance = factory(invalidData)

  const error = t.throws(() => { instance.validate() })
  t.is(error.name, 'ValidationError')
  t.true(error.details.hasOwnProperty('prop2'))
})

test('Given entity with nested entity and valid data, when validate is called, then it should not throw and return itself', t => {
  const childSchema = {
    childProp1: {
      validator: validators.requiredString
    }
  }
  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    childEntity: {
      validator: defaultValidators.delegate(),
      factory: childFactory
    }
  }
  const parentFactory = factoryFor(parentSchema)

  const validData = {
    childEntity: {
      childProp1: 'a'
    }
  }

  const instance = parentFactory(validData)

  const result = instance.validate()

  t.is(result, instance)
})

test('Given entity with missing validator for primitive properties, when validate is called, then it should not throw  and return itself', t => {
  const schema = {
    prop1: {},
    prop2: {}
  }

  const emptyData = {}

  const factory = factoryFor(schema)

  const instance = factory(emptyData)

  const result = instance.validate()
  t.is(result, instance)
})

test('Given entity with missing validator for nested entity property with valid data, when validate is called, then it should not throw and return itself', t => {
  const childSchema = {
    childProp1: {
      validator: validators.requiredString
    },
    childProp2: {
      validator: validators.requiredString
    }
  }
  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    childEntity: {
      factory: childFactory
    }
  }
  const parentFactory = factoryFor(parentSchema)

  const validData = {
    childEntity: {
      childProp1: 'a',
      childProp2: 'a'
    }
  }

  const instance = parentFactory(validData)

  const result = instance.validate()
  t.is(result, instance)
})

test('Given entity with missing validator for nested entity property with invalidData, when validate is called, then it should not throw and return itself', t => {
  const childSchema = {
    childProp1: {
      validator: validators.requiredString
    },
    childProp2: {
      validator: validators.requiredString
    }
  }
  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    childEntity: {
      factory: childFactory
    }
  }
  const parentFactory = factoryFor(parentSchema)

  const invalidData = {
    childEntity: {
      childProp1: 'a'
    }
  }

  const instance = parentFactory(invalidData)

  const result = instance.validate()
  t.is(result, instance)
})

test('Given entity with nested entity with `delegate` validator and invalid data, when validate is called, then it should throw', t => {
  const childSchema = {
    childProp1: {
      validator: validators.requiredString
    },
    childProp2: {
      validator: validators.requiredString
    }
  }
  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    childEntity: {
      validator: defaultValidators.delegate(),
      factory: childFactory
    }
  }
  const parentFactory = factoryFor(parentSchema)

  const invalidData = {
    childEntity: {
      childProp1: 'a'
    }
  }

  const instance = parentFactory(invalidData)

  const error = t.throws(() => instance.validate())
  t.is(error.name, 'ValidationError')
  t.true(error.details.hasOwnProperty('childEntity'))
  t.true(error.details.childEntity.hasOwnProperty('childProp2'))
})

test('Given entity with nested entity with `delegate` validator for a given context and valid data for such context, when validate is called, then it should not throw and return itself', t => {
  const childSchema = {
    childProp1: {
      validator: validators.requiredString
    },
    childProp2: {
      validator: validators.requiredString
    },
    $contexts: {
      myContext: {
        $exclude: ['childProp2']
      }
    }
  }
  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    childEntity: {
      validator: defaultValidators.delegate('myContext'),
      factory: childFactory
    }
  }
  const parentFactory = factoryFor(parentSchema)

  const validDataForContext = {
    childEntity: {
      childProp1: 'a'
    }
  }

  const instance = parentFactory(validDataForContext)

  t.is(instance.validate(), instance)
})

test('Given entity with context that excludes `prop2` and invalid data `prop2`, when validate is called with such context, then it should not throw and return itself', t => {
  const schema = {
    prop1: {
      validator: validators.requiredString
    },
    prop2: {
      validator: validators.requiredString
    },
    $contexts: {
      myContext: {
        $exclude: ['prop2']
      }
    }
  }

  const invalidData = {
    prop1: 'a'
  }

  const factory = factoryFor(schema)

  const instance = factory(invalidData)

  const result = instance.validate('myContext')

  t.is(result, instance)
})

test('Given entity with context that modifies `prop2` and valid data for such context, when validate is called with such context, then it should use the validator from the context definition', t => {
  const schema = {
    prop1: {
      validator: validators.requiredString
    },
    prop2: {
      validator: validators.requiredString
    },
    $contexts: {
      myContext: {
        $modify: {
          prop2: validators.requiredNumber
        }
      }
    }
  }

  const validDataForContext = {
    prop1: 'a',
    prop2: 1
  }

  const factory = factoryFor(schema)

  const instance = factory(validDataForContext)

  const result = instance.validate('myContext')

  t.is(result, instance)
})

test('Given entity with context that excludes `prop2`, when `toJSON()` is called with such context, then it should omit `prop2` from the result', t => {
  const schema = {
    prop1: {},
    prop2: {},
    $contexts: {
      myContext: {
        $exclude: ['prop2']
      }
    }
  }

  const validData = {
    prop1: 'a',
    prop2: 'b'
  }

  const factory = factoryFor(schema)

  const instance = factory(validData)

  const result = instance.toJSON('myContext')

  t.deepEqual(result, omit(validData, ['prop2']))
})

test('Given entity with context that includes `prop1`, when `toJSON()` is called with such context, then it should return an object containing only `prop1`', t => {
  const schema = {
    prop1: {},
    prop2: {},
    $contexts: {
      myContext: {
        $include: ['prop1']
      }
    }
  }

  const validData = {
    prop1: 'a',
    prop2: 'b'
  }

  const factory = factoryFor(schema)

  const instance = factory(validData)

  const result = instance.toJSON('myContext')

  t.deepEqual(result, pick(validData, ['prop1']))
})

test('Given invalid context, when `validate()` is called, then it should throw an error', t => {
  const schema = {
    prop1: {}
  }

  const validData = {
    prop1: 'a'
  }

  const factory = factoryFor(schema)

  const instance = factory(validData)

  const error = t.throws(() => instance.validate('unexistentContext'))

  t.regex(error.message, /invalid context/i)
})

test('Given invalid context, when `toJSON()` is called, then it should throw an error', t => {
  const schema = {
    prop1: {}
  }

  const validData = {
    prop1: 'a'
  }

  const factory = factoryFor(schema)

  const instance = factory(validData)

  const error = t.throws(() => instance.toJSON('unexistentContext'))

  t.regex(error.message, /invalid context/i)
})

test('Give entity with nested entity collection and valid data, when `toJSON()` is called, then it should return the original data', t => {
  const childSchema = {
    childProp1: {},
    childProp2: {}
  }

  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    children: {
      factory: collectionFactoryFor(childFactory)
    }
  }

  const factory = factoryFor(parentSchema)

  const validData = {
    children: [{
      childProp1: 'a',
      childProp2: 'b'
    }, {
      childProp1: 'c',
      childProp2: 'd'
    }]
  }

  const instance = factory(validData)

  t.deepEqual(instance.toJSON(), validData)
})

test('Give entity with nested entity collection and invalid data, when `validate()` is called, then it should throw an error with appropriate error descriptions', t => {
  const childSchema = {
    childProp1: {
      validator: defaultValidators.forbidAny
    },
    childProp2: {
      validator: defaultValidators.forbidAny
    }
  }

  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    children: {
      validator: defaultValidators.delegate(),
      factory: collectionFactoryFor(childFactory)
    }
  }

  const factory = factoryFor(parentSchema)

  const validData = {
    children: [{
      childProp1: 'a',
      childProp2: 'b'
    }, {
      childProp1: 'c',
      childProp2: 'd'
    }]
  }

  const instance = factory(validData)

  const error = t.throws(() => instance.validate())

  t.true(error.details.children.length === 2)
  t.truthy(error.details.children[0].childProp1)
  t.truthy(error.details.children[0].childProp2)
  t.truthy(error.details.children[1].childProp1)
  t.truthy(error.details.children[1].childProp2)
})

test('Given entity with nested entity with <context> and overriden `delegate` validator for a given context and valid data for such context, when `validate(<context>)` is called, then it should not throw and return itself', t => {
  const childSchema = {
    childProp1: {
      validator: validators.requiredString
    },
    childProp2: {
      validator: validators.requiredString
    },
    $contexts: {
      myContext: {
        $exclude: ['childProp2']
      }
    }
  }
  const childFactory = factoryFor(childSchema)

  const parentSchema = {
    childEntity: {
      validator: defaultValidators.delegate(),
      factory: childFactory
    },
    $contexts: {
      parentContext: {
        $modify: {
          childEntity: defaultValidators.delegate('myContext')
        }
      }
    }
  }
  const parentFactory = factoryFor(parentSchema)

  const validDataForContext = {
    childEntity: {
      childProp1: 'a'
    }
  }

  const instance = parentFactory(validDataForContext)

  t.is(instance.validate('parentContext'), instance)
})
