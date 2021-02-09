import { Criteria, test, cascadeFind } from '@orioro/cascade'
import { isPlainObject } from 'lodash'

/**
 * A function that takes as parameters the value and the resolverContext
 * and returns the resolved value.
 * 
 * @callback Resolver
 * @param {*} value
 * @param {ResolverContext} resolverContext
 * @returns {*} resolved
 */
export type Resolver = (value:any, ResolverContext) => any

/**
 * `[Criteria, Resolver] | [Resolver]`
 * 
 * @typedef {[Criteria, Resolver] | [Resolver]} ResolverCandidate
 */
export type ResolverCandidate = ([Criteria, Resolver] | [Resolver])

/**
 * @typedef {Object} ResolverContext
 * @property {Object} context
 * @property {ResolverCandidate[]} context.resolvers
 * @property {String} [context.path]
 */
export type ResolverContext = {
  resolvers: ResolverCandidate[],
  path?: string,
  [key: string]: any
}

type PlainObject = { [key:string]: any }

/**
 * Utility function to build dot (`.`) notation paths.
 * Specifically prevents generating paths that start with a `.`.
 * 
 * @function pathJoin
 * @param {string} [base='']
 * @param {string | number} next
 * @returns {string} path
 */
export const pathJoin = (
  base:string = '',
  next:(string | number)
) => (
  base === ''
    ? `${next}`
    : `${base}.${next}`
)

const _defaultShouldResolveNested = (
  key:string,
  keyValue:any,
  value:(PlainObject | any[]),
  context:ResolverContext
) => true

/**
 * @function arrayResolver
 * @returns {ResolverCandidate}
 */
export const arrayResolver = (
  shouldResolveNested = _defaultShouldResolveNested
):ResolverCandidate => ([
  value => Array.isArray(value),
  (array:any[], context:ResolverContext) => (
    array.map((item, index) => (
      shouldResolveNested(item, index, array, context)
        ? nestedMap(item, {
            ...context,
            path: pathJoin(context.path, index)
          })
        : item
    ))
  )
])

/**
 * @function objectResolver
 * @returns {ResolverCandidate}
 */
export const objectResolver = (
  shouldResolveNested = _defaultShouldResolveNested
):ResolverCandidate => ([
  value => isPlainObject(value),
  (object:PlainObject, context:ResolverContext) => {
    const keys = Object.keys(object)

    return keys.reduce((acc, key) => ({
      ...acc,
      [key]: shouldResolveNested(object[key], key, object, context)
        ? nestedMap(object[key], {
            ...context,
            path: pathJoin(context.path, key)
          })
        : object[key]
    }), {})
  }
])

const RESOLVER_CONTEXT_DEFAULTS = {
  path: ''
}

/**
 * @function nestedMap
 * @param {*} value
 * @param {ResolverContext} context
 * @returns {*}
 */
export const nestedMap = (
  value:any,
  context:ResolverContext
):any => {
  context = {
    ...RESOLVER_CONTEXT_DEFAULTS,
    ...context
  }

  const resolver = cascadeFind(test, context.resolvers, value, context)

  return resolver === undefined
    ? value
    : resolver(value, context)
}
