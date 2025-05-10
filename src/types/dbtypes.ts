export type DbCollection = {
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

export type MongoQuery = {
  filter?: Record<string, any>;
  projection?: Record<string, number>;
};

export type Db = {
  [key: string]: DbCollection;
};