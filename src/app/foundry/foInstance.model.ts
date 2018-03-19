import { Tools } from './foTools'

import { foObject } from './foObject.model'
import { foNode } from './foNode.model'

import { foCollection } from './foCollection.model'
import { foKnowledge } from './foKnowledge.model'

export class foInstance extends foNode {

    public createdFrom: () => foKnowledge;
    setCreatedFrom(source: any) {
        this.createdFrom = () => { return source; };
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

        let concept = this.createdFrom && this.createdFrom();
        let copy = concept && concept.newInstance(data);
        if (copy) return copy;

        let { myType } = data;
        let type = RuntimeType.find(myType);
        copy = RuntimeType.create(type, data);

        return copy;
    }

    createDeepCopy(): foInstance {
        let copy = this.createCopy();

        this.nodes.forEach(item => {
            let child = item.createDeepCopy();
            copy.addSubcomponent(child);
        })
        return copy;
    }

    public isEqualTo(obj: foInstance, deep: boolean = true) {
        let result = true;

        Object.keys(this).forEach(key => {
            let local: any = this[key];
            let other: any = obj[key];

            let isLocal = local instanceof foInstance;
            let isOther = other instanceof foInstance;

            let isLocalCol = local instanceof foCollection;
            let isOtherCol = other instanceof foCollection;

            let isLocalFn = Tools.isFunction(local);
            let isOtherFn = Tools.isFunction(other);

            if ((isLocal && isOther) || (isLocalCol && isOtherCol)) {
                result = local.isEqualTo(other) ? result : false;
            } else if (isLocalFn && isOtherFn) {

            } else if (key == 'myGuid' || key.startsWith('_') || key == 'UnDo') {
                //skip over myGuid 
            } else {
                result = (local == other) ? result : false;
            }

            if (!result) {
                return false;
            }

        })
        return result;
    }


    public reHydrate(json: any) {
        this.override(json);
        return this;
    }

    public deHydrate(context?: any, deep: boolean = true) {
        let concept = this.createdFrom && this.createdFrom();
        let keys = concept ? concept.specReadWriteKeys() : [];
        let data = this.extractCopySpec(keys);

        if (deep && this.nodes.count) {
            data.subcomponents = this.nodes.map(item => {
                let child = item.deHydrate(context, deep);
                return child;
            })
        }
        return data;
    }

}

import { RuntimeType } from './foRuntimeType';

RuntimeType.define<foInstance>(foInstance);

Tools['isaInstance'] = function (obj) {
    return obj && obj.isInstanceOf(foInstance);
};