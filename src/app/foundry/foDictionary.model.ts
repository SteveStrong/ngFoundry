import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'


export class foDictionary<T extends foKnowledge> extends foKnowledge {

    private _lookup: any = {};

    constructor(spec: any = undefined) {
        super(spec);
        this.myType = 'foDictionary';
    }

    add(key: string, obj: T) {
        this._lookup[key] = obj;
        return obj;
    }

    get(key: string): T {
        return this._lookup[key];
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