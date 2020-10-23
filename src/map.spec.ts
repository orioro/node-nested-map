import {
  ResolverCandidate,

  nestedMap,
  arrayResolver,
  objectResolver,
} from './map'

describe('nestedMap(value, context)', () => {
  test('', () => {
    const source = {
      key1: 'sourceValue1',
      key2: 'sourceValue2',
      key3: 'sourceValue3'
    }

    const data = {
      key1: 'value1',
      key2: 'value2',
      key3: ['$SOURCE', 'key1'],
      key4: {
        key41: 'value41',
        key42: 'value42',
        key43: ['$SOURCE', 'key1'],
        key44: [
          ['$SOURCE', 'key1'],
          ['$SOURCE', 'key2'],
          ['$SOURCE', 'key3'],
          'value444'
        ]
      },
      key5: 'value5'
    }

    const RESOLVER_SOURCE_REF:ResolverCandidate = [
      value => Array.isArray(value) && value[0] === '$SOURCE',
      (value, { source }) => source[value[1]]
    ]

    expect(nestedMap(data, {
      source,
      resolvers: [
        RESOLVER_SOURCE_REF,
        arrayResolver(),
        objectResolver()
      ]
    }))
    .toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'sourceValue1',
      key4: {
        key41: 'value41',
        key42: 'value42',
        key43: 'sourceValue1',
        key44: [
          'sourceValue1',
          'sourceValue2',
          'sourceValue3',
          'value444'
        ]
      },
      key5: 'value5'
    })
  })
})
