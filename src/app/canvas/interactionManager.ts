

import { Tools } from '../foundry/foTools'
import { foObject, iObject } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'


export class interactionManager extends foComponent {

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myType = 'interactionManager';
    }


}