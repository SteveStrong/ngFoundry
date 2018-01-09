
import { foLibrary } from './foLibrary.model'
import { foModel } from './foModel.model'
import { foDictionary } from './foDictionary.model'
import { foDocument } from './foDocument.model'
import { foKnowledge } from "../foundry/foKnowledge.model";

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

    private _library: foDictionary<foLibrary> = new foDictionary<foLibrary>({ myName: 'library' });
    private _model: foDictionary<foModel> = new foDictionary<foModel>({ myName: 'model' });
    private _document: foDocument = new foDocument({}, [], this);

    constructor(spec?: any) {
        super(spec);
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

}