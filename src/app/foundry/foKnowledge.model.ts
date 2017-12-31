import { Tools } from './foTools'


import { foTools } from './foTools'

import { foObject } from './foObject.model'
import { foCollection } from './foCollection.model'



export class foKnowledge extends foObject {

    constructor(properties?: any) {
        super(properties);
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.knowledge(foKnowledge);