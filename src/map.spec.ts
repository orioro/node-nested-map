import {
  ResolverCandidate,
  nestedMap,
  arrayResolver,
  objectResolver,
  defaultResolver,
} from './map'

/**
 * @todo Examples are not that good. They are quite arbirtrary,
 *       More real-life use case scenarios would help a lot in understanding
 */
describe('example: resolving data references', () => {
  const source = {
    key1: 'sourceValue1',
    key2: 'sourceValue2',
    key3: 'sourceValue3',
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
        'value444',
      ],
    },
    key5: 'value5',
  }

  const RESOLVER_SOURCE_REF: ResolverCandidate = [
    (value) => Array.isArray(value) && value[0] === '$SOURCE',
    (value, { source }) => source[value[1]],
  ]

  test('nestedMap(value, context)', () => {
    expect(
      nestedMap(data, {
        source,
        resolvers: [
          RESOLVER_SOURCE_REF,
          arrayResolver(),
          objectResolver(),
          defaultResolver(),
        ],
      })
    ).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'sourceValue1',
      key4: {
        key41: 'value41',
        key42: 'value42',
        key43: 'sourceValue1',
        key44: ['sourceValue1', 'sourceValue2', 'sourceValue3', 'value444'],
      },
      key5: 'value5',
    })
  })

  test('custom shouldResolveNested objectResolver(shouldResolveNested)', () => {
    const excludeKey43 = (value, key) => key !== 'key43'

    expect(
      nestedMap(data, {
        source,
        resolvers: [
          RESOLVER_SOURCE_REF,
          arrayResolver(),
          objectResolver(excludeKey43),
          defaultResolver(),
        ],
      })
    ).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'sourceValue1',
      key4: {
        key41: 'value41',
        key42: 'value42',
        // This key is excluded
        key43: ['$SOURCE', 'key1'],
        key44: ['sourceValue1', 'sourceValue2', 'sourceValue3', 'value444'],
      },
      key5: 'value5',
    })
  })

  test('custom shouldResolveNested arrayResolver(shouldResolveNested)', () => {
    const excludeOddIndexReferences = (value, index) => index % 2 === 0

    expect(
      nestedMap(data, {
        source,
        resolvers: [
          RESOLVER_SOURCE_REF,
          arrayResolver(excludeOddIndexReferences),
          objectResolver(),
          defaultResolver(),
        ],
      })
    ).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'sourceValue1',
      key4: {
        key41: 'value41',
        key42: 'value42',
        key43: 'sourceValue1',
        key44: [
          'sourceValue1',
          // Excluded
          ['$SOURCE', 'key2'],
          'sourceValue3',
          'value444',
        ],
      },
      key5: 'value5',
    })
  })
})
