import { Tools } from './foTools'
import { iObject, Action } from '../foundry/foInterface'
import { PubSub } from './foPubSub'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foAttribute, foViewAttribute } from './foAttribute.model'

import { foObject } from './foObject.model'
import { foComponent } from './foComponent.model'
import { foNode } from './foNode.model'



export class foConcept<T extends foNode> extends foKnowledge {

    private _create = (properties?: any, subcomponents?: Array<foNode>, parent?: foObject): T => {
        return <T>new foNode(properties, subcomponents, parent);
    }

    private _spec: any;
    private _init: Action<T>;

    private _attributes: foDictionary<foAttribute> = new foDictionary<foAttribute>({ myName: 'attributes' });
    private _projections: foDictionary<foProjection<T>> = new foDictionary<foProjection<T>>({ myName: 'projections' });


    createType(type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        this._create = (properties?: any, subcomponents?: Array<T>, parent?: T) => {
            return new type(properties, subcomponents, parent);
        }
        return this;
    }

    constructor(properties?: any, create?: (properties?: any, subcomponents?: Array<T>, parent?: T ) => T, init?:Action<T>) {
        super(properties);
        this._spec = properties || {};
        this._init = init;

        if (create) {
            this._create = create;
        } else {
            this._create = (p?: any, s?: Array<T>, r?: T) => { return new foNode(p,s,r) as T; };
        }

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
            spec: this._spec,
            attributes: this._attributes,
            projections: this._projections,
        }
        return Tools.stringify(result);
    }

    get asJson() {
        let result = Tools.asJson(this);
        result.attributes = Tools.asArray(this.attributes.asJson);
        result.projections = Tools.asArray(this.projections.asJson);
        //let result = this.jsonMerge(this._attributes.values);
        return result;
    }

    newInstance(properties?: any, subcomponents?: Array<T>, parent?: T): T {
        let fullSpec = Tools.union(this._spec, properties)
        let result = this._create(fullSpec, subcomponents, parent) as T;
        this._init && this._init(result);
        return result;
    }

}

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

export class Concept {
    static lookup = {}

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
        let space = this.lookup[namespace] ? this.lookup[namespace] : {}
        space[name] = concept;
        return concept;
    }

    static findConcept<T extends foNode>(namespace: string, name: string): foConcept<T> {
        let space = this.lookup[namespace];
        let concept = space && space[name];
        return concept;
    }

    static define<T extends foNode>(id: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, properties?: any, func?: Action<T>): foConcept<T> {
        let { namespace, name } = Tools.splitNamespaceType(id);

        let create = (p?: any, s?: Array<T>, r?: T) => { 
            return new type(p, s, r); 
        };

        let concept = new foConcept<T>(properties, create, func);

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