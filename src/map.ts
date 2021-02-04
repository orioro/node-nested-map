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

/**
 * @function arrayResolver
 * @returns {ResolverCandidate}
 */
export const arrayResolver = ():ResolverCandidate => ([
  value => Array.isArray(value),
  (array:any[], context:ResolverContext) => (
    array.map((item, index) => (
      nestedMap(item, {
        ...context,
        path: `${context.path || ''}.${index}`
      })
    ))
  )
])

/**
 * @function objectResolver
 * @returns {ResolverCandidate}
 */
export const objectResolver = ():ResolverCandidate => ([
  value => isPlainObject(value),
  (value:{ [key: string]: any }, context:ResolverContext) => {
    const keys = Object.keys(value)

    return keys.reduce((acc, key) => ({
      ...acc,
      [key]: nestedMap(value[key], {
        ...context,
        path: `${context.path || ''}.${key}`
      })
    }), {})
  }
])

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
  const resolver = cascadeFind(test, context.resolvers, value, context)

  return resolver === undefined
    ? value
    : resolver(value, context)
}
