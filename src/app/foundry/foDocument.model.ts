
import { Tools } from './foTools'
import { foObject } from './foObject.model'
import { foPage } from './foPage.model'
import { foNode } from './foNode.model'
import { foDictionary } from './foDictionary.model'
import { Lifecycle } from 'app/foundry/foLifecycle';

import { BroadcastChange } from './foChange';

export class foDocument extends foNode {

    pageWidth: number;
    pageHeight: number;

    private _pages: foDictionary<foPage> = new foDictionary<foPage>({ myName: 'pages' });
    private _pageByGuid = {};

    constructor(properties?: any, subcomponents?: Array<foPage>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    get pages() {
        return this._pages;
    }

    findPage(name: string) {
        return this._pages.find(name);
    }

    findPageByGuid(guid: string) {
        if (!Object.keys(this._pageByGuid).length) {
            this.pages.forEachKeyValue((key, page) => {
                this._pageByGuid[page.myGuid] = page;
            });
        }
        return this._pageByGuid[guid];
    }

    createPage(properties?: any) {
        this._pageByGuid = {};
        let nextPage = `Page-${this.pages.count + 1}`;
        let spec = Tools.union(properties, {
            myName: nextPage,
            width: this.pageWidth || 1000,
            height: this.pageHeight || 800,
        });
        this.currentPage = new foPage(spec);

        Lifecycle.event('syncPage', this.currentPage);
        return this.currentPage;
    }

    private _currentPage: foPage
    get currentPage() {
        if (this.pages.count == 0 || !this._currentPage) {
            this._currentPage = this.createPage();
        }
        return this._currentPage;
    }
    set currentPage(page: foPage) {
        if (this._currentPage != page) {
            this._currentPage = page;
            this.pages.addItem(page.myName, page);
            BroadcastChange.changed('currentPage', this);
        }
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foDocument);