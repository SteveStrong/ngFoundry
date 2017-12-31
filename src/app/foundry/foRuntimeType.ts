
import { Tools } from './foTools';

import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foKnowledge } from './foKnowledge.model';



export class RuntimeType {
    static modelTypes = {}
    static knowledgeTypes = {}

    static model<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        let instance = new type();
        let name = instance.myType;
        this.modelTypes[name] = type;
        return name;
    }

    static knowledge<T extends foKnowledge>(type: { new(p?: any): T; }) {
        let instance = new type();
        let name = instance.myType;
        this.knowledgeTypes[name] = type;
        return name;
    }

}



