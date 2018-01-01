import { Tools } from '../foundry/foTools'
import { Action } from '../foundry/foInterface'
import { foNode } from '../foundry/foNode.model'

import { PubSub } from "./foPubSub";
import { RuntimeType } from './foRuntimeType';

class Spec<T extends foNode> {
    myName: string;
    myType: string;
    primitive: { new(p?: any, s?: Array<T>, r?: T): T; };
    properties: any;
    subcomponents: Array<T>;

    constructor(name: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, inits?: any, subs?: Array<T>) {
        this.myName = name;
        this.myType = type.name;
        this.primitive = type;
        this.properties = inits;
        this.subcomponents = subs;
    }

    newInstance<T extends foNode>(properties?: any, subcomponents?: Array<T>) {
        let spec = Tools.union(properties, this.properties);
        let instance = new this.primitive(spec);
        instance.myClass = this.myName;
        return instance
    }
}

export class Stencil {

    static lookup: any = {};

    static namespaces(): Array<string> {
        return Object.keys(this.lookup);
    }
    static names(namespace: string): Array<string> {
        return Object.keys(this.lookup[namespace]);
    }

    static allSpecifications(): Array<any> {
        let list: Array<any> = new Array<any>();
        Tools.forEachKeyValue(this.lookup, (namespace, obj) => {
            Tools.forEachKeyValue(obj, (name, spec) => {
                let id = `${namespace}::${name}`;
                list.push({
                    id: id,
                    namespace: namespace,
                    name: name,
                    spec: spec,
                });
            })
        })
        return list;
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

    static define<T extends foNode>(id: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any, subcomponents?: Array<T>): Spec<T> {
        RuntimeType.define(type);

        let { namespace, name } = Tools.splitNamespaceType(id, type.name);
        let spec = new Spec(Tools.namespace(namespace, name), type, properties, subcomponents);

        let result = this.register(spec.myName, spec);
        PubSub.Pub('onStencilChanged', result);
        return result;
    }

    static create<T extends foNode>(id: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any, subcomponents?: Array<T>, func?: Action<T>): T {
        RuntimeType.define(type);

        let { namespace, name } = Tools.splitNamespaceType(id, type.name);
        let spec = this.findSpec(namespace, name);
        let instance = spec && spec.newInstance(properties, subcomponents) as T;
        func && func(instance);
        return instance;
    }

    static newInstance<T extends foNode>(id: string, properties?: any, subcomponents?: Array<T>, func?: Action<T>): T {
        let spec = this.find(id);
        let instance = spec && spec.newInstance(properties, subcomponents) as T;
        func && func(instance);
        return instance;
    }


    static override<T extends foNode>(json: any): Spec<T> {
        let { myName, myType, properties, subcomponents } = json;

        let type = RuntimeType.modelPrimitives[myType];
        if ( !type ) {
            throw Error('runtimeType not found ' + type)
        }
        let spec = new Spec<T>(myName, type, properties, subcomponents);

        let result = this.register(myName, spec);
        PubSub.Pub('onStencilChanged', result);
        return result;
    }

}


