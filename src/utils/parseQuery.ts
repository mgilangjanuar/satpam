import { ParsedUrlQuery } from 'querystring'

export function parseQuery(query: ParsedUrlQuery, includes?: string[]): Record<string, string> {
  const result: Record<string, any> = {}
  for (const key in query) {
    if (includes?.length && !includes.includes(key)) continue
    if (Array.isArray(query[key]) && query[key]?.length) {
      result[key] = query[key]?.[0]
    } else if (typeof query[key] === 'string') {
      result[key] = query[key]
    }
  }
  return result
}