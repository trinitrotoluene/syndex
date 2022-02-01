import { CreateIndexAction, DeleteIndexAction, Plan } from '../shared';
import { IndexDiff } from '../diff/indexes';

export function planFromIndexDiff (plan: Plan, diff: IndexDiff, collection: string): Plan {
    const deleteStaleIndexesActions: DeleteIndexAction[] = diff.staleIndexes.map(staleIndex => ({
        type: 'deleteIndex',
        collection: collection,
        name: staleIndex.name
    }));

    const deleteConflictedIndexesActions: DeleteIndexAction[] = diff.conflicts.map(conflict => ({
        type: 'deleteIndex',
        collection: collection,
        name: conflict.remote.name
    }));

    const recreateConflictedIndexesActions: CreateIndexAction[] = diff.conflicts.map(conflict => ({
        type: 'createIndex',
        collection: collection,
        name: conflict.local.name,
        key: conflict.local.key,
        options: conflict.local.options ?? {}
    }));

    const createIndexActions: CreateIndexAction[] = diff.newIndexes.map(newIndex => ({
        type: 'createIndex',
        collection: collection,
        name: newIndex.name,
        key: newIndex.key,
        options: newIndex.options ?? {}
    }));

    return [
        ...plan,
        ...deleteStaleIndexesActions,
        ...deleteConflictedIndexesActions,
        ...recreateConflictedIndexesActions,
        ...createIndexActions
    ];
}
