import { test } from 'ava'
import subject from './build-schema'

import { allowAny, forbidAny } from './default-validators'
import { omit, pick } from './common'
import * as fixtures from './build-schema.fixture'

test('[Structure] Given schema definition, when final schema is built, then it should have created the default schema', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithoutCustomValidators
  const result = subject(definition, $contexts)

  t.truthy(result.default)
})

test('[Structure] Given schema definition with no contexts, when final schema is built, then it should be no extra keys in it', t => {
  const expectedKeys = ['default']

  const { $contexts = {}, ...definition } = fixtures.schemaWithoutCustomValidators
  const result = subject(definition, $contexts)

  t.deepEqual(Object.keys(result), expectedKeys)
})

test('[Structure] Given schema definition with no contexts, when final schema is built, then it should be no extra keys in it', t => {
  const expectedKeys = ['default']

  const { $contexts = {}, ...definition } = fixtures.schemaWithoutCustomValidators
  const result = subject(definition, $contexts)

  t.deepEqual(Object.keys(result), expectedKeys)
})

test('[Structure] Given schema definition with no contexts, when final schema is built, then it should have created the default schema with all keys from definition', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithoutCustomValidators

  const expectedKeys = Object.keys(definition)

  const result = subject(definition, $contexts)

  t.deepEqual(Object.keys(result.default), expectedKeys)
})

test('[Structure] Given schema definition with context, when final schema is built, then it should create a context schema', t => {
  const expectedKeys = ['default', 'myContext']

  const { $contexts = {}, ...definition } = fixtures.schemaWithContext
  const result = subject(definition, $contexts)

  t.deepEqual(Object.keys(result), expectedKeys)
})

test('[Structure] Given schema definition with context, when final schema is built, then it should not have a `$contexts` property on default schema', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContext
  const result = subject(definition, $contexts)

  t.false(result.default.hasOwnProperty('$contexts'))
})

test('[Validators] Given schema definition with no validators, when final schema is built, then it should use the default `allowAny` validator for leaf fields', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithoutCustomValidators
  const result = subject(definition, $contexts)

  t.is(result.default.field1.validator, allowAny)
  t.is(result.default.childEntity.validator, allowAny)
})

test('[Validators] Given schema definition with validators, when final schema is built, then it should not override the validator from definition', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithCustomValidators
  const result = subject(definition, $contexts)

  t.is(result.default.field1.validator, fixtures.schemaWithCustomValidators.field1.validator)
  t.is(result.default.childEntity.validator, fixtures.schemaWithCustomValidators.childEntity.validator)
})

test('[Skippable] Given schema definition with no `skippable` option, when final schema is built, then it should have a `skippable` option defined to `false`', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithCustomValidators
  const result = subject(definition, $contexts)

  t.is(result.default.field1.skippable, false)
  t.is(result.default.childEntity.skippable, false)
})

test('[Skippable] Given schema definition with `skippable` option, when final schema is built, then it should have a `skippable` option as defined in schema', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithSkippable
  const result = subject(definition, $contexts)

  t.is(result.default.field1.skippable, fixtures.schemaWithSkippable.field1.skippable)
})

test('[Contexts] Given schema definition with a context using `$exclude`, when final schema is built, then it should have a context schema excluding the properties declared', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextExclude
  const result = subject(definition, $contexts)

  t.deepEqual(result.contextWithExclude, omit(result.default, ['field1']))
})

test('[Contexts] Given schema definition with a context using `$include`, when final schema is built, then it should have a context schema including only the properties declared', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextInclude
  const result = subject(definition, $contexts)

  t.deepEqual(result.contextWithInclude, pick(result.default, ['field1']))
})

test('[Contexts] Given schema definition with a context using both `$include` and `$exclue`, when final schema is built, then it should have a context schema including only the properties declared in `$include`', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextIncludeAndExclude
  const result = subject(definition, $contexts)

  t.deepEqual(result.contextWithIncludeAndExclude, pick(result.default, ['field1']))
})

test('[Contexts] Given schema definition with a context using `$modify`, when final schema is built, then it should have a context schema changing only the declared validators', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextModify
  const result = subject(definition, $contexts)

  t.deepEqual(omit(result.contextWithModify, ['field1']), omit(result.default, ['field1']))
  t.is(result.contextWithModify.field1.validator, forbidAny)
})

test('[Contexts] Given schema definition with a context using `$modify` with extra properties, when final schema is built, then it should not create new properties in the result', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextModifyUnspecifiedProp
  const result = subject(definition, $contexts)

  t.is(result.contextWithModifyUnspecifiedProp.unespecifiedField1, undefined)
})

test('[Contexts] Given schema definition with a context using `$include` and `$modify`, when final schema is built, then it should modify only the properties in `$include`', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextIncludeAndModify
  const result = subject(definition, $contexts)

  t.is(result.contextWithIncludeAndModify.field1.validator, forbidAny)
  t.is(result.contextWithIncludeAndModify.field2, undefined)
})

test('[Contexts] Given schema definition with a context using `$exclude` and `$modify`, when final schema is built, then it should modify only the properties not in `$exclude`', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextExcludeAndModify
  const result = subject(definition, $contexts)

  t.is(result.contextWithExcludeAndModify.field1, undefined)
  t.is(result.contextWithExcludeAndModify.field2.validator, forbidAny)
  t.deepEqual(
    omit(result.contextWithExcludeAndModify, ['field1', 'field2']),
    omit(result.default, ['field1', 'field2'])
  )
})

test('[Contexts] Given schema definition with a context using `$skip`, when final schema is built, then it should modify only the properties in `$skip` to have the values set for `skippable` option', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithContextSkip
  const result = subject(definition, $contexts)

  t.is(result.contextWithSkip.field1.skippable, true)
})

test('[Contexts] Given schema definition with multiple contexts, when final schema is built, then all contexts should be available', t => {
  const { $contexts = {}, ...definition } = fixtures.schemaWithMultipleContexts
  const result = subject(definition, $contexts)

  t.true(result.hasOwnProperty('context1'))
  t.true(result.hasOwnProperty('context2'))
})
