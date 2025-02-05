/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { AlfrescoApiService, CardViewUpdateService, NodesApiService } from '@alfresco/adf-core';
import { DialogAspectListService } from './dialog-aspect-list.service';

@Injectable({
    providedIn: 'root'
})
export class NodeAspectService {

    constructor(private alfrescoApiService: AlfrescoApiService,
                private nodesApiService: NodesApiService,
                private dialogAspectListService: DialogAspectListService,
                private cardViewUpdateService: CardViewUpdateService) {
    }

    updateNodeAspects(nodeId: string) {
        this.dialogAspectListService.openAspectListDialog(nodeId).subscribe((aspectList) => {
            this.nodesApiService.updateNode(nodeId, { aspectNames: [...aspectList] }).subscribe((updatedNode) => {
                this.alfrescoApiService.nodeUpdated.next(updatedNode);
                this.cardViewUpdateService.updateNodeAspect(updatedNode);
            });
        });
    }
}
