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

import { TestBed } from '@angular/core/testing';
import { BpmUserModel } from '../models/bpm-user.model';
import { BpmUserService } from './bpm-user.service';
import { setupTestBed } from '../testing/setup-test-bed';
import { CoreTestingModule } from '../testing/core.testing.module';
import { TranslateModule } from '@ngx-translate/core';

declare let jasmine: any;

describe('Bpm user service', () => {

    let service: BpmUserService;

    setupTestBed({
        imports: [
            TranslateModule.forRoot(),
            CoreTestingModule
        ]
    });

    beforeEach(() => {
        service = TestBed.inject(BpmUserService);
    });

    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('when user is logged in', () => {

        it('should be able to retrieve the user information', (done) => {
            service.getCurrentUserInfo().subscribe((user: BpmUserModel) => {
                expect(user).toBeDefined();
                expect(user.id).toBe(1);
                expect(user.lastName).toBe('fake-last-name');
                expect(user.fullname).toBe('fake-full-name');
                done();
            });

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'application/json',
                responseText: JSON.stringify({
                    lastName: 'fake-last-name',
                    fullname: 'fake-full-name',
                    groups: [],
                    id: 1
                })
            });
        });

        it('should retrieve avatar url for current user', () => {
            const path = service.getCurrentUserProfileImage();
            expect(path).toBeDefined();
            expect(path).toContain('/app/rest/admin/profile-picture');
        });

        it('should catch errors on call for profile', (done) => {
            service.getCurrentUserInfo().subscribe(() => {
            }, () => {
                done();
            });

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 403
            });
        });
    });
});
