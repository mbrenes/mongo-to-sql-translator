import { translateMongoToSQL } from '../translator';
import { MongoQuery } from '../types/dbtypes';

describe('translateMongoToSQL', () => {
  it('should generate correct SQL for find operation with no filters and projections', () => {
    const sql = translateMongoToSQL('users', 'find', {}, {});
    expect(sql).toBe('SELECT * FROM users');
  });
  
  it('should generate correct SQL for find operation with projections', () => {
    const projection: MongoQuery['projection'] = { name: 1, age: 1 };
    const sql = translateMongoToSQL('users', 'find', {}, projection);
    expect(sql).toBe('SELECT name, age FROM users');
  });

  it('should generate correct SQL for find operation with filters', () => {
    const filter: MongoQuery['filter'] = { age: { $gte: 18 }, name: 'John' };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE age >= 18 AND name = 'John'");
  });

  it('should generate correct SQL for find operation with mixed filters and projections', () => {
    const filter: MongoQuery['filter'] = { age: { $lt: 30 }, city: 'New York' };
    const projection: MongoQuery['projection'] = { name: 1, city: 1 };
    const sql = translateMongoToSQL('users', 'find', filter, projection);
    expect(sql).toBe("SELECT name, city FROM users WHERE age < 30 AND city = 'New York'");
  });

  it('should throw an error for unsupported operations', () => {
    expect(() => translateMongoToSQL('users', 'insert', {}, {})).toThrowError('Operation "insert" not supported. Only "find" is supported.');
  });

  it('should handle filters with different operators', () => {
    const filter: MongoQuery['filter'] = { age: { $ne: 25 }, salary: { $gte: 50000 } };
    const sql = translateMongoToSQL('employees', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM employees WHERE age <> '25' AND salary >= 50000");
  });

  it('should handle empty filters gracefully', () => {
    const sql = translateMongoToSQL('products', 'find', {}, {});
    expect(sql).toBe('SELECT * FROM products');
  });

  it('should handle null values in filters', () => {
    const filter: MongoQuery['filter'] = { name: null };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE name = 'null'");
  });
  it('should generate correct SQL for find operation with $or operator', () => {
    const orQuery = {
      $or: [
        { name: 'john' },
        { age: { $gte: 21 } }
      ]
    };
    const sql = translateMongoToSQL('users', 'find', orQuery, {});
    expect(sql).toBe("SELECT * FROM users WHERE (name = 'john' OR age >= 21)");
  });
  it('should generate correct SQL for find operation with $and operator', () => {
    const andQuery = {
      $and: [
        { name: 'john' },
        { age: { $lt: 30 } }
      ]
    };
    const sql = translateMongoToSQL('users', 'find', andQuery, {});
    expect(sql).toBe("SELECT * FROM users WHERE (name = 'john' AND age < 30)");
  });
  it('should generate correct SQL for find operation with $in operator', () => {
    const inQuery = {
      name: { $in: ['john', 'jane', 'doe'] }
    };
    const sql = translateMongoToSQL('users', 'find', inQuery, {});
    expect(sql).toBe("SELECT * FROM users WHERE name IN ('john', 'jane', 'doe')");
  });
  it('should generate correct SQL for find operation with $lt operator', () => {
    const filter: MongoQuery['filter'] = { age: { $lt: 30 } };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE age < 30");
  });
  it('should generate correct SQL for find operation with $lte operator', () => {
    const filter: MongoQuery['filter'] = { age: { $lte: 30 } };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE age <= 30");
  });
  // Test case for $gt operator
  it('should generate correct SQL for find operation with $gt operator', () => {
    const filter: MongoQuery['filter'] = { age: { $gt: 18 } };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE age > 18");
  });
  // Test case for $gte operator
  it('should generate correct SQL for find operation with $gte operator', () => {
    const filter: MongoQuery['filter'] = { age: { $gte: 21 } };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE age >= 21");
  });
  // Test case for $ne operator
  it('should generate correct SQL for find operation with $ne operator', () => {
    const filter: MongoQuery['filter'] = { age: { $ne: 30 } };
    const sql = translateMongoToSQL('users', 'find', filter, {});
    expect(sql).toBe("SELECT * FROM users WHERE age <> '30'");
  });
});