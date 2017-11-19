import { Tools } from '../foundry/foTools'


import { foObject} from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'


export class selectionManager extends foComponent {

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myType = 'selectionManager';
    }


}