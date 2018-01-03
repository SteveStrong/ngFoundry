import { Tools } from '../foundry/foTools'
import { Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { foGlyph } from '../foundry/foGlyph.model'

import { PubSub } from "./foPubSub";
import { RuntimeType } from './foRuntimeType';

export class foStencilSpec<T extends foGlyph> extends foObject {

    primitive: string;
    create: { new(p?: any, s?: Array<T>, r?: T): T; };
    properties: any;
    subcomponents: Array<T>;
    commands: Array<string> = new Array<string>();

    constructor(props?:any){
        super()
        props && Tools.mixin(this, props)
    }

    set(name: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, inits?: any, subs?: Array<T>) {
        this.myName = name;
        this.primitive = type.name;
        this.create = type;
        this.properties = inits;
        this.subcomponents = subs;
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            primitive: this.primitive,
            properties: this.properties,
            subcomponents: this.subcomponents,
        });
    }

    newInstance<T extends foGlyph>(properties?: any, subcomponents?: Array<T>) {
        let spec = Tools.union(properties, this.properties);
        let instance = new this.create(spec);
        instance.myClass = this.myName;
        return instance;
    }


    addCommands(...cmds: string[]) {
        this.commands && this.commands.push(...cmds)
        return this;
    }

    getCommands(): Array<string> {
        return this.commands;
    }
}

export class foStencilItem extends foObject {
    id: string;
    namespace: string;
    name: string;
    primitive: string;
    spec: foStencilSpec<foGlyph>;

    constructor(props?:any){
        super()
        props && Tools.mixin(this, props)
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            id: this.id,
            namespace: this.namespace,
            name: this.name,
            primitive: this.primitive,
            spec: this.spec,
        });
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

    static allStencilItem(): Array<foStencilItem> {
        let list: Array<foStencilItem> = new Array<foStencilItem>();
        Tools.forEachKeyValue(this.lookup, (namespace, obj) => {
            Tools.forEachKeyValue(obj, (name, spec) => {
                let id = `${namespace}::${name}`;
                let item = new foStencilItem({
                    id: id,
                    namespace: namespace,
                    name: name,
                    primitive: spec.primitive,
                    spec: spec,
                });
                list.push(item);
            })
        })
        return list;
    }

    static register<T extends foGlyph>(id: string, item: foStencilSpec<T>): foStencilSpec<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);
        if (!this.lookup[namespace]) {
            this.lookup[namespace] = {};
        }
        this.lookup[namespace][name] = item;
        return item;
    }

    static find<T extends foGlyph>(id: string): foStencilSpec<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);
        return this.findSpec(namespace, name);
    }

    static findSpec<T extends foGlyph>(namespace: string, name: string): foStencilSpec<T> {
        let space = this.lookup[namespace];
        let spec = space && space[name];
        return spec;
    }

    static define<T extends foGlyph>(id: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any, subcomponents?: Array<T>): foStencilSpec<T> {
        RuntimeType.define(type);

        let { namespace, name } = Tools.splitNamespaceType(id, type.name);
        let spec = new foStencilSpec<T>();
        spec.set(Tools.namespace(namespace, name), type, properties, subcomponents);

        let result = this.register(spec.myName, spec);
        PubSub.Pub('onStencilChanged', result);
        return result;
    }

    static create<T extends foGlyph>(id: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any, subcomponents?: Array<T>, func?: Action<T>): T {
        RuntimeType.define(type);

        let { namespace, name } = Tools.splitNamespaceType(id, type.name);
        let spec = this.findSpec(namespace, name);
        let instance = spec && spec.newInstance(properties, subcomponents) as T;
        func && func(instance);
        return instance;
    }

    static newInstance<T extends foGlyph>(id: string, properties?: any, subcomponents?: Array<T>, func?: Action<T>): T {
        let spec = this.find(id);
        let instance = spec && spec.newInstance(properties, subcomponents) as T;
        func && func(instance);
        return instance;
    }


    static override<T extends foGlyph>(json: any): foStencilSpec<T> {
        let { myName, myType, properties, subcomponents, commands } = json;

        let type = RuntimeType.modelPrimitives[myType];
        if (!type) {
            throw Error('runtimeType not found ' + type)
        }
        let spec = new foStencilSpec<T>();
        spec.set(myName, type, properties, subcomponents);
        spec.addCommands(...commands);
        
        let result = this.register(myName, spec);
        PubSub.Pub('onStencilChanged', result);
        return result;
    }

}


