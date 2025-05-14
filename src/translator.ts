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
    whereClauses.push(...translateFilter(filter));
  }
  
  return whereClauses.length > 0 
    ? `${sqlQuery} WHERE ${whereClauses.join(' AND ')}`
    : sqlQuery;
};

/**
 * Translates a MongoDB insert operation into an SQL insert query string.
 * @param {string} tableName - The name of the table to insert into.
 * @param {Record<string, any>} document - The document to insert.
 * @returns {string} The resulting SQL insert query string.
 */
export const translateInsertToSQL = (tableName: string, document: Record<string, any>): string => {
  const columns = Object.keys(document).join(', ');
  const values = Object.values(document).map(value => escapeSQL(value)).join(', ');
  return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
};

const translateFilter = (filter: Record<string, any>): string[] => {
  const clauses: string[] = [];
  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or') {
      const orClauses = value.map((subFilter: Record<string, any>) => {
        return translateFilter(subFilter).join(' AND '); // No parentheses for individual conditions
      });
      clauses.push(`(${orClauses.join(' OR ')})`); // Only add parentheses around the entire $or clause
    } else if (key === '$and') {
      const andClauses = value.map((subFilter: Record<string, any>) => {
        return translateFilter(subFilter).join(' AND '); // No parentheses for individual conditions
      });
      clauses.push(`(${andClauses.join(' AND ')})`); // Only add parentheses around the entire $and clause
    } else if (typeof value === 'object' && value !== null) {
      // Handle other operators
      for (const [operator, operatorValue] of Object.entries(value)) {
        clauses.push(translateOperatorCondition(key, operator, operatorValue));
      }
    } else {
      clauses.push(`${key} = '${escapeSQL(value)}'`);
    }
  }
  return clauses;
};
/**
 * Translates a MongoDB operator condition to an SQL condition string.
 * This function takes a field name, an operator, and a value, and constructs
 * the appropriate SQL condition based on the operator provided.
 * @param {string} key - The field name in the SQL condition.
 * @param {string} operator - The MongoDB operator to translate.
 * @param {any} value - The value to compare against the field.
 * @returns {string} The SQL condition string.
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
    case '$in':
      return `${key} IN (${(value as any).map((val: any) => `'${escapeSQL(val)}'`).join(', ')})`;
    default:
      return `${key} = '${escapeSQL(value)}'`;
  }
};
/**
 * Escape SQL values to prevent SQL injection.
 * @param value - The value to escape.
 * @returns The escaped value.
 */
const escapeSQL = (value: any): string => {
  if (typeof value === 'string') {
    return value.replace(/'/g, "''"); // Escape single quotes
  }
  return value; // Return as is for non-string values
};