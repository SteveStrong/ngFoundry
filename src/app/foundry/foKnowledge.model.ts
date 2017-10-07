import { Tools } from './foTools'

import { iObject } from './foObject.model'
import { foTools } from './foTools'

import { foObject } from './foObject.model'
import { foCollection } from './foCollection.model'

interface iKnowledge extends iObject {
}

export class foKnowledge extends foObject {


    constructor(spec: any = undefined) {
        super();
        this.myType = 'foKnowledge';
        this.myName = spec && spec['myName'] ? spec['myName'] : 'unknown';
        this.init(spec);
    }


    init(spec?: any) {
        spec && Tools.forEachKeyValue(spec,  (key, value) => {
            if (Tools.isFunction(value)) {
                Tools.defineCalculatedProperty(this, key, value);
            } else {
                this[key] = value;
            }
        });
        return this;
    }

}