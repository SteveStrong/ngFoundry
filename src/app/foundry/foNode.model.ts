
import { Tools } from './foTools'

import { foObject, iObject } from './foObject.model'
import { foCollection } from './foCollection.model'

export class foNode extends foObject {
    private _myGuid:string;
    
    _subcomponents: foCollection<foNode>;

     constructor(properties?:any, subcomponents?:Array<foNode>, parent?:foObject) {
        super();
        this.myType = 'foNode';
        this.init(properties,subcomponents,parent)
     }
    
    init(properties?:any, subcomponents?:Array<foNode>, parent?:foObject) {
        var self = this;
     
        Tools.forEachKeyValue(properties, function(key,value) {
            if (Tools.isFunction(value) ) {
                Tools.defineCalculatedProperty(self, key, value);                
            } else {
                self[key] = value;                
            }
        });
        
        this._subcomponents = new foCollection<foNode>();
        subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));   
        return this;
    }
    
    get myGuid() {
      if ( !this._myGuid) {
        this._myGuid = Tools.generateUUID();
      }
      return this._myGuid;
    }
    
    //todo modify api to take bote item and array
    addSubcomponent(obj:foNode) {
        if (!obj) return;
        if ( !obj.myParent) {
            obj.myParent = this;
        }
        this._subcomponents.addMember(obj);
        return obj;
    }

    removeSubcomponent(obj:foNode) {
        this._subcomponents.removeMember(obj);
    }  
    
    get Subcomponents() {
        return this._subcomponents.members;
    }  
  
}