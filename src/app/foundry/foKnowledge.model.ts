import { Tools } from './foTools'


import { foTools } from './foTools'

import { foObject } from './foObject.model'
import { foCollection } from './foCollection.model'



export class foKnowledge extends foObject {


    constructor(spec: any = undefined) {
        super();
        this.myName = spec && spec['myName'] ? spec['myName'] : 'unknown';
        this.override(spec);
    }


}