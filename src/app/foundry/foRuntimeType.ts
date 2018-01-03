
import { Tools } from './foTools';

import { foCollection } from './foCollection.model';
import { PubSub } from "./foPubSub";
import { foNode } from './foNode.model';
import { foKnowledge } from './foKnowledge.model';



export class foRuntimeType {
    public modelPrimitives = {}
    public knowledgePrimitives = {}

    public primitives(): Array<string> {
        return Object.keys(this.modelPrimitives);
    }

    public metaPrimitives(): Array<string> {
        return Object.keys(this.knowledgePrimitives);
    }

    public newInstance(type: string, properties?: any) {
        let create = this.modelPrimitives[type];
        let instance = this.create(create,properties);
        return instance;
    }

    public define<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        let name = type.name;
        this.modelPrimitives[name] = type;
        PubSub.Pub('onRuntimeTypeChanged', name);
        return type;
    }

    public create<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any) {
        let instance = new type(properties) as T;
        instance.initialize();
        return instance;
    }


    public establish<T extends foKnowledge>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type(properties);
        instance.initialize();
        return instance;
    }

    public knowledge<T extends foKnowledge>(type: { new(p?: any): T; }) {
        let name = type.name;
        this.knowledgePrimitives[name] = type;
        PubSub.Pub('onKnowledgeChanged', name);
        return type;
    }

}

export let RuntimeType: foRuntimeType = new foRuntimeType();



