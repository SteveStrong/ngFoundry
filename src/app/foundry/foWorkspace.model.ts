import { Tools } from './foTools'

import { foDocument } from './shapes/foDocument.model'
import { foStudio } from './solids/foStudio.model'
import { foKnowledge } from "./foKnowledge.model";
import { ModelDictionary, LibraryDictionary } from './foDictionaries';

import { foCollection } from './foCollection.model'
import { WhereClause } from "./foInterface";

// Feature detect + local reference
export let storage = (function () {
    let uid = (new Date()).toISOString();
    let result;
    try {
        localStorage.setItem(uid, uid);
        result = localStorage.getItem(uid) == uid;
        localStorage.removeItem(uid);
        return result && localStorage;
    } catch (exception) { }
}());



export class foWorkspace extends foKnowledge {

    private _library: LibraryDictionary = new LibraryDictionary({ myName: 'library' }, this);
    private _stencil: LibraryDictionary = new LibraryDictionary({ myName: 'stencil' }, this);
    private _model: ModelDictionary = new ModelDictionary({ myName: 'model' }, this);
   
    private _document: foDocument = new foDocument({}, [], this);
    private _studio: foStudio = new foStudio({}, [], this);

    constructor(spec?: any) {
        super(spec);
    }

    get activePage() {
        return this._document.currentPage
    }

    get activeStage() {
        return this._studio.currentStage
    }

    select(where: WhereClause<foKnowledge>, list?: foCollection<foKnowledge>, deep: boolean = true): foCollection<foKnowledge> {
        let result = super.select(where, list, deep);

        this.library.select(where, result, deep);

        this.stencil.select(where, result, deep);
  
        return result;
    }

    get studio() {
        return this._studio;
    }

    get document() {
        return this._document;
    }

    get model() {
        return this._model;
    }

    get library() {
        return this._library;
    }

    get stencil() {
        return this._stencil;
    }

}

export let globalWorkspace: foWorkspace = new foWorkspace();

Tools['isaWorkspace'] = function (obj) {
    return obj && obj.isInstanceOf(foWorkspace);
};