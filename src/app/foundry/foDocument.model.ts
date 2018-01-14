
import { Tools } from './foTools'
import { foObject } from './foObject.model'
import { foPage } from './foPage.model'
import { foNode } from './foNode.model'
import { foDictionary } from './foDictionary.model'

export class foDocument extends foNode {

    pageWidth:number;
    pageHeight:number;

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
        if ( !Object.keys(this._pageByGuid).length) {
            this.pages.forEachKeyValue((key,page)=> {
                this._pageByGuid[page.myGuid] = page;
            });
        }
        return this._pageByGuid[guid];
    }

    createPage(properties?: any) { 
        let nextPage = `Page-${this.pages.count + 1}`;
        let spec = Tools.union(properties, { 
            myName: nextPage,
            width: this.pageWidth || 1000,
            height: this.pageHeight || 800,
        });
        this.currentPage = new foPage(spec);
        this._pageByGuid = {};
        Lifecycle.event('syncPage',this.currentPage);
        return this.currentPage;
    }

    _currentPage: foPage
    get currentPage() {
        if (this.pages.count == 0 || !this._currentPage) {
            this._currentPage = this.createPage();
        }
        return this._currentPage;
    }
    set currentPage(page: foPage) {
        this._currentPage = page;
        this.pages.addItem(page.myName, page);
    }
}

import { RuntimeType } from './foRuntimeType';
import { Lifecycle } from 'app/foundry/foLifecycle';
RuntimeType.define(foDocument);