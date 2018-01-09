import { foObject } from './foObject.model'
import { foComponent } from './foComponent.model'

export class foModel extends foComponent {
    
    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foModel);