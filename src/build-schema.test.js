import { test } from 'ava'
import { allowAny, delegate } from './default-validators'
import subject from './build-schema'

const someFactory = () => ({})

const someValidator = () => ({})

const schemaWithoutCustomValidators = {
  field1: {},
  childEntity: {
    factory: someFactory
  }
}

const schemaWithCustomValidators = {
  field1: {
    validator: someValidator
  },
  childEntity: {
    factory: someFactory,
    validator: someValidator
  }
}

test('Given schema with no validators, when final schema is built, then it should use the default `allowAny` validator for leaf fields', t => {
  const result = subject(schemaWithoutCustomValidators)
  t.is(result.field1.validator, allowAny)
  t.is(result.childEntity.validator, allowAny)
})

test('Given schema with validators, when final schema is built, then it should not override the validator from definition', t => {
  const result = subject(schemaWithCustomValidators)

  t.is(result.field1.validator, schemaWithCustomValidators.field1.validator)
  t.is(result.childEntity.validator, schemaWithCustomValidators.childEntity.validator)
})
