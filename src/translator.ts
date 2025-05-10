import { MongoQuery } from "./types/dbtypes";


/**
 * Translates a MongoDB query into an SQL query string.
 * This function constructs an SQL query based on the provided collection name,
 * operation type, filter conditions, and projection fields. Currently, only 
 * the "find" operation is supported.
 * @param {string} collectionName - The name of the collection to query.
 * @param {string} operation - The type of operation to perform. Only "find" is supported.
 * @param {MongoQuery['filter']} filter - The filter conditions for the query.
 * @param {MongoQuery['projection']} projection - The fields to include in the query results.
 * @returns {string} The resulting SQL query string.
 * @throws {Error} Throws an error if the operation is not "find".
 *
 * @example
 * const sql = translateMongoToSQL('users', 'find', { age: { $gte: 18 } }, { name: 1, email: 1 });
 *  sql would be: "SELECT name, email FROM users WHERE age >= 18"
 */
export const translateMongoToSQL = (
  collectionName: string,
  operation: string,
  filter: MongoQuery['filter'],
  projection: MongoQuery['projection']
): string => {
  // Check for supported operations
  if (operation !== 'find') {
    throw new Error(`Operation "${operation}" not supported. Only "find" is supported.`);
  }
  // Handle projection
  const selectedFields = projection && Object.keys(projection).some(key => projection[key] === 1) 
    ? Object.keys(projection).filter(key => projection[key] === 1).join(', ') 
    : '*';
  const sqlQuery = `SELECT ${selectedFields} FROM ${collectionName}`;
  // Handle filters
  const whereClauses: string[] = [];
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      whereClauses.push(translateCondition(key, value));
    }
  }
  return whereClauses.length > 0 
    ? `${sqlQuery} WHERE ${whereClauses.join(' AND ')}`
    : sqlQuery;
};
/**
 * Translates a MongoDB condition into an SQL condition string.
 * This function takes a field name and a value, and constructs the appropriate
 * SQL condition based on the type of the value. If the value is an object, it
 * assumes that it contains MongoDB operators and translates each operator into
 * an SQL condition using the `translateOperatorCondition` function. If the value
 * is not an object, it defaults to equality (`=`) for the SQL condition.
 * @param {string} key - The field name in the SQL condition.
 * @param {any} value - The value to compare against the field.
 * @returns {string} The SQL condition string that corresponds to the provided 
 *                   key and value.
 * @example
 * Example usage with a single value:
 * const condition = translateCondition('age', 30);
 *  condition would be: "age = '30'"
 * @example
 *  Example usage with multiple operators:
 * const condition = translateCondition('age', { $gt: 18, $lt: 30 });
 *  condition would be: "age > 18 AND age < 30"
 */
const translateCondition = (key: string, value: any): string => {
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([operator, operatorValue]) => {
        return translateOperatorCondition(key, operator, operatorValue);
      })
      .join(' AND ');
  } else {
    return `${key} = '${escapeSQL(value)}'`;
  }
};

 /** Translates a MongoDB operator condition to an SQL condition string.
 * This function takes a field name, an operator, and a value, and constructs
 * the appropriate SQL condition based on the operator provided. The SQL 
 * condition will be formatted to prevent SQL injection by escaping 
 * the value appropriately.
 * @param {string} key - The field name in the SQL condition.
 * @param {string} operator - The MongoDB operator to translate. Supported operators include:
 *   - `$lt`: Less than
 *   - `$lte`: Less than or equal to
 *   - `$gt`: Greater than
 * @param {any} value - The value to compare against the field. The value can be of any type, 
 *                      including numbers, strings, or other types.
 * @returns {string} The SQL condition string that corresponds to the provided key, operator, and value.
 * @example
 * const condition = translateOperatorCondition('age', '$gt', 30);
 *  condition would be: "age > 30"
 * @example
 * const condition = translateOperatorCondition('name', '$ne', 'John');
 *  condition would be: "name <> 'John'"
 */

const translateOperatorCondition = (key: string, operator: string, value: any): string => {
  switch (operator) {
    case '$lt':
      return `${key} < ${escapeSQL(value)}`;
    case '$lte':
      return `${key} <= ${escapeSQL(value)}`;
    case '$gt':
      return `${key} > ${escapeSQL(value)}`;
    case '$gte':
      return `${key} >= ${escapeSQL(value)}`;
    case '$ne':
      return `${key} <> '${escapeSQL(value)}'`;
    default:
      return `${key} = '${escapeSQL(value)}'`;
  }
};

/**
 * escape SQL values to prevent SQL injection
 * @param value 
 * @returns 
 */
const escapeSQL = (value: any): string => {
  if (typeof value === 'string') {
    // Escape single quotes
    return value.replace(/'/g, "''"); 
  }
  // Return as is for non-string values
  return value; 
};