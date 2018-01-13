import { Tools } from './foTools'

import { foObject } from './foObject.model'
import { iObject } from './foInterface'

export class foDictionary<T extends iObject> extends foObject {

    private _lookup: any = {};

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }

    find(key: string): T {
        let result: T = this._lookup[key];
        return result;
    }

    add(obj: T): T {
        return this.addItem(obj.myName, obj);
    }

    addItem(key: string, obj: T): T {
        this._lookup[key] = obj;
        return obj;
    }

    remove(obj: T): T {
        return this.removeItem(obj.myName);
    }

    removeItem(key: string): T {
        let obj = this._lookup[key];
        delete this._lookup[key];
        return obj;
    }

    getItem(key: string): T {
        let result: T = this._lookup[key];
        return result;
    }

    findItem(key: string, onMissing?, onFound?): T {
        let found = this.getItem(key);
        if (!found && onMissing) {
            onMissing(key);
            found = this.getItem(key);
        } else if (found) {
            onFound && onFound(found);
        }
        return found;
    }

    found(key: string, onFound?, onMissing?): T {
        let found = this.getItem(key);
        if (found && onFound) {
            onFound(found);
            found = this.getItem(key);
        } else if (!found) {
            onMissing && onMissing(key);
        }
        return found;
    }

    clearAll() {
        this._lookup = {};
    }

    get count() {
        return Object.keys(this._lookup).length;
    }

    get keys() {
        return Object.keys(this._lookup);
    }

    get members() {
        let keys = this.keys;
        let list = keys.map(key => this._lookup[key]);
        return list;
    }

    get values() {
        let result = this._lookup;
        return result;
    }

    mapMembers(mapFunc) {  //funct has 2 args.. key,value
        let keys = this.keys;
        let list = keys.map(key => mapFunc(this._lookup[key]));
        return list;
    };

    forEachKeyValue(mapFunc) {  //funct has 2 args.. key,value
        let keys = this.keys;
        keys.forEach(key => {
            let value = this._lookup[key];
            mapFunc(key, value);
        });
    };

    applyTo(mapFunc) {  //funct has 1 args.. value
        for (let key in this._lookup) {
            let value = this._lookup[key];
            mapFunc(value);
        };
    };

    protected toJson(): any {
        return Tools.mixin(super.toJson(), this.jsonMerge(this._lookup));
    }

}

