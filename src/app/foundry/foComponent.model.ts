import { Tools } from './foTools'

import { foObject } from './foObject.model'
import { foInstance } from './foInstance.model'
import { foKnowledge } from './foKnowledge.model'
import { foCollection } from './foCollection.model'

export class foComponent extends foInstance {

    public createdFrom: () => foKnowledge;

    constructor(properties?: any, subcomponents?: Array<foInstance>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.createdFrom = undefined;
    }

    setCreatedFrom(source:any) {
        this.createdFrom = () => { return source; };
        this.myClass = source.myName;
    }


    init(properties?: any, subcomponents?: Array<foInstance>, parent?: foObject) {

        this.myName = properties && properties['myName'] ? properties['myName'] : 'unknown';

        //create a different behaviour
        this.override(properties);

        this._subcomponents = new foCollection<foComponent>();
        subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));
        return this;
    }


    //return a new collection that could be destroyed
    subcomponents(): Array<foComponent> {
        let result = new foCollection<foComponent>(this._subcomponents.members as Array<foComponent>);
        return result.members;
    }

    protected toJson(): any {
        let concept = this.createdFrom && this.createdFrom();
        let members = concept && concept.extract(this) || {}
        return Tools.mixin(super.toJson(), members );
    }

}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foComponent);