import { foLibrary } from './foLibrary.model'
import { foModel } from './foModel.model'
import { foDictionary } from './foDictionary.model'
import { foDocument } from './foDocument.model'
import { foKnowledge } from "../foundry/foKnowledge.model";
import { foObject } from 'app/foundry/foObject.model';

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

class LibraryDictionary extends foDictionary<foLibrary>{
    public establish = (name: string): foLibrary => {
        this.findItem(name, () => {
            this.addItem(name, new foLibrary({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }
}

class ModelDictionary extends foDictionary<foModel>{
    public establish = (name: string): foModel => {
        this.findItem(name, () => {
            this.addItem(name, new foModel({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }
}

export class foWorkspace extends foKnowledge {

    private _library: LibraryDictionary = new LibraryDictionary({ myName: 'library' }, this);
    private _stencil: LibraryDictionary = new LibraryDictionary({ myName: 'stencil' }, this);
    private _model: ModelDictionary = new ModelDictionary({ myName: 'model' }, this);
    private _document: foDocument = new foDocument({}, [], this);

    constructor(spec?: any) {
        super(spec);
    }

    get activePage() {
        return this._document.currentPage
    }

    select(where: WhereClause<foKnowledge>, list?: foCollection<foKnowledge>, deep: boolean = true): foCollection<foKnowledge> {
        let result = super.select(where, list, deep);

        this.library.forEachKeyValue((key,value) => {
            value.select(where, result, deep);
        });

        this.stencil.forEachKeyValue((key,value) => {
            value.select(where, result, deep);
        })

        return result;
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