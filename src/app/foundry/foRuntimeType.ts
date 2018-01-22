
import { foObject } from './foObject.model';
import { foNode } from './foNode.model';
import { foKnowledge } from './foKnowledge.model';

import { Knowcycle, Lifecycle } from "./foLifecycle";

export class foRuntimeType extends foObject{
    public modelPrimitives = {}
    public knowledgePrimitives = {}

    public primitives(): Array<string> {
        return Object.keys(this.modelPrimitives);
    }

    public metaPrimitives(): Array<string> {
        return Object.keys(this.knowledgePrimitives);
    }

    public find(type: string):any {
        let found = this.modelPrimitives[type];
        found = found ? found : this.knowledgePrimitives[type];
        return found;
    }

    public make(name: string, properties?:any):any {
        let type = this.find(name);
        if ( type ) {
            let instance = new type(properties);
            instance.initialize();
            Lifecycle.created(instance);
            return instance;
        }
    }

    public define<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        let name = type.name;
        if ( !this.modelPrimitives[name]) {
            this.myName = name;
            this.modelPrimitives[name] = type;
            Knowcycle.primitive(this,name);
        }
        return type;
    }

    public create<T extends foNode>(type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any) {
        let instance = new type(properties) as T;
        instance.initialize();
        Lifecycle.created(instance);
        return instance;
    }

    public newInstance(type: string, properties?: any) {
        let create = this.modelPrimitives[type];
        let instance = this.create(create,properties);
        return instance;
    }


    public knowledge<T extends foKnowledge>(type: { new(p?: any): T; }) {
        let name = type.name;
        if ( !this.knowledgePrimitives[name]) {
            this.myName = name;
            this.knowledgePrimitives[name] = type;
            Knowcycle.primitive(this,name);
        }
        return type;
    }

    public construct<T extends foKnowledge>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type(properties);
        instance.initialize();
        Knowcycle.created(instance);
        return instance;
    }

    //https://www.typescriptlang.org/docs/handbook/mixins.html
    public applyMixins(derivedCtor: any, baseCtors: any[]) {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }

}

export let RuntimeType: foRuntimeType = new foRuntimeType();



