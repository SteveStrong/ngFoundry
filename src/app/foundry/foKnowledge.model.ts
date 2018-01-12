import { Tools, foNames } from './foTools'

import { foObject } from './foObject.model'


export class foKnowledge extends foObject {
    private static _counter: number = 0;
    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
       
    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        return this;
    }

    newInstance(properties?: any) {
        return undefined;
    }

    get commands(): Array<string> {
        return [];
    }

    defaultName() {
        if (Tools.matches(this.myName, foNames.UNKNOWN)) {
            foKnowledge._counter += 1;
            let count = ("0000" + foKnowledge._counter).slice(-4);
            this.myName = `${this.myType}_${count}`;
        }
        return this;
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.knowledge(foKnowledge);