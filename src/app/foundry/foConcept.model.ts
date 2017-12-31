import { Tools } from './foTools'
import { iObject, Action } from '../foundry/foInterface'
import { PubSub } from './foPubSub'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foAttribute, foViewAttribute } from './foAttribute.model'

import { foObject } from './foObject.model'
import { foComponent } from './foComponent.model'
import { foNode } from './foNode.model'

import { RuntimeType } from './foRuntimeType';

export class foConcept<T extends foNode> extends foKnowledge {

    private _create = (properties?: any, subcomponents?: Array<foNode>, parent?: foObject): T => {
        return <T>new foNode(properties, subcomponents, parent);
    }

    private _core: string;
    get core(): string { return this._core; }
    set core(value: string) { this._core = value; }

    private _specification: any;
    get specification(): any { return this._specification; }
    set specification(value: any) { this._specification = value; }


    private _attributes: foDictionary<foAttribute> = new foDictionary<foAttribute>({ myName: 'attributes' });
    private _projections: foDictionary<foProjection<T>> = new foDictionary<foProjection<T>>({ myName: 'projections' });




    constructor(properties?: any) {
        super(properties);
    }

    defineCore(id:string, core: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        this.myName = id;
        this.core = core;
        this._create = (properties?: any, subcomponents?: Array<T>, parent?: T) => {
            return new type(properties, subcomponents, parent);
        }
        return this;
    }


    get attributes() {
        if (!this._attributes) {
            this._attributes = new foDictionary<foAttribute>({ myName: 'attributes' });
        }
        return this._attributes;
    }

    establishAttribute(key: string, spec: any = undefined) {
        let attributes = this.attributes;
        let attribute = attributes.getItem(key);
        if (!attribute) {
            attribute = attributes.addItem(key, new foAttribute(spec));
            attribute.myName = key;

            PubSub.Pub("attribute", ["added", this, attribute]);
        }
        return attribute;
    }

    get projections() {
        if (!this._projections) {
            this._projections = new foDictionary<foProjection<T>>({ myName: 'projections' });
        }
        return this._projections;
    }

    establishProjection(key: string, spec: any = undefined) {
        let projections = this.projections;
        let projection = projections.getItem(key);
        if (!projection) {
            projection = new foProjection(this, spec);
            projections.addItem(key, projection);
            projection.myName = key;
        }
        return projection;
    }

    get debug() {
        let result = {
            base: this,
            spec: this._specification,
            core: this._core,
            attributes: this._attributes,
            projections: this._projections,
        }
        return Tools.stringify(result);
    }

    get asJson() {
        let result = Tools.asJson(this);
        result.core = this._core;
        result.specification = this._specification;
        result.attributes = Tools.asArray(this.attributes.asJson);
        result.projections = Tools.asArray(this.projections.asJson);
        return result;
    }

    newInstance(properties?: any, subcomponents?: Array<T>, parent?: T): T {
        let spec = Tools.union(this.specification, properties);
        let result = this._create(spec, subcomponents, parent) as T;
        result.initialize();
        return result;
    }

}


RuntimeType.knowledge(foConcept);

export class foProjection<T extends foNode> extends foConcept<T> {

    private _mySource: foConcept<T> = undefined;

    constructor(source: foConcept<T>, properties?: any) {
        super(properties);
        this._mySource = source;

        PubSub.Sub("attribute", (action, source, attribute) => {
            if (this._mySource === source) {
                let view = this.establishViewAttribute(attribute)
            }
        });
    }

    establishViewAttribute(attribute: foAttribute, spec: any = undefined) {
        let attributes = this.attributes;
        let key = attribute.myName;
        let view = <foViewAttribute>attributes.getItem(key);
        if (!view) {
            view = new foViewAttribute(attribute, spec);
            this.attributes.addItem(key, view);
            view.myName = key;

        }
        return view;
    }
}

RuntimeType.knowledge(foProjection);

export class Concept {
    static lookup: any = {}

    static allConcepts(): Array<any> {
        let list: Array<any> = new Array<any>();
        Tools.forEachKeyValue(this.lookup, (namespace, obj) => {
            Tools.forEachKeyValue(obj, (name, concept) => {
                let id = `${namespace}::${name}`;
                list.push({
                    id: id,
                    namespace: namespace,
                    name: name,
                    concept: concept
                });
            })
        })
        return list;
    }

    static find<T extends foNode>(id: string): foConcept<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);
        let concept = this.findConcept(namespace, name) as foConcept<T>;
        return concept;
    }

    static register<T extends foNode>(id: string, concept: foConcept<T>): foConcept<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);

        return this.registerConcept(namespace, name, concept);
    }

    static registerConcept<T extends foNode>(namespace: string, name: string, concept: foConcept<T>): foConcept<T> {
        if (!this.lookup[namespace]) {
            this.lookup[namespace] = {};
        }
        this.lookup[namespace][name] = concept;
        return concept;
    }

    static findConcept<T extends foNode>(namespace: string, name: string): foConcept<T> {
        let space = this.lookup[namespace];
        let concept = space && space[name];
        return concept;
    }

    static define<T extends foNode>(id: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any): foConcept<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);

        let concept = new foConcept<T>(properties);
        concept.defineCore(id, type.name, type);

        return this.registerConcept(namespace, name, concept);
    }


    static makeInstance<T extends foNode>(id: string, properties?: any, func?: Action<T>): T {
        let { namespace, name } = Tools.splitNamespaceType(id);
        let concept = this.findConcept(namespace, name);

        let instance = concept.newInstance(properties) as T;
        func && func(instance);
        return instance;
    }
}