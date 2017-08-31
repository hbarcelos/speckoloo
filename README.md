# Speckoloo

[![Node Version](https://img.shields.io/badge/node-%3E=6.0.0-green.svg)](https://nodejs.org) [![Coverage Status](https://coveralls.io/repos/github/hbarcelos/speckoloo/badge.svg?branch=master)](https://coveralls.io/github/hbarcelos/speckoloo?branch=master) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Domain entities inspired by [Speck][1].

## ToC

* [Motivation](#motivation)
* [Design rationale](#design-rationale)
* [Functionalities](#functionalities)
* [Interfaces](#interfaces)
* [Installation](#installation)
  + [NPM](#npm)
  + [Manually](#manually)
* [Usage](#usage)
  + [Schemas](#schemas)
    - [Basic structure](#basic-structure)
    - [Validators](#validators)
      * [Default validators](#default-validators)
      * [Creating custom validators](#creating-custom-validators)
    - [Factory](#factory)
    - [Methods](#methods)
    - [Contexts](#contexts)
      * [Exclude properties](#exclude-properties)
      * [Include only some properties](#include-only-some-properties)
      * [Modifying the validator of a property](#modifying-the-validator-of-a-property)
  + [Validation](#validation)
    - [Default validation](#default-validation)
    - [Context-aware validation](#context-aware-validation)
  + [Serialization](#serialization)
    - [Default serialization](#default-serialization)
    - [Context-aware serialization](#context-aware-serialization)
  + [Composite entities](#composite-entities)
    - [Composite entities serialization](#composite-entities-serialization)
    - [Composite entities validation](#composite-entities-validation)
  + [Collection entities](#collection-entities)
    - [Get an entity from a collection](#get-an-entity-from-a-collection)
    - [Iterate over a collection](#iterate-over-a-collection)
    - [Collection serialization](#collection-serialization)
    - [Collection validation](#collection-validation)
    - [Nested collections](#nested-collections)
* [Contributing](#contributing)

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

## Functionalities

`speckoloo` provides the following capabilities:

- **State** storage: holds data belonging to the entities
- Data **validation**: validates entity data against a provided schema.
- Data **(de)serialization**: converts data from and to plain old JSON objects.
- Data **composition**: allows entities to reference one another.

All functions related to the above concerns will be called **synchronously**.

## Interfaces

Each object created by `speckoloo` factories implements the  `Validatable` and the `JSONSerializable` interfaces, defined bellow:

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

interface JSONSerializable {
  toJSON(context?: String) => Object, throws Error
}
```

- `toJSON`: returns a raw JSON object with the properties present in the entity.
- `validate`: returns the object itself if its data is valid or throws a `ValidationError`

Both `toJSON` and `validate` methods are [context][9]-aware and may receive an optional `context` param. If such context doesn't exist, both will throw an `Error`.

## Installation

### NPM

```bash
npm install --save speckoloo
```

### Manually

```bash
git clone https://github.com/hbarcelos/speckoloo.git
cd speckoloo
npm install
npm run build
```

## Usage

### Schemas

#### Basic structure
To define a schema, simply create an object whose keys are the possible properties descriptors:

```javascript
import { factoryFor } from 'speckoloo'

const mySchema = {
  myProp1: {},
  myProp2: {},
  myProp3: {}
}

const myEntityFactory = factoryFor(mySchema)

const instance = myEntityFactory({
  myProp1: 'a',
  myProp2: 'b',
  myProp3: 'c'
})
```

#### Validator

To define a schema with validators, add a property `validator` of type `Validator`.

Validators are functions with the following interface:

```javascript
interface PropertyValidationError {
   error: String | Object
}

Validator(propertyValue: Any, propertyName: String, data: Object) => PropertyValidationError | Any
```

If the validator returns a `ValidationError`, then it's interpreted as the validation has failed for that property. If it return anything else, then it's interpreted as it succeeded.

##### Default validators

`speckoloo` provides 3 default validators:
- `allowAny`: allows any value
- `forbidAny`: forbids any value
- `delegate(context?: string, options?:object)`: delegates the validation to a nested entity.

If no validator is provided for a property, `allowAny` will be used by default:

```javascript
const mySchema = {
  myProp1: {}
  myProp2: {
    validator: defaultValidators.allowAny // the same as above
  }
}
```

##### Creating custom validators

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

#### Factory

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

console.log(instance.prop1)
```

Output:

```javascript
'1' // <--- this is a string
```

#### Methods

An important part of DDD rationale is that entities should be self-contained in terms of business logic that relates only to them.

For example, imagine the domain is a simple drawing application, where there are the entities `Square` and `Circle`.. One of the functionalities is ot calculate the area of the drawn objects. The logic for calculating the area of the object should be within itself. To achive this with `speckoloo`, there is the special property `$methods` in schema definition:

```javascript
import { factoryFor } from 'speckoloo'

const circleSchema = {
  radius: {
    validatior: positiveNumber,
    factory: Number
  },
  $methods: {
    getArea() {
      return Math.PI * this.radius * this.radius
    }
  }
}

const squareSchema = {
  side: {
    validatior: positiveNumber,
    factory: Number
  },
  $methods: {
    getArea() {
      return this.side * this.side
    }
  }
}

const circleFactory = factoryFor(circleSchema)
const squareFactory = factoryFor(squareSchema)

const circle = circleFactory({ radius: 2 })
const square = squareFactory({ side: 4 })

console.log('Circle area: ', circle.getArea())
console.log('Square area: ', square.getArea())
```

Output:
```
Circle area: 12.566370614359172
Square area: 16
```

All functions in `$methods` are attached to the entity &mdash; so `this` refers to the entity itself &mdash; as non-enumerable, non-configurable, read-only properties.

#### Contexts

Entities might have different validation rules for different contexts. Some properties might be required for one context, but not for another.

To create a context, there's a special property called `$contexts` that can be used in the schema definition. The `$contexts` object has the following structure:

```javascript
{
  [contextName]: {
     [operator]: Object | Array
  }
}
```

Currently available operators are:
- `$include`: considers only the given properties for the context.
- `$exclude`: removes the given properties from the context.
- `$modify`: changes the validators for the specified properties.

Consider a `User` entity:

```javascript
const schema = {
  id: requiredString,
  name: requiredString,
  email: requiredEmail,
  password: requiredString,
}
```

##### Exclude properties

When creating/registering a `User`, probably `id` will not be available yet, so this property should be ignored in context `'create'`.

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

##### Include only some properties

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

**NOTICE:** You **SHOULD NOT** use both `$include` and `$exclude` in the same context definition. Doing so will trigger a [process warning][8] and `$include` will take precedence.

##### Modifying the validator of a property

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

### Validation

`validate` will throw a `ValidationError` when data is invalid or return the object itself otherwise (use this for chaining).

#### Default validation

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

#### Context-aware validation

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

### Serialization

#### Default serialization

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

#### Context-aware serialization

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

### Composite entities

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

#### Composite entities serialization

When calling `toJSON()` on a composite entity, it will automatically convert the nested entity by calling `toJSON()` on it as well.

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

#### Composite entities validation

Since the default validator for any property is `allowAny`, to make a composite entity validate the nested one requires an explicit validator that will delegate the validation process to the latest.

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

It's possible to specify a context for the `delegate` function, that will be forwarded to the nested entity `validate()` method:

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

---

**NOTICE:** By default, `delegate` will not validate the entity when data is missing.

```javascript
const parentSchema = {
  prop1: {
    validator: requiredString
  }
  child: {
    factory: ChildFactory,
    validator: defaultValidators.delegate()
  }
}

const parentFactory = factoryFor(parentSchema)

const instance = parentFactory({
  prop1: 'a'
})

// ...

instance.validate() // <--- Will return the instance itself
```

To change this behavior, there is a `required` param in `options` that can be used:

```javascript
const parentSchema = {
  prop1: {
    validator: requiredString
  }
  child: {
    factory: ChildFactory,
    validator: defaultValidators.delegate({ required: true }) // <----- changed here
  }
}

const parentFactory = factoryFor(parentSchema)

const instance = parentFactory({
  prop1: 'a'
})

// ...

instance.validate() // <--- Will throw
```

Output:

```javascript
{
  name: 'ValidationError',
  message: 'Validation Error!',
  details: {
    child: '`child` is required'
  }
}
```

It's also possible to combine both `context` with `options`. Use `context` as first argument and `options` as second:

```javascript
defaultValidators.delegate('myContext', { required: true })
```

---

A common use case is validating the composite entity on context `"A"`, in which the nested entity must be in context `"B"`. In this case, `delegate` can be combined with `$modify` operator for context definition:

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

### Collection entities

Collection entities represent a list of individual entities. As an individual entity, they implement both `Validatable` and `JSONSerializable`.

It also implements the `RandomAccessibleList` to allow an array-like access to its individual properties.

```javascript
interface RandomAccessibleList {
  at(n: Number) => Any
}
```

Furthermore, they implement the native ES6 `Iterable` interface.

Example:

```javascript
import { factoryFor, collectionFactoryFor } from 'speckoloo'

const entitySchema = {
  myProp1: {
    validator: requiredString
  }
}

const entityFactory = factoryFor(entitySchema)

const collectionFactory = collectionFactoryFor(entityFactory)

const collection = collectionFactory([{
    myProp1: 'a'
}, {
    myProp1: 'b'
}])
```

#### Get an entity from a collection

Use the `at` method:

```javascript
console.log(collection.at(0).toJSON())
```

Output:

```javascript
{ myProp1: 'a' }
```

#### Iterate over a collection

Collections can be iterated with a `for..of` loop as regular arrays:

```javascript
for (let entity of collection) {
  console.log(entity.toJSON())
}
```

Output:

```javascript
{ myProp1: 'a' }
{ myProp1: 'b' }
```

However, common array operations as `map`, `filter` or `reduce` are not implemented. To use them, first convert a collection to a regular array using `Array.from`:

```javascript
console.log(Array.from(collection).map(entity => entity.myProp1))
```

Output:
```javascript
['a', 'b']
```

#### Collection serialization

Calling `toJSON` on a collection will generate a regular array containing plain JSON objects, created by calling `toJSON` on each individual entity in the collection:

```javascript
console.log(collection.toJSON())
```

Output:

```javascript
[
  { myProp1: 'a' },
  { myProp1: 'b' }
]
```

When passing the optional `context` parameter, its value will be used when calling `toJSON` on each individual entity.

#### Collection validation

Calling `validate` will return a reference to the collection itself if all entities are valid. Otherwise, it will throw an array of `ValidationError`, containing the validation errors for the invalid entities:

```javascript
import { factoryFor, collectionFactoryFor } from 'speckoloo'

const entitySchema = {
  myProp1: {
    validator: requiredString
  }
}

const entityFactory = factoryFor(entitySchema)

const collectionFactory = collectionFactoryFor(entityFactory)

const collection = collectionFactory([{
    myProp1: 1
}, {
    myProp1: 'a'
}, {
    myProp1: 2
}])

collection.validate() // <--- will throw!
```

Output:

```javascript
{
  'item#0': {
    myProp1: 'Value myProp1 must be a string.'
  },
  'item#2': {
    myProp1: 'Value myProp1 must be a string.'
  }
}
```

The `item#<n>` key indicates which of the entities in the collection are invalid.

#### Nested collections

It's possible to use collections as nested entitties for a composite entity. All it takes is put a collection factory into a `factory` property from the schema.

Example:

```javascript
const singleSchema = {
  prop1: {},
  prop2: {}
}

const singleFactory = factoryFor(singleSchema)

const collectionFactory = subject(singleFactory)

const compositeSchema = {
  compositeProp1: {
    validator: requiredString
  },
  nestedCollection: {
    validator: defaultValidators.delegate(),
    factory: collectionFactory
  }
}

const compositeFactory = factoryFor(compositeSchema)

const instance = compositeFactory({
  compositeProp1: 'x'
  nestedCollection: [
    {
        prop1: 'a',
        prop2: 'b'
    },
    {
        prop1: 'c',
        prop2: 'd'
    }
  ]
})

instance.validate() // will call validate for each entity
```

## Contributing

Feel free to open an issue, fork or create a PR.

`speckoloo` uses [StandardJS][10] and I'm willing to keep it production dependency-free.

Before creating a PR, make sure you run:

```bash
npm run lint && npm run test
```

---

Some missing features:

- Support for getters and setters in schema definition.
- Support for general collection methods, such as `map`, `filter`, `reduce`, etc.


 [1]: https://github.com/scup/speck
 [2]: https://github.com/guisouza
 [3]: https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch6.md
 [4]: https://pt.wikipedia.org/wiki/Duck_typing
 [5]: https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#constructors
 [6]: https://medium.com/javascript-scene/common-misconceptions-about-inheritance-in-javascript-d5d9bab29b0a
 [7]: https://softwareengineering.stackexchange.com/a/305880/91694
 [8]: https://nodejs.org/api/process.html#process_event_warning
 [9]: https://martinfowler.com/bliki/BoundedContext.html
 [10]: https://standardjs.com/
