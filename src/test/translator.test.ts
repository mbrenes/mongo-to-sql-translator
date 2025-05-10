import { translateMongoToSQL, MongoQuery } from '../translator';

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
});