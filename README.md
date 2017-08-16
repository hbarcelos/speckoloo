# Speckoloo

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

### Defining a schema

To define a schema, simply create an object whose keys are the possible fields descriptors:

```javascript
// my-entity.js
const mySchema = {
  myProp1: {}
  myProp2: {}
  myProp3: {}
}
```

Then create a entity factory for the defined schema:

```javascript
// my-entity.js (cont)
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

>     {
>       myProp1: 'a',
>       myProp2: 'b',
>       myProp3: 'c'
>     }


 [1]: https://github.com/scup/speck
 [2]: https://github.com/guisouza
 [3]: https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch6.md
 [4]: https://pt.wikipedia.org/wiki/Duck_typing
 [5]: https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md#constructors
 [6]: https://medium.com/javascript-scene/common-misconceptions-about-inheritance-in-javascript-d5d9bab29b0a
 [7]: https://softwareengineering.stackexchange.com/a/305880/91694
