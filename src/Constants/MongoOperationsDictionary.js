/**
 * Map the operations dictionary from an SQL Database
 * to MongoDB operators.
 *
 * @type {{"<=": string, "<>": string, like: string, ilike: string, "<": string, "=": string, ">": string, ">=": string}}
 */
export const MONGO_OPERATIONS_DICTIONARY = {
  '=': '$match',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
  '<>': '$ne',
  like: '$regex',
  ilike: '$regex',
}

/**
 * Create a new object pointing to the operation.
 *
 * @param object {any}
 * @param operator { '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike' }
 */
export function createMatchByOperator(object, operator) {
  const newObject = {}

  Object.keys(object).forEach(
    key => (newObject[key] = setOperator(object[key], operator)),
  )

  return newObject
}

/**
 * Create a new object pointing to the operation.
 *
 * @param object {any}
 * @param operator { '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike' }
 */
export function createObjectWithOperator(object, operator) {
  const newObject = {}

  Object.keys(object).forEach(
    key => (newObject[key] = setOperator(object[key], operator)),
  )

  return newObject
}

/**
 * Set the mongo operation in value.
 *
 * @param key {string}
 * @param value {any}
 * @param operator {'=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike'}
 * @return {any}
 */
export function setOperator(value, operator) {
  if (operator === '=') {
    return value
  }

  const mongoOperator = MONGO_OPERATIONS_DICTIONARY[operator]

  const object = { [mongoOperator]: value }

  if (operator === 'ilike') {
    object.$options = 'i'
  }

  return object
}

/**
 * Set the mongo operation in key value.
 *
 * @param key {string}
 * @param value {any}
 * @param operator {'=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike'}
 * @return {any}
 */
export function setOperatorInKey(key, value, operator) {
  return { [key]: setOperator(value, operator) }
}
