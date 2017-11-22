import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'


export class foDictionary<T extends foKnowledge> extends foKnowledge {

    private _lookup: any = {};

    constructor(spec: any = undefined) {
        super(spec);
    }

    addItem(key: string, obj: T): T {
        this._lookup[key] = obj;
        return obj;
    }

    getItem(key: string): T {
        let result: T = this._lookup[key];
        return result;
    }

    findItem(key: string, onMissing?): T {
        let found = this.getItem(key);
        if (!found && onMissing) {
            onMissing();
            found = this.getItem(key);
        }
        return found;
    }

    found(key: string, onFound?): T {
        let found = this.getItem(key);
        if (found && onFound) {
            onFound(found);
            found = this.getItem(key);
        }
        return found;
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
        for(let key in this._lookup) {
            let value = this._lookup[key];
            mapFunc(value);
        };
    };

    get asJson() {
        let result = this.jsonMerge(this._lookup);
        return result;
    }

    jsonMerge(source: any) {
        let result = {};
        if (!Tools.isEmpty(source)) {
            Tools.forEachKeyValue(source, (key, value) => {
                if (!result[key] && !Tools.isEmpty(value)) {
                    let json = value && value.asJson;
                    result[key] = json ? json : value;
                }
            });
        }
        return result;
    }
}