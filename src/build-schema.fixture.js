import { forbidAny } from './default-validators'

const someFactory = () => ({})

const someValidator = () => ({})

export const schemaWithoutCustomValidators = {
  field1: {},
  childEntity: {
    factory: someFactory
  }
}

export const schemaWithSkippable = {
  field1: {
    validator: forbidAny,
    skippable: true
  }
}

export const schemaWithDefault = {
  field1: {
    default: '__default__'
  }
}

export const schemaWithCustomValidators = {
  field1: {
    validator: someValidator
  },
  childEntity: {
    factory: someFactory,
    validator: someValidator
  }
}

export const schemaWithContext = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    myContext: {}
  }
}

export const schemaWithContextExclude = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithExclude: {
      $exclude: ['field1']
    }
  }
}

export const schemaWithContextInclude = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithInclude: {
      $include: ['field1']
    }
  }
}

export const schemaWithContextIncludeAndExclude = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithIncludeAndExclude: {
      $include: ['field1'],
      $exclude: ['field3']
    }
  }
}

export const schemaWithContextModify = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithModify: {
      $modify: {
        field1: forbidAny
      }
    }
  }
}

export const schemaWithContextSkip = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithSkip: {
      $skip: ['field1']
    }
  }
}

export const schemaWithContextModifyUnspecifiedProp = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithModifyUnspecifiedProp: {
      $modify: {
        unespecifiedField1: forbidAny
      }
    }
  }
}

export const schemaWithContextIncludeAndModify = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithIncludeAndModify: {
      $include: ['field1'],
      $modify: {
        field1: forbidAny,
        field2: forbidAny
      }
    }
  }
}

export const schemaWithContextExcludeAndModify = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    contextWithExcludeAndModify: {
      $exclude: ['field1'],
      $modify: {
        field1: forbidAny,
        field2: forbidAny
      }
    }
  }
}

export const schemaWithMultipleContexts = {
  field1: {},
  field2: {},
  field3: {},
  $contexts: {
    context1: {
      $exclude: ['field1']
    },
    context2: {
      $exclude: ['field2']
    }
  }
}
