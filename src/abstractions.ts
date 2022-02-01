import { Collection, CreateIndexesOptions, Db, Document, IndexSpecification, MongoClient } from 'mongodb';

export interface ICollection {
    name: string;
    getIndexesAsync: () => Promise<Document>;
    createIndexAsync: (spec: IndexSpecification, options: CreateIndexesOptions) => Promise<unknown>;
    dropIndexAsync: (name: string) => Promise<unknown>;
}

export interface IDatabase {
    name: string;
    getCollectionsAsync: () => Promise<ICollection[]>;
    getCollection: (name: string) => ICollection;
    createCollectionAsync: (name: string) => Promise<ICollection>;
}

export interface IDatabaseClient {
    getDatabase: (name: string) => IDatabase;
    closeAsync: () => Promise<unknown>;
}

export const DatabaseClient = (client: MongoClient): IDatabaseClient => {
    return {
        getDatabase: (name: string) => {
            const db = client.db(name);
            return DatabaseWrapper(db);
        },
        closeAsync: () => {
            return client.close();
        }
    };
};

const DatabaseWrapper = (db: Db): IDatabase => {
    return {
        name: db.databaseName,
        getCollectionsAsync: async () => {
            const collections = await db.collections();
            return collections.map(CollectionWrapper);
        },
        getCollection: (name) => {
            const collection = db.collection(name);
            return CollectionWrapper(collection);
        },
        createCollectionAsync: async (name) => {
            const collection = await db.createCollection(name);
            return CollectionWrapper(collection);
        }
    };
};

const CollectionWrapper = (collection: Collection): ICollection => {
    return {
        name: collection.collectionName,
        getIndexesAsync: () => {
            return collection.indexes();
        },
        createIndexAsync: (spec, options) => {
            return collection.createIndex(spec, options);
        },
        dropIndexAsync: (name) => {
            return collection.dropIndex(name);
        }
    };
};
