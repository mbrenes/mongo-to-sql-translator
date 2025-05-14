import { translateMongoToSQL, translateInsertToSQL } from '../translator';
import { Db } from '../types/dbtypes';

/**
 * Function to validate table names using a regex pattern
 * @param tableName 
 * @returns 
 */
const isValidTableName = (tableName: string): boolean => {
  const validTableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/; 
  return validTableNameRegex.test(tableName);
};

/**
 * Function to create an error for unsupported operations
 * @param operation 
 * @returns 
 */
const unsupportedOperation = (operation: string) => {
  return () => {
    throw new Error(`Operation "${operation}" not supported. Only "find" is supported.`);
  };
};

/**
 * Create the database object using Proxy
 * 
 */
export const db = new Proxy<Db>({}, {
  get(target, tableName: string) {
    return {
      find: (filter: any, projection: any = {}) => {
        try {
          if (!isValidTableName(tableName)) {
            throw new Error(`Invalid table name "${tableName}".`);
          }
          const sqlQuery = translateMongoToSQL(tableName, 'find', filter, projection);
          console.log(sqlQuery);
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("An unknown error occurred.");
          }
        }
      },
      findOne: unsupportedOperation('findOne'),
            insertOne: (document: any) => {
        try {
          if (!isValidTableName(tableName)) {
            throw new Error(`Invalid table name "${tableName}".`);
          }
          const sqlQuery = translateInsertToSQL(tableName, document);
          console.log(sqlQuery);
        } catch (error) {
          console.error(error instanceof Error ? error.message : "An unknown error occurred.");
        }
      },
      insertMany: unsupportedOperation('insertMany'),
      updateOne: unsupportedOperation('updateOne'),
      updateMany: unsupportedOperation('updateMany'),
      replaceOne: unsupportedOperation('replaceOne'),
      deleteOne: unsupportedOperation('deleteOne'),
      deleteMany: unsupportedOperation('deleteMany'),
      aggregate: unsupportedOperation('aggregate'),
      countDocuments: unsupportedOperation('countDocuments'),
      distinct: unsupportedOperation('distinct'),
      createIndex: unsupportedOperation('createIndex'),
      dropIndex: unsupportedOperation('dropIndex'),
      drop: unsupportedOperation('drop'),
      renameCollection: unsupportedOperation('renameCollection'),
    };
  }
});