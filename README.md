# Mongo to Sql translator Application

A application that translates mongo queries to sql queries.

## Features

- Translate mongo queries to sql queries. (Only supports find operation for the moment)
- TypeScript for type safety and better development experience.
- Unit testing with Jest.

## Requirements

- Node.js (versión >= 18)
- yarn

## Installation

1. Clone this repository
   ```bash
   git clone <repository>
   cd mongo-to-sql-translator
   ```

2. **Install dependencies:**
```bash
 yarn install
```
3.  **Build the application:**

```bash
yarn build
```

4.  **Run the application:**

```bash
yarn start
```
5. **Example of usage**
```bash
 E//xample usage
db.user.find({ _id: 23113 }, { name: 1, age: 1 });
//Output: SELECT name, age FROM user WHERE _id = 23113;
db.car.find({ age: { $gte: 21 } }, { name: 1, _id: 1 });
 //Output: SELECT name, _id FROM car WHERE age >= 21;
db.citizen.find({ name: 'john' }, {});
 //Output: SELECT * FROM citizen WHERE name = 'john';
// if the operation is not find or the table name is invalid, it will throw an error:
- Operation "insertOne" not supported. Only "find" is supported.
- Operation "updateOne" not supported. Only "find" is supported.
- Operation "deleteOne" not supported. Only "find" is supported.
- Operation "deleteMany" not supported. Only "find" is supported.
- Operation "aggregate" not supported. Only "find" is supported.
- Invalid table name "123invalidName".
```

6.  **Testing**
To run the tests using Jest, execute the following command:

```bash 
yarn test
```


7. **License**
   This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.



