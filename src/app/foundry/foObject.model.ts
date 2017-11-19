import { Tools } from './foTools'
import { iObject } from './foInterface'


export class foObject implements iObject {
    myName: string = 'unknown';
    myType: string = '';
    myParent: iObject = undefined;

    constructor() {

    }

    //https://www.npmjs.com/package/reflect-metadata
    //https://stackoverflow.com/questions/13613524/get-an-objects-class-name-at-runtime-in-typescript
    get myComputedType() {
        let comp:any = this.constructor;
        return comp.name;
    }

    asReference() {
        if (this.myParent === undefined) {
            return "\'root\'";
        }
        return this.myName + "." + this.myParent.asReference();
    }

    get hasParent() {
        return this.myParent ? true : false;
    }

    getChildAt(i: number): iObject {
        return undefined;
    }

    get debug() {
        return Tools.stringify(this);
        //return JSON.stringify(this,undefined,3);
    }

    get asJson() {
        let data = Tools.stringify(this);
        return JSON.parse(data);
    }

    jsonMerge(source: any) {
        let result = Tools.asJson(this);
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


