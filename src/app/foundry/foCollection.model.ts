import { foObject } from './foObject.model'


//we want foCollection to be observable

export class foCollection<T extends foObject> extends foObject {
    private _memberType;
    private _members: Array<T>;

    constructor(list:Array<T>=undefined) {
        super();
        this.myType = 'foCollection';
        
        this._members = new Array<T>();
        list && list.forEach(item => this.addMember(item));
    }
    
    get length() {
        return this._members.length;    
    }

    get hasMembers():boolean {
        return this.length > 0;
    }
    
    map(funct) {
        return this._members.map(funct);
    }

    findMember(name: string) {
        return this._members[0];
    }
    
    getMember(id) {
        return this._members[id]
    }
    
    addMember(obj: T) {
        this._members.push(obj);
    }
    
    removeMember(obj: T) {
        this._members.push(obj);
    }  
    
    get members() {
        return this._members;
    }  
}