
import { foKnowledge } from './foKnowledge.model'


export class foDictionary<T extends foKnowledge> extends foKnowledge {

    private _lookup: any = {};
   

    constructor(spec:any=undefined) {
        super(spec);
        this.myType = 'foDictionary';       
    }
    
    add(key:string, obj:T){
        this._lookup[key] = obj;
        return obj;
    }
    
    get(key:string):T {
        return this._lookup[key];
    }
    
    get keys() {
        return Object.keys(this._lookup);
    }
    
    get members() {
        let keys = this.keys;
        let list = keys.map(key => this._lookup[key] );
        return list;
    }
}