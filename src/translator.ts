// src/translator.ts
export type MongoQuery = {
  filter?: Record<string, any>;
  projection?: Record<string, number>;
};
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
  let sqlQuery = `SELECT `;
  // Handle projection
  if (projection) {
    const selectedFields = Object.keys(projection)
      .filter(key => projection[key] === 1)
      .join(', ');
    sqlQuery += selectedFields.length > 0 ? selectedFields : '*';
  } else {
    sqlQuery += '*';
  }
  sqlQuery += ` FROM ${collectionName}`;
  // Handle filters
  const whereClauses: string[] = [];
  for (const [key, value] of Object.entries(filter || {})) {
    if (typeof value === 'object' && value !== null) {
      for (const [operator, operatorValue] of Object.entries(value)) {
        whereClauses.push(translateCondition(key, operator, operatorValue));
      }
    } else {
      whereClauses.push(`${key} = '${value}'`);
    }
  }
  if (whereClauses.length > 0) {
    sqlQuery += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  return sqlQuery;
};
const translateCondition = (key: string, operator: string, value: any): string => {
  switch (operator) {
    case '$lt':
      return `${key} < ${value}`;
    case '$lte':
      return `${key} <= ${value}`;
    case '$gt':
      return `${key} > ${value}`;
    case '$gte':
      return `${key} >= ${value}`;
    case '$ne':
      return `${key} <> '${value}'`;
    default:
      return `${key} = '${value}'`;
  }
};