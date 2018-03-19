import { Tools } from './foTools'

import { foDocument } from './shapes/foDocument.model'
import { foStudio } from './solids/foStudio.model'
import { foKnowledge } from "./foKnowledge.model";
import { foDictionary } from './foDictionary.model'

import { foLibrary } from './foLibrary.model'
import { foModel } from './foModel.model'
import { foObject, using } from './foObject.model'

import { foFileManager, fileSpec } from './foFileManager'
import { foHydrationManager } from './foHydrationManager'
import { foInstance } from './foInstance.model'

import { ContextDictionary } from './foDictionaries'

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

export class LibraryDictionary extends foDictionary<foLibrary>{
    public establish = (name: string): foLibrary => {
        this.findItem(name, () => {
            this.addItem(name, new foLibrary({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }

    select(where: WhereClause<foKnowledge>, list?: foCollection<foKnowledge>, deep: boolean = true): foCollection<foKnowledge> {
        let result = list ? list : new foCollection<foKnowledge>();

        this.forEachKeyValue((key, value) => {
            if (where(value)) result.addMember(value);
            value.select(where, result, deep);
        })

        return result;
    }
}

export class ModelDictionary extends foDictionary<foModel>{
    public establish = (name: string): foModel => {
        this.findItem(name, () => {
            this.addItem(name, new foModel({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }

    selectComponent(where: WhereClause<foObject>, list?: foCollection<foObject>, deep: boolean = true): foCollection<foObject> {
        let result = list ? list : new foCollection<foObject>();

        this.forEachKeyValue((key, value) => {
            if (where(value)) result.addMember(value);
            value.select(where, result, deep);
        })

        return result;
    }
}

export class foWorkspace extends foKnowledge {

    public filenameExt: string;

    private _library: LibraryDictionary = new LibraryDictionary({ myName: 'library' }, this);
    private _stencil: LibraryDictionary = new LibraryDictionary({ myName: 'stencil' }, this);

    private _model: ModelDictionary = new ModelDictionary({ myName: 'model' }, this);
    private _context: ContextDictionary = new ContextDictionary({ myName: 'context' }, this);

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

    get context() {
        return this._context;
    }

    get library() {
        return this._library;
    }

    get stencil() {
        return this._stencil;
    }

    public openFile(onComplete?: (item: fileSpec) => void) {
        let manager = new foFileManager();
        manager.userOpenFileDialog(result => {

            this.filenameExt = result.filename;
            onComplete && onComplete(result);

        }, '.json', this.myName)
    }

    public autoSaveFile(onComplete?: (item: fileSpec) => void) {
        let manager = new foFileManager();
        let payload = this.deHydrateInstance(this.activePage);

        manager.writeTextFileAsync(payload, 'stevetest', '.json', (result) => {
            onComplete && onComplete(result);
        })
    }

    public clearActivePage() {
        this.activePage.clearPage();
    }

    public deHydrateInstance(obj: foInstance) {
        let manager  = new foHydrationManager(this);
        let result = manager.deHydrate(obj);
        manager.dispose()
        return result;
    }

    public reHydratePayload(payload: any) {
        let manager  = new foHydrationManager(this);
        let data = Tools.isString(payload) ?  JSON.parse(payload) : payload;
        let result = manager.reHydrate(data);
        manager.dispose()
        return result;
    }

    // public deHydrateInstance(obj: foInstance) {
    //     return using(new foHydrationManager(this), manager => {
    //         return manager.deHydrate(obj);
    //     });
    // }

    // public reHydratePayload(payload: any) {
    //     return using(new foHydrationManager(this), manager => {
    //         let data = Tools.isString(payload) ?  JSON.parse(payload) : payload;
    //         return manager.reHydrate(data);
    //     });
    // }

}

export let globalWorkspace: foWorkspace = new foWorkspace();

Tools['isaWorkspace'] = function (obj) {
    return obj && obj.isInstanceOf(foWorkspace);
};