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

import { ContentChild, Input, Directive } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { AppConfigService } from '../../app-config/app-config.service';
import { DataColumnListComponent } from '../../data-column/data-column-list.component';
import { DataColumn } from './data-column.model';
import { ObjectDataColumn } from './object-datacolumn.model';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class DataTableSchema {

    @ContentChild(DataColumnListComponent)
    columnList: DataColumnListComponent;

    /** Custom preset column schema in JSON format. */
    @Input()
    presetColumn: string;

    columns: any;

    protected columnsOrder: string[] | undefined;
    protected columnsOrderedByKey: string = 'id';

    protected columnsVisibility: { [columnId: string]: boolean } | undefined;

    private layoutPresets = {};

    private columnsSchemaSubject$ = new ReplaySubject<boolean>();
    isColumnSchemaCreated$ = this.columnsSchemaSubject$.asObservable();

    constructor(private appConfigService: AppConfigService,
                protected presetKey: string,
                protected presetsModel: any) { }

    public createDatatableSchema(): void {
        this.loadLayoutPresets();

        if (!this.columns || this.columns.length === 0) {
            this.createColumns();
            this.columnsSchemaSubject$.next(true);
        } else {
            this.columnsSchemaSubject$.next(false);
        }
    }

    public createColumns(): void {
        const allColumns = this.mergeJsonAndHtmlSchema();
        const columns = this.setHiddenColumns(allColumns);
        this.columns = this.sortColumnsByKey(columns);
    }

    public loadLayoutPresets(): void {
        const externalSettings = this.appConfigService.get(this.presetKey, null);
        if (externalSettings) {
            this.layoutPresets = Object.assign({}, this.presetsModel, externalSettings);
        } else {
            this.layoutPresets = this.presetsModel;
        }
    }

    public mergeJsonAndHtmlSchema(): any {
        const configSchemaColumns = this.getSchemaFromConfig(this.presetColumn);
        const htmlSchemaColumns = this.getSchemaFromHtml(this.columnList);

        let customSchemaColumns = [
            ...configSchemaColumns,
            ...htmlSchemaColumns
        ];

        if (customSchemaColumns.length === 0) {
            customSchemaColumns = this.getDefaultLayoutPreset();
        }

        return customSchemaColumns;
    }

    public getSchemaFromHtml(columnList: DataColumnListComponent): any {
        let schema = [];
        if (columnList && columnList.columns && columnList.columns.length > 0) {
            schema = columnList.columns.map((c) => c as DataColumn);
        }
        return schema;
    }

   public getSchemaFromConfig(presetColumn: string): DataColumn[] {
        return presetColumn ? (this.layoutPresets[presetColumn]).map((col) => new ObjectDataColumn(col)) : [];
    }

    private getDefaultLayoutPreset(): DataColumn[] {
        return (this.layoutPresets['default']).map((col) => new ObjectDataColumn(col));
    }

    public setPresetKey(presetKey: string) {
        this.presetKey = presetKey;
    }

    public setPresetsModel(presetsModel: any) {
        this.presetsModel = presetsModel;
    }

    private sortColumnsByKey(columns: any[]): any[]  {
        const defaultColumns = [...columns];
        const columnsWithProperOrder = [];

        (this.columnsOrder ?? []).forEach(columnKey => {
            const originalColumnIndex = defaultColumns.findIndex(defaultColumn => defaultColumn[this.columnsOrderedByKey] === columnKey);

            if (originalColumnIndex > -1) {
                columnsWithProperOrder.push(defaultColumns[originalColumnIndex]);
                defaultColumns.splice(originalColumnIndex, 1);
            }
        });

        return [...columnsWithProperOrder, ...defaultColumns];
    }

    private setHiddenColumns(columns: DataColumn[]): DataColumn[] {
        if (this.columnsVisibility) {
            return columns.map(column => {
                const isColumnVisible = this.columnsVisibility[column.id];

                return isColumnVisible === undefined ?
                    column :
                    { ...column, isHidden: !isColumnVisible };
            });
        }

        return columns;
    }
}
