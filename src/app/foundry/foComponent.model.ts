
import { Tools } from './foTools'
import { iObject, iNode } from './foInterface'

import { foObject } from './foObject.model'
import { foNode } from './foNode.model'
import { foCollection } from './foCollection.model'

export class foComponent extends foNode {  
    
    constructor(properties?:any, subcomponents?:Array<foNode>, parent?:foObject) {
        super(properties,subcomponents,parent);
    }
    
        
    init(properties?:any, subcomponents?:Array<foNode>, parent?:foObject) {
      
        this.myName = properties &&  properties['myName'] ? properties['myName'] : 'unknown'; 

        //create a different behaviour
        this.override(properties);
        
        this._subcomponents = new foCollection<foComponent>();
        subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));   
        return this;
    }


    //return a new collection that could be destroyed
    subcomponents():Array<foComponent> {
        let result = new foCollection<foComponent>(this._subcomponents.members as Array<foComponent>);
        return result.members;
    }



}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foComponent);