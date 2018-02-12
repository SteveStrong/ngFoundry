import { Tools, foNames } from './foTools'
import { iObject, iNode, Action } from './foInterface'

import { foObject } from './foObject.model'
import { foNode } from './foNode.model'
import { foCollection } from './foCollection.model'
import { foKnowledge } from './foKnowledge.model'

export class foInstance extends foNode {

    public createdFrom: () => foKnowledge;    
    setCreatedFrom(source:any) {
        this.createdFrom = () => { return source; };
        this.myClass = source.myName;
    }

    constructor(properties?: any, subcomponents?: Array<foInstance>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.createdFrom = undefined;
    }

    protected _subcomponents: foCollection<foInstance>;
    get nodes(): foCollection<foInstance> {
        return this._subcomponents;
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            subcomponents: this._subcomponents && this._subcomponents.asJson() 
        });
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define<foInstance>(foInstance);

Tools['isaInstance'] = function (obj) {
    return obj && obj.isInstanceOf(foInstance);
};