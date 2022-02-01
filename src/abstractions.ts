/**
 * Copyright 2022 trinitrotoluene
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
