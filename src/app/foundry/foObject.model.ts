import { Tools } from './foTools'
import { iObject, Action, ModelRef } from './foInterface'


export class foObject implements iObject {
    myName: string = 'unknown';
    myParent: ModelRef<iObject>;

    constructor(properties?: any, parent?: foObject) {
        this.myParent = () => { return parent };
        this.override(properties);
    }

    static typeName(): string {
        let comp: any = this.constructor;
        return comp.name;
    }

    //https://www.npmjs.com/package/reflect-metadata
    //https://stackoverflow.com/questions/13613524/get-an-objects-class-name-at-runtime-in-typescript
    get myType(): string {
        let comp: any = this.constructor;
        return comp.name;
    }
    set myType(ignore: string) {
    }

    asReference(): string {
        let parent = this.myParent && this.myParent();
        if (!parent) {
            return `root`;
        }
        return `${this.myName}.${parent.asReference()}`;
    }

    get hasParent() {
        let parent = this.myParent && this.myParent();
        return parent ? true : false;
    }

    getChildAt(i: number): iObject {
        return undefined;
    }

    override(properties?: any) {
        const self = this;

        properties && Tools.forEachKeyValue(properties, function (key, value) {
            if (Tools.isFunction(value)) {
                Tools.defineCalculatedProperty(self, key, value);
            } else {
                self[key] = value;
            }
        });

        return self;
    }

    extend(properties?: any) {
        const self = this;

        properties && Tools.forEachKeyValue(properties, function (key, value) {
            if (!self[key]) {
                if (Tools.isFunction(value)) {
                    Tools.defineCalculatedProperty(self, key, value);
                } else {
                    self[key] = value;
                }
            }
        });

        return self;
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


