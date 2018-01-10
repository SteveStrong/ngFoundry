
import { Tools } from './foTools'
import { foObject } from './foObject.model'
import { foPage } from './foPage.model'
import { foNode } from './foNode.model'
import { foDictionary } from './foDictionary.model'

export class foDocument extends foNode {
    
    private _pages: foDictionary<foPage> = new foDictionary<foPage>({ myName: 'pages' });

    constructor(properties?: any, subcomponents?: Array<foPage>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    get pages() {
        return this._pages;
    }



    createPage(properties?:any){
        let nextPage = `Page-${this.pages.count + 1}`;
        let spec = Tools.union(properties, {myName: nextPage})
        let page = new foPage(spec);
        this.pages.addItem(page.myName, page);
        return page;
    }

    _currentPage:foPage 
    get currentPage(){
        if (this.pages.count == 0 || !this._currentPage){
            this._currentPage = this.createPage();
        }
        return this._currentPage;
    }
    set currentPage(page:foPage){
        this._currentPage = page;
        this.pages.addItem(page.myName, page);
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foDocument);