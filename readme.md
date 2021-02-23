# nestedMap

Utility function that helps "mapping" values of a source structure to a new
object with a corresponding structure but with new values. It's like
`Array.prototype.map(input => output)`, but for nested data structures.

## Purpose

Really useful for de-referencing data within a given data-structure. See example.

## Example

Resolving data references in nested object

```js
import {
  nestedMap,
  objectResolver,
  arrayResolver,
  defaultResolver,
} from '@orioro/nested-map'

/**
 * Some external data source, from which references
 * such as ['$SOURCE', 'key1'] will be resolved.
 */
const DATA_SOURCE = {
  key1: 'sourceValue1',
  key2: 'sourceValue2',
  key3: 'sourceValue3'
}

/**
 * The structure of the expected data. Some values reference
 * data from an external object. In this example, references
 * have the format ['$SOURCE', key]
 */
const dataStructure = {
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

/**
 * The ResolverCandidate that resolves data source maps.
 * The first function (criteria) tests whether the `value`
 * has the format of a data reference.
 *
 * If the criteria is matched, the second function is executed
 * and its return value is set onto the destination structure.
 */
const RESOLVER_SOURCE_REF:ResolverCandidate = [
  value => Array.isArray(value) && value[0] === '$SOURCE',
  (value, { source }) => source[value[1]]
]

const data = nestedMap(dataStructure, {
  /**
   * Additional data for the resolution context.
   */
  source: DATA_SOURCE,
  /**
   * A list of ordered CandidateResolvers.
   * The first matching CandidateResolver is executed:
   * Whenever a data reference node is identified, the other
   * resolvers are not executed.
   *
   * The arrayResolver traverses nested arrays.
   * The objectResolver traverses nested objects.
   *
   * For more information, this module is implemented using
   * the cascade pattern: @orioro.cascade
   * https://github.com/orioro/node-cascade
   */
  resolvers: [
    RESOLVER_SOURCE_REF,
    arrayResolver(),
    objectResolver(),
    defaultResolver(),
  ]
})

console.log(data)
// {
//   key1: 'value1',
//   key2: 'value2',
//   key3: 'sourceValue1',
//   key4: {
//     key41: 'value41',
//     key42: 'value42',
//     key43: 'sourceValue1',
//     key44: [
//       'sourceValue1',
//       'sourceValue2',
//       'sourceValue3',
//       'value444'
//     ]
//   },
//   key5: 'value5'
// }
```

## References
For more information, this module is implemented using
the cascade pattern: `@orioro.cascade` https://github.com/orioro/node-cascade

# API Docs

  - [`Resolver`](#resolver)
  - [`ResolverCandidate`](#resolvercandidate)
  - [`ResolverContext`](#resolvercontext)
  - [`pathJoin(base, next)`](#pathjoinbase-next)
  - [`arrayResolver()`](#arrayresolver)
  - [`objectResolver()`](#objectresolver)
  - [`defaultResolver()`](#defaultresolver)
  - [`nestedMap(value, context)`](#nestedmapvalue-context)

##### `Resolver`

A function that takes as parameters the value and the resolverContext
and returns the resolved value.

- `value` {*}
- `resolverContext` {[[Resolver](#resolver)Context](#resolvercontext)}
- Returns: `resolved` {*} 

##### `ResolverCandidate`

`[Criteria, Resolver] | [Resolver]`



##### `ResolverContext`

- `context` {Object}
  - `resolvers` {[[Resolver](#resolver)Candidate](#resolvercandidate)[]}
  - `path` {String}

##### `pathJoin(base, next)`

Utility function to build dot (`.`) notation paths.
Specifically prevents generating paths that start with a `.`.

- `base` {string}
- `next` {string | number}
- Returns: `path` {string} 

##### `arrayResolver()`


- Returns: {[[Resolver](#resolver)Candidate](#resolvercandidate)} 

##### `objectResolver()`


- Returns: {[[Resolver](#resolver)Candidate](#resolvercandidate)} 

##### `defaultResolver()`


- Returns: {[[Resolver](#resolver)Candidate](#resolvercandidate)} 

##### `nestedMap(value, context)`

- `value` {*}
- `context` {[[Resolver](#resolver)Context](#resolvercontext)}
- Returns: {*}
