import { Criteria, test, cascadeFind } from '@orioro/cascade'
import { isPlainObject } from 'lodash'

export type Resolver = (value:any, ResolverContext) => any
export type ResolverCandidate = ([Criteria, Resolver] | [Resolver])
export type ResolverContext = {
  resolvers: ResolverCandidate[],
  path?: string,
  [key: string]: any
}

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

export const nestedMap = (
  value:any,
  context:ResolverContext
):any => {
  const resolver = cascadeFind(test, context.resolvers, value, context)

  return resolver === undefined
    ? value
    : resolver(value, context)
}
