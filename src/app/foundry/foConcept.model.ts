import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foAttribute } from './foAttribute.model'

import { foObject, iObject } from './foObject.model'
import { foComponent } from './foComponent.model'
import { foNode } from './foNode.model'




export class foConcept extends foKnowledge {

    private _create = (properties?:any, subcomponents?:Array<foNode>, parent?:foObject) => {
         return new foObject();
        }
        
    private _spec: any;
    private _attributes: foDictionary<foAttribute>;
  

    constructor(properties?:any) {
        super(properties);
        this._spec = properties || {};
        this.myType = 'foConcept';
        
        this.createNode();
        //this.createComponent();
    }
   
   get debug() {
       let result = {
           base: this,
           spec: this._spec,
           attribute: this._attributes,
       }       
        return Tools.stringify(result);
    }
    
    newInstance(properties?:any, subcomponents?:Array<foNode>, parent?:foObject){
        let fullSpec = Tools.union(this._spec, properties)
        let result = this._create(fullSpec,subcomponents,parent);
        return result;
    }
    

    //start fluent interface
    target(){
        return this;
    }
    
    createNode() {
        this._create = (properties?, subcomponents?, parent?) => {
         return new foNode(properties, subcomponents, parent);
        }
        return this;
    }
    
    createComponent() {
        this._create = (properties?, subcomponents?, parent?) => {
            return new foComponent(properties, subcomponents, parent);
        }
        return this;
    }
    
    createCustom(funct){
        this._create = funct; 
        return this;
    } 

}