import { Tools } from '../foundry/foTools'
import { Action } from '../foundry/foInterface'
import { foNode } from '../foundry/foNode.model'

import { RuntimeType } from './foRuntimeType';

class Spec<T extends foNode> {
    myName:string;
    primitive: { new(p?: any, s?: Array<T>, r?: T): T; };
    properties: any; 
    subcomponents: Array<T>;  

    constructor(name:string,type:{ new(p?: any, s?: Array<T>, r?: T): T; }, inits: any, subs:Array<T>) {
        this.myName = name;
        this.primitive = type;
        this.properties = inits;
        this.subcomponents = subs;
    }
    
    newInstance<T extends foNode>(properties?: any, subcomponents?: Array<T>) {
        let spec = Tools.union(properties, this.properties);
        let instance = new this.primitive(spec);
        instance.myClass =this.myName;
        return instance
    }
}

export class Stencil {

    static lookup: any = {};

    static namespaces(): Array<string> {
        return Object.keys(this.lookup);
    }
    static names(namespace:string): Array<string> {
        return Object.keys(this.lookup[namespace]);
    }

    static register<T extends foNode>(id: string, item: Spec<T>): Spec<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);
        if (!this.lookup[namespace]) {
            this.lookup[namespace] = {};
        }
        this.lookup[namespace][name] = item;
        return item;
    }

    static find<T extends foNode>(id: string): Spec<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);
        return this.findSpec(namespace, name);
    }

    static findSpec<T extends foNode>(namespace: string, name: string): Spec<T> {
        let space = this.lookup[namespace];
        let spec = space && space[name];
        return spec;
    }

    static define<T extends foNode>(id:string, type: { new(p?: any, s?: Array<T>, r?: T): T; },  properties?: any, subcomponents?: Array<T>) {
        RuntimeType.define(type);

        let { namespace, name } = Tools.splitNamespaceType(id, type.name);
        let spec = new Spec(Tools.namespace(namespace, name), type, properties, subcomponents);
        return this.register(spec.myName, spec);
    }

    static create<T extends foNode>(id:string, type: { new(p?: any, s?: Array<T>, r?: T): T; },  properties?: any, subcomponents?: Array<T>, func?: Action<T>) {
        RuntimeType.define(type);
        
        let { namespace, name } = Tools.splitNamespaceType(id, type.name);
        let spec = this.findSpec(namespace,name);
        let instance = spec && spec.newInstance(properties, subcomponents) as T;
        func && func(instance);
        return instance;
    }

    static newInstance<T extends foNode>(id:string, properties?: any, subcomponents?: Array<T>, func?: Action<T>) {
        let spec = this.find(id);
        let instance = spec && spec.newInstance(properties, subcomponents) as T;
        func && func(instance);
        return instance;
    }


}


