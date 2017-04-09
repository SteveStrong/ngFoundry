
import { Tools } from './foTools'

import { foObject, iObject } from './foObject.model'
import { foNode } from './foNode.model'
import { foCollection } from './foCollection.model'

export class foComponent extends foNode {  
    
    constructor(properties?:any, subcomponents?:Array<foComponent>, parent?:foObject) {
        super(properties,subcomponents,parent);
       
        this.myType = 'foComponent';
    }
    
        
    init(properties?:any, subcomponents?:Array<foComponent>, parent?:foObject) {
        var self = this;
        
        this.myName = properties &&  properties['myName'] ? properties['myName'] : 'unknown'; 

        //create a different behaviour
        Tools.forEachKeyValue(properties, function(key,value) {
            if (Tools.isFunction(value) ) {
                Tools.defineCalculatedProperty(self, key, value);                
            } else {
                self[key] = value;                
            }
        });
        
        this._subcomponents = new foCollection<foComponent>();
        subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));   
        return this;
    }

}