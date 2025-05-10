// src/index.ts
import { translateMongoToSQL } from './translator';
// Define a type for the db object that allows for dynamic keys
type DbCollection = {
  find: (filter: any, projection?: any) => void;
  findOne: (filter: any, projection?: any) => void;
  insertOne: (document: any) => void;
  insertMany: (documents: any[]) => void;
  updateOne: (filter: any, update: any) => void;
  updateMany: (filter: any, update: any) => void;
  replaceOne: (filter: any, update: any) => void;
  deleteOne: (filter: any) => void;
  deleteMany: (filter: any) => void;
  aggregate: (pipeline: any[]) => void;
  countDocuments: (filter?: any) => void;
  distinct: (field: string, filter?: any) => void;
  createIndex: (keys: any, options?: any) => void;
  dropIndex: (indexName: string) => void;
  drop: () => void;
  renameCollection: (newName: string) => void;
};
// Create a type for the db object that allows any collection name
type Db = {
  [key: string]: DbCollection;
};
// Create the db object using Proxy
const db = new Proxy<Db>({}, {
  get(target, tableName: string) {
    return {
      find: (filter: any, projection: any = {}) => {
        try {
          // Validate the operation
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
      findOne: (filter: any, projection: any = {}) => {
        throw new Error(`Operation "findOne" not supported. Only "find" is supported.`);
      },
      insertOne: (document: any) => {
        throw new Error(`Operation "insertOne" not supported. Only "find" is supported.`);
      },
      insertMany: (documents: any[]) => {
        throw new Error(`Operation "insertMany" not supported. Only "find" is supported.`);
      },
      updateOne: (filter: any, update: any) => {
        throw new Error(`Operation "updateOne" not supported. Only "find" is supported.`);
      },
      updateMany: (filter: any, update: any) => {
        throw new Error(`Operation "updateMany" not supported. Only "find" is supported.`);
      },
      replaceOne: (filter: any, update: any) => {
        throw new Error(`Operation "replaceOne" not supported. Only "find" is supported.`);
      },
      deleteOne: (filter: any) => {
        throw new Error(`Operation "deleteOne" not supported. Only "find" is supported.`);
      },
      deleteMany: (filter: any) => {
        throw new Error(`Operation "deleteMany" not supported. Only "find" is supported.`);
      },
      aggregate: (pipeline: any[]) => {
        throw new Error(`Operation "aggregate" not supported. Only "find" is supported.`);
      },
      countDocuments: (filter?: any) => {
        throw new Error(`Operation "countDocuments" not supported. Only "find" is supported.`);
      },
      distinct: (field: string, filter?: any) => {
        throw new Error(`Operation "distinct" not supported. Only "find" is supported.`);
      },
      createIndex: (keys: any, options?: any) => {
        throw new Error(`Operation "createIndex" not supported. Only "find" is supported.`);
      },
      dropIndex: (indexName: string) => {
        throw new Error(`Operation "dropIndex" not supported. Only "find" is supported.`);
      },
      drop: () => {
        throw new Error(`Operation "drop" not supported. Only "find" is supported.`);
      },
      renameCollection: (newName: string) => {
        throw new Error(`Operation "renameCollection" not supported. Only "find" is supported.`);
      },
    };
  }
});
// Function to validate table names
const isValidTableName = (tableName: string): boolean => {
  const validTableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/; // Valid MongoDB collection name regex
  return validTableNameRegex.test(tableName);
};
// Example usage
db.user.find({ _id: 23113 }, { name: 1, age: 1 });
// Output: SELECT name, age FROM user WHERE _id = 23113;
db.car.find({ age: { $gte: 21 } }, { name: 1, _id: 1 });
// Output: SELECT name, _id FROM car WHERE age >= 21;
db.citizen.find({ name: 'john' }, {});
// Output: SELECT * FROM citizen WHERE name = 'john';

// Example of inserting a document
try {
  db.user.insertOne({ name: 'Jane Doe', age: 30 });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}
try {
  db.user.updateOne({ age: { $lt: 18 } }, { $set: { status: 'minor' } });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}

try {
  db.user.deleteOne({ age: { $ne: 30 } });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}

try {
  db.user.deleteMany({ age: { $ne: 30 } });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}
// Example of deleting documents (multiple that match the criteria)

// Output: Deleting many documents from user where { age: { $ne: 30 } }

// This will throw an error for unsupported operation
try {
  db.user.aggregate([]); // This will throw an error
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); // Output: Operation "aggregate" not supported. Only "find" is supported.
  }
}
// This will throw an error for invalid table name
try {
  db['123invalidName'].find({}, {}); // This will throw an error
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); // Output: Invalid table name "123invalidName".
  }
}