

import { iObject } from './foObject.model'
import { foTools } from './foTools'

import { foObject } from './foObject.model'
import { foCollection } from './foCollection.model'

interface iKnowledge extends iObject {   
}

export class foKnowledge extends foObject {
   

    constructor(spec:any=undefined) {
        super();
        this.myType = 'foKnowledge';
        this.myName = spec &&  spec['myName'] ? spec['myName'] : 'unknown'; 
    }


}