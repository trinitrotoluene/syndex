import { CreateCollectionAction, Plan } from '../shared';
import { CollectionDiff } from '../diff/collections';

export function planFromCollectionDiff (plan: Plan, diff: CollectionDiff): Plan {
    const createActions = diff.newCollections.map<CreateCollectionAction>(x => ({
        type: 'createCollection',
        name: x
    }));

    return [...plan, ...createActions];
}
