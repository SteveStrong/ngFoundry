import { Tools, foNames } from './foTools'
import { iObject, iNode, Action } from './foInterface'

import { foNode } from './foNode.model'
import { foCollection } from './foCollection.model'


export class foInstance extends foNode {

    protected _subcomponents: foCollection<foInstance>;

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