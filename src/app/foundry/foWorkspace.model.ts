import { Tools } from './foTools'

import { foLibrary } from './foLibrary.model'
import { foModel } from './foModel.model'
import { foDictionary } from './foDictionary.model'
import { foKnowledge } from "../foundry/foKnowledge.model";

export class foWorkspace extends foKnowledge {

    private _library: foDictionary<foLibrary> = new foDictionary<foLibrary>({ myName: 'library' });
    private _model: foDictionary<foModel> = new foDictionary<foModel>({ myName: 'model' });
 
    constructor(spec?: any) {
        super(spec);
    }

}