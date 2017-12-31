
import { Tools } from './foTools';

import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foKnowledge } from './foKnowledge.model';



export class RuntimeType {
    static modelPrimitives = {}
    static knowledgePrimitives = {}

    static newInstance(type: string, properties?: any) {
        let create = this.modelPrimitives[type];
        let instance = this.create(create,properties);
        return instance;
    }

    static define<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        let name = type.name;
        this.modelPrimitives[name] = type;
        return type;
    }

    static create<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any) {
        let instance = new type(properties) as T;
        return instance;
    }


    static establish<T extends foKnowledge>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type(properties);
        return instance;
    }

    static knowledge<T extends foKnowledge>(type: { new(p?: any): T; }) {
        let name = type.name;
        this.knowledgePrimitives[name] = type;
        return type;
    }

}



