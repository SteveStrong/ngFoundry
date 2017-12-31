
import { foTools } from './foTools'
import { iObject } from './foInterface'

import { foObject } from './foObject.model'
import { foCollection } from './foCollection.model'
import { foComponent } from './foComponent.model'

export class foModel extends foComponent {
    
    constructor(spec:any=undefined, subcomponents:Array<foComponent>=undefined, parent:foObject=undefined) {
        super(spec,subcomponents,parent); 
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.model(foModel);