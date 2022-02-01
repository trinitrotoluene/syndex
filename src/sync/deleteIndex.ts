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

import { DeleteIndexAction } from '../shared';
import logger from '../logger';
import { ICollection } from '../abstractions';

export async function deleteIndex (collection: ICollection, action: DeleteIndexAction) {
    logger.debug(`dropping index ${action.name} on collection ${action.collection}`);
    await collection.dropIndexAsync(action.name);
}
