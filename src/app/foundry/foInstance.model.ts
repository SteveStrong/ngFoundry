import { Tools, foNames } from './foTools'
import { iObject, iNode, Action } from './foInterface'

import { foObject } from './foObject.model'
import { foNode } from './foNode.model'
import { foConcept } from './foConcept.model';
import { foCollection } from './foCollection.model'
import { foKnowledge } from './foKnowledge.model'

export class foInstance extends foNode {

    public createdFrom: () => foKnowledge;
    setCreatedFrom(source: any) {
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
        let concept = this.createdFrom && this.createdFrom();
        let keys = concept ? concept.specReadWriteKeys() : [];
        return Tools.mixin(super.toJson(), this.extract(keys));
    }

    createCopy(keys?: string[]) {
        let data = this.extractCopySpec(keys);
        let { myType } = data;

        let concept = this.createdFrom && this.createdFrom();
        let copy = concept && concept.newInstance(data);

        let type = RuntimeType.find(myType);
        copy = copy ? copy : RuntimeType.create(type, data);

        return copy;
    }

    public reHydrate(json:any, deep:boolean=true) {
        return this;
    }

    public deHydrate(context?:any, deep:boolean=true) {
        let concept = this.createdFrom && this.createdFrom();
        let keys = concept ? concept.specReadWriteKeys() : [];
        let data = this.extractCopySpec(keys);
        return data;
    }

}

import { RuntimeType } from './foRuntimeType';

RuntimeType.define<foInstance>(foInstance);

Tools['isaInstance'] = function (obj) {
    return obj && obj.isInstanceOf(foInstance);
};