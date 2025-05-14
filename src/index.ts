import { db } from './utils/dbProxy';
// Example usage
db.user.find({ _id: 23113 }, { name: 1, age: 1 });
// Output: SELECT name, age FROM user WHERE _id = 23113;
db.car.find({ age: { $gte: 21 } }, { name: 1, _id: 1 });
// Output: SELECT name, _id FROM car WHERE age >= 21;
db.citizen.find({ name: 'john' }, {});
// Output: SELECT * FROM citizen WHERE name = 'john';

// Example usage with $or operator
const orQuery = {
  $or: [
    { name: 'john' },
    { age: { $gte: 21 } }
  ]
};

db.user.find(orQuery);
// Expected Output: SELECT * FROM users WHERE (name = 'john' OR age >= 21);

// Example usage with $in operator
const inQuery = {
  name: { $in: ['john', 'jane', 'doe'] }
};

db.user.find(inQuery);
// Expected Output: SELECT * FROM users WHERE name IN ('john', 'jane', 'doe');

// Example of inserting a document
try {
  db.user.insertOne({ name: 'Jane Doe', age: 30 });
  // Expected Output: INSERT INTO user (name, age) VALUES ('Jane Doe', 30);
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message); 
  }
}
//Example of update a document
try {
  db.user.updateOne({ age: { $lt: 18 } }, { $set: { status: 'minor' } });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}
//Example of delete a document
try {
  db.user.deleteOne({ age: { $ne: 30 } });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}
// Example of delete many
try {
  db.user.deleteMany({ age: { $ne: 30 } });
} catch (err) {
     if (err instanceof Error) {
         console.error(err.message); 
     }
}
// This will throw an error for unsupported operation
try {
  db.user.aggregate([]); // This will throw an error
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); 
    // Output: Operation "aggregate" not supported. Only "find" is supported.
  }
}
// This will throw an error for invalid table name
try {
  db['123invalidName'].find({}, {}); 
  // This will throw an error
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); 
    // Output: Invalid table name "123invalidName".
  }
}