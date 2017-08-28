# Speckoloo [![Coverage Status](https://coveralls.io/repos/github/hbarcelos/speckoloo/badge.svg?branch=master)](https://coveralls.io/github/hbarcelos/speckoloo?branch=master)

Domain entities inspired by [Speck][1].

## Motivation

Domain Driven Design is a total new beast when it comes to Node.js/Javascript development. There are not many tools out there to help us.

I was presented to Speck around May'17 by [@guisouza][2], a great piece of work made by him and his former colleagues at Sprinkler.

However, I could not agree to some parts of its design rationale, such as the use of classes, react proptypes and reliance on the `instanceof` operator, so I decided to implement my own version.

To be clear, this is mostly a matter of style and preference. There is a long debate around this and no side is a clear winner, but I tend to agree more with one of them.

## Design rationale

This library is based on two key concepts:

- [OLOO][3]
- [Duck Typing][4]

I prefer OLOO because attempts on simulating classical inheritance are flawed and unneeded in Javascript. Constructors are [essentially broken][5] and the workaround leads to lots of almost-the-same-but-not-quite code, so we cannot rely on `.constructor` properties from objects.

Nominal typing works (barely) only for primitive types (remember that `typeof null === 'object'` :expressionless:), let alone for complex types &mdash; see [`instanceof` lies][6] &mdash; so I also rather use *duck typing* instead of *nominal typing*.

This might cause some discomfort for those used to static-typed languages &mdash; coincidentally those where DDD is more widespread &mdash; but the main point of *duck typing* is that [it's the caller job to honor his side of the contract][7]. So, if you are using this library, but are being unpolite, it will probably blow up on your face. Still, I'll try to provide the most descriptive error messages as possible.

Furthermore, this library will, as much as possible, avoid code duplication for the clients using it and be validation framework agnostic.

Last, but not least, I do solemnly swear to try to not fall into the premature optimization swamp.


## Usage

### Defining a basic schema

To define a schema, simply create an object whose keys are the possible properties descriptors:

```javascript
const mySchema = {
  myProp1: {},
  myProp2: {},
  myProp3: {}
}
```

Then create a entity factory for the defined schema:

```javascript
import { factoryFor } from 'speckoloo'

export default factoryFor(mySchema)
```

Then use the created entity factory to make new entities:

```javascript
import MyEntityFactory from './my-entity'

const data = {
  myProp1: 'a',
  myProp2: 'b',
  myProp3: 'c'
}

const instance = MyEntityFactory(data)
```

The factory will automatically remove undeclared properties from the data:

```javascript
import MyEntityFactory from './my-entity'

const data = {
  myProp1: 'a',
  myProp2: 'b',
  myProp3: 'c',
  nonExistentProp: 'x',
}

const instance = MyEntityFactory(data)
console.log(instance.toJSON())
```

Output:

```javascript
{
  myProp1: 'a',
  myProp2: 'b',
  myProp3: 'c'
}
```

### Tranforming data on creation

To transform data on creation, there is the `factory` property in the schema definition.

Factories are functions with the following signature:
```javascript
Factory(value: Any) => Any
```

Example:

```javascript
import { factoryFor } from 'speckoloo'

const mySchema = {
  myProp1: {
    factory: String // converts any input data to string
  },
  myProp2: {}
}

const MyFactory = factoryFor(mySchema)

const instance = MyFactory({
  prop1: 1,
  prp2: 2
})

console.log(instance.toJSON())
```

Output:

```javascript
{
  prop1: '1', // <--- this is a string
  prp2: 2
}
```

### Defining schema validators

To define a schema with validators, add a property `validator` of type `Validator`.

Validators are functions with the following interface:

```javascript
interface PropertyValidationError {
   error: String | Object | Array
}

Validator(propertyValue: Any, propertyName: String, data: Object) => PropertyValidationError | Any
```

If the validator returns a `ValidationError`, then it's interpreted as the validation has failed for that property. If it return anything else, then it's interpreted as it succeeded.

#### Default validators

`speckoloo` provides 3 default validators:
- `allowAny`: allows any value
- `forbidAny`: forbids any value
- `delegate(context: string)`: delegates the validation to a nested entity.

If no validator is provided for a property, `allowAny` will be used by default:

```javascript
import { factoryFor, defaultValidators } from 'speckoloo'

const mySchema = {
  myProp1: {}
  myProp2: {
    validator: defaultValidators.allowAny // the same as above
  }
}
```

#### Creating custom validators

```javascript
const requiredString = (value, key) => {
  if (value !== String(value)) {
    return {
        error: `Value ${key} must be a string.`
    }
  }
  // Returning `undefined` means the validation has passed
}

const mySchema = {
  myProp1: {
    validator: requiredString
  },
  myProp2: {
    validator: requiredString
  },
  myProp3: {
    validator: requiredString
  }
}
```

### Validating data

Each object created by the factory implements the `Validatable` interface, whose signature is:

```javascript
interface ErrorDetail {
  [property: String]: String
}

interface ValidationError {
  name: 'ValidationError'
  message: String,
  details: ErrorDetail
}

interface Validatable {
  validate(context?: String) => this, throws: ValidationError | Error
}
```

From the example above:

```javascript
import { factoryFor } from 'speckoloo'

const requiredString = (value, key) => {
  if (value !== String(value)) {
    return {
        error: `${key} must be a string.`
    }
  }
  // Returning `undefined` means the validation has passed
}

const mySchema = {
  myProp1: {
    validator: requiredString
  },
  myProp2: {
    validator: requiredString
  },
  myProp3: {
    validator: requiredString
  }
}

const MyEntityFactory = factoryFor(mySchema)

const instance = MyEntityFactory({
  myProp1: 1,
  myProp2: 2,
  myProp3: 3
})

instance.validate() // throws an error
```

The code above will throw a `ValidationError` like the following:

```javascript
{
  name: 'ValidationError'
  message: 'Validation Error!'
  details: {
    myProp1: 'myProp1 must be a string.',
    myProp2: 'myProp2 must be a string.',
    myProp3: 'myProp3 must be a string.'
  }
}
```
### Converting to raw JSON

Each object created by the factory implements the `JSONSerializable` interface, whose signature is:

```javascript
interface JSONSerializable {
  toJSON(context?: String) => Object, throws Error
}
```

`toJSON` will return a raw JSON object with the properties present in the entity.

**NOTICE:** `toJSON` **WILL NOT** validate data before returning it. If an invalid value is present for a given property, it will be returned as is.

From the exact same example above:

```javascript
const instance = MyEntityFactory({
  myProp1: 1,
  myProp2: 2,
  myProp3: 3
})

instance.toJSON() // ignores validation
```

Output:

```javascript
{
  myProp1: 1,
  myProp2: 2,
  myProp3: 3
}
```

Chaining `toJSON()` after `validate()` is a way to be sure only valid data is sent forward:

```javascript
getDataSomehow()
 .then(MyEntityFactory)
 .then(instance =>
    instance.validate()
      .toJSON())
```

### Defining contexts

Entities might have different validation rules for different contexts. Some properties might be required for one context, but not for another.

Consider a `User` entity:

```javascript
const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
}
```

#### Excluding properties

When creating/registering a `User`, probably `id` will not be available yet, so this property should be ignored in context `'create'`.

To create a context, there's a special property called `$contexts` that can be used in the schema definition:

```javascript
const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
  $contexts: {
    create: {
      $exclude: ['id']
    }
  }
}
```

The `$exclude` operator means:
> All properties but the ones specified here.

#### Using only some properties

Also, when such `User` is trying to login into an application, the only properties required are `email` and `password`. So there is also a `login` context defined as follows:

```javascript
const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
  $contexts: {
    create: {
      $exclude: ['id']
    },
    login: {
      $include: ['email', 'password']
    }
  }
}
```

The `$include` operator means:
> Only the properties specified here.

**NOTICE:** You **SHOULD NOT** use both `$include` and `$exclude` in the same context definition. Doing so will trigger a [process warning][8] and `$include` will take precedence.

#### Modifying the validator for a given property

During creation, `password` strength must be enforced. For all other contexts, it could simply be a valid `string`. To achive this, there is the `$modify` operator, that allows changing the validator for a property only for the context.

Instead of an array, `$modify` expects an `object` containing property-validator pairs, such as follows:

```javascript
const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
  $contexts: {
    create: {
      $exclude: ['id'],
      $modify: {
        password: passwordStrengthChecker
      }
    },
    login: {
      $include: ['email', 'password']
    }
  }
}
```

**NOTICE:** `$modify` can be combined with both `$includes` and `$excludes`, but will only be applied for properties included or not excluded, respectively. Example:

```javascript
const schema = {
  prop1: requiredString,
  prop2: requiredString,
  $contexts: {
    context1: {
      $exclude: ['prop1'],
      $modify: {
        prop1: otherValidator // will be silently ignored
      }
    },
    context2: {
      $include: ['prop1'],
      $modify: {
        prop2: otherValidator // will be silently ignored
      }
    }
  }
}
```

### Using context-aware validation

To make use of the defined contexts for validation, there is the `context` param of `validate()`.

```javascript
import { factoryFor } from 'speckoloo'

const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
  $contexts: {
    create: {
      $exclude: ['id'],
      $modify: {
        password: passwordStrengthChecker
      }
    },
    login: {
      $include: ['email', 'password']
    }
  }
}

const UserFactory = factoryFor(schema)

const user = UserFactory({
  email: 'some.email@domain.com',
  password: 'dummyPass@1234'
})

user.validate('login') // doesn't throw!
```

### Converting to context-aware raw JSON

The defined contexts can also be used to build a raw JSON object. There is also the `context` param of `toJSON()`.

```javascript
import { factoryFor } from 'speckoloo'

const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
  $contexts: {
    create: {
      $exclude: ['id'],
      $modify: {
        password: passwordStrengthChecker
      }
    },
    login: {
      $include: ['email', 'password']
    }
  }
}

const UserFactory = factoryFor(schema)

const user = UserFactory({
  id: '1234'
  name: 'SomeUser',
  email: 'some.email@domain.com',
  password: 'dummyPass@1234'
})

console.log(user.toJSON('login'))
```

Output:

```javascript
{
  name: 'SomeUser',
  email: 'some.email@domain.com'
}
```

### Composed entities

When an entity contains a reference to other entity, to automatically convert raw data into a nested entity, use the `factory` property on schema definition:

```javascript
const childSchema = {
  childProp1: {
    validator: requiredString
  },
  childProp2: {
    validator: requiredString
  }
}

const ChildFactory = factoryFor(childSchema)

const parentSchema = {
  prop1: {
    validator: requiredString
  }
  child: {
    factory: ChildFactory
  }
}

const ParentFactory = factoryFor(parentSchema)

const instance = ParentFactory({
  prop1: 1
  child: {
    childProp1: 'a',
    childProp2: 'b'
  }
})
```

In the example above, `child` will be an entity created by `ChildFactory`.

#### Converting composed entities to raw JSON

When calling `toJSON()` on a composed entity, it will automatically convert the nested entity by calling `toJSON()` on it as well.

From the example above:

```javascript
const instance = ParentFactory({
  prop1: 1
  child: {
    childProp1: 'a',
    childProp2: 'b'
  }
})

console.log(instance.toJSON())
```

Will output:

```javascript
{
  prop1: 1
  child: {
    childProp1: 'a',
    childProp2: 'b'
  }
}
```

### Validating composed entities

Since the default validator for any property is `allowAny`, to make a composed entity validate the nested one requires an explicit validator that will delegate the validation process to the latest.

Since this is a rather common use case, `speckoloo` provides a default validator called `delegate`.

Redefining the `parentSchema` above:

```javascript
import { factoryFor, defaultValidators } from 'speckoloo'

// ...
const parentSchema = {
  prop1: {
    validator: requiredString
  }
  child: {
    factory: ChildFactory,
    validator: defaultValidators.delegate() // <--- Notice that `delegate` is a function!
  }
}

//...

const instance = ParentFactory({
    prop1: 1,
    child: {
        childProp1: 1,
        childProp2: 2
    }
})

instance.validate() // throws an error
```

Will throw:

```javascript
{
  name: 'ValidationError'
  message: 'Validation Error!'
  details: {
    prop1: 'prop1 must be a string.',
    child: {
      childProp1: 'childProp1 must be a string.',
      childProp1: 'childProp1 must be a string.'
    }
  }
}
```

Optionally it's possible to specify a context for the `delegate` function, that will be forwarded to the nested entity `validate()` method:

```javascript
// ...

const parentSchema = {
  prop1: {
    validator: requiredString
  }
  child: {
    factory: ChildFactory,
    validator: defaultValidators.delegate('someContext')
  }
}

// ...

instance.validate() // <--- Will call child.validate('someContext')
```

A common use case is validating the composed entity on context `"A"`, in which the nested entity must be in context `"B"`. In this case, `delegate` can be combined with `$modify` operator for context definition:

```javascript
// ...

const parentSchema = {
  prop1: {
    validator: requiredString
  }
  child: {
    factory: ChildFactory,
    validator: defaultValidators.delegate()
  },
  $contexts: {
    A: {
      $modify: {
        child: defaultValidators.delegate('B')
      }
    }
  }
}

// ...

instance.validate('A') // <--- Will call child.validate('B')
```

 [1]: https://github.com/scup/speck
 [2]: https://github.com/guisouza
 [3]: https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch6.md
 [4]: https://pt.wikipedia.org/wiki/Duck_typing
 [5]: https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#constructors
 [6]: https://medium.com/javascript-scene/common-misconceptions-about-inheritance-in-javascript-d5d9bab29b0a
 [7]: https://softwareengineering.stackexchange.com/a/305880/91694
 [8]: https://nodejs.org/api/process.html#process_event_warning
