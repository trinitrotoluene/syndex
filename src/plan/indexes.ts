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
        background: conflict.local.background ?? false
    }));

    const createIndexActions: CreateIndexAction[] = diff.newIndexes.map(newIndex => ({
        type: 'createIndex',
        collection: collection,
        name: newIndex.name,
        key: newIndex.key,
        background: newIndex.background ?? false
    }));

    return [
        ...plan,
        ...deleteStaleIndexesActions,
        ...deleteConflictedIndexesActions,
        ...recreateConflictedIndexesActions,
        ...createIndexActions
    ];
}
