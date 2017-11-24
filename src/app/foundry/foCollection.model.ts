import { foObject } from './foObject.model'
import { iObject, Action, Func } from './foInterface'

//we want foCollection to be observable

export class foCollection<T extends iObject> extends foObject {
    private _memberType;
    private _members: Array<T>;

    constructor(list: Array<T> = undefined) {
        super();

        this._members = new Array<T>();
        list && list.forEach(item => this.addMember(item));
    }

    getChildAt(i: number): T {
        return this._members[i]
    }

    isEmpty(): boolean {
        return this._members.length == 0;
    }

    get length() {
        return this._members.length;
    }

    get hasMembers(): boolean {
        return this.length > 0;
    }

    map(funct) {
        return this._members.map(funct);
    }

    forEach(funct:Action<T>) {
        this._members.forEach(funct);
    }

    filter(funct:Func<T, boolean>) {
        return this._members.filter(funct);
    }

    findMember(name: string):T {
        return this._members[0];
    }

    getMember(id):T {
        return this._members[id]
    }

    addMember(obj: T):T {
        this._members.push(obj);
        return obj;
    }

    removeMember(obj: T):T {
        var index = this._members.indexOf(obj);
        if ( index > -1 ){
            this._members.splice(index, 1);
        }
        return obj;   
    }

    get members() {
        return this._members;
    }


    moveToTop(item: T) {
        let loc = this._members.indexOf(item);
        if (loc != -1) {
            this._members.splice(loc, 1);
            this._members.push(item);
        }
        return this._members;
    }
}