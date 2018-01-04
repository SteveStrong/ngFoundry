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
import { Knowcycle } from './foLifecycle';

import { foLibrary } from 'app/foundry/foLibrary.model';
import { foGlyph } from 'app/foundry/foGlyph.model';

export class foConcept<T extends foNode> extends foKnowledge {

    private _create = (properties?: any, subcomponents?: Array<foNode>, parent?: foObject): T => {
        return <T>new foNode(properties, subcomponents, parent);
    }

    private _commands: Array<string> = new Array<string>();
    addCommands(...cmds: string[]) {
        this._commands && this._commands.push(...cmds)
        return this;
    }

    get commands(): Array<string> {
        return this._commands;
    }

    private _primitive: string;
    get primitive(): string { return this._primitive; }
    set primitive(value: string) { this._primitive = value; }

    private _specification: any;
    get specification(): any { return this._specification; }
    set specification(value: any) { this._specification = value; }


    private _attributes: foDictionary<foAttribute>;
    get attributes() {
        if (!this._attributes) {
            this._attributes = new foDictionary<foAttribute>({ myName: 'attributes' });
        }
        return this._attributes;
    }
    set attributes(value: any) { this._attributes = value; }

    private _projections: foDictionary<foProjection<T>>;
    get projections() {
        if (!this._projections) {
            this._projections = new foDictionary<foProjection<T>>({ myName: 'projections' });
        }
        return this._projections;
    }
    set projections(value: any) { this._projections = value; }



    constructor(properties?: any) {
        super(properties);
    }


    definePrimitive(type: { new(p?: any, s?: Array<T>, r?: T): T; }) {
        this.primitive = type.name;
        this._create = (properties?: any, subcomponents?: Array<T>, parent?: T) => {
            return new type(properties, subcomponents, parent);
        }
        return this;
    }


    establishAttribute(key: string, spec?: any) {
        let attributes = this.attributes;
        let attribute = attributes.getItem(key);
        if (!attribute) {
            attribute = attributes.addItem(key, new foAttribute(spec));
            attribute.myName = key;

            PubSub.Pub("attribute", ["added", this, attribute]);
        }
        return attribute;
    }


    establishProjection(key: string, spec?: any) {
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
            specification: this._specification,
            primitive: this._primitive,
            attributes: this._attributes,
            projections: this._projections,
        }
        return Tools.stringify(result);
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            primitive: this.primitive,
            specification: this._specification,
            attributes: Tools.asArray(this.attributes.asJson),
            projections: Tools.asArray(this.projections.asJson),
        });
    }


    newInstance(properties?: any, subcomponents?: Array<T>, parent?: T): T {
        let spec = Tools.union(this.specification, properties);
        let result = this._create(spec, subcomponents, parent) as T;
        result.myClass = this.myName;
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

 

export class foShapeLibrary extends foLibrary {

    public namespaces(): Array<string> {
        let lookup = {}
        this.concepts.members.forEach( concept => {
            let { namespace, name } = Tools.splitNamespaceType(concept.name);
            lookup[namespace] = concept;
        })
        return Object.keys(lookup);
    }



    public find<T extends foNode>(id: string): foConcept<T> {
        let concept = this.concepts.getItem(id) as foConcept<T>;
        return concept;
    }


    public define<T extends foNode>(myName: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, specification?: any): foConcept<T> {
 
        let concept = new foConcept<T>({ myName });
        concept.definePrimitive(type);
        concept.specification = specification || {};

        this.concepts.addItem(myName, concept);
        Knowcycle.defined(concept);
        return concept;
    }

    public hydrate<T extends foNode>(json: any): foConcept<T> {
        let { specification, primitive } = json;

        let concept = new foConcept<T>(json);
        //foObject.jsonAlert(data);

        let type = RuntimeType.modelPrimitives[primitive];
        if (!type) {
            throw Error('runtimeType not found ' + type)
        }
        concept.definePrimitive(type);
        concept.specification = specification;

        this.concepts.addItem(concept.myName, concept);
        Knowcycle.defined(concept);
        return concept;
    }


    public newInstance<T extends foNode>(id: string, properties?: any, func?: Action<T>): T {
        let { namespace, name } = Tools.splitNamespaceType(id);
        let concept = this.find(id);

        let instance = concept.newInstance(properties) as T;
        func && func(instance);
        return instance;
    }
}


export let Concept: foShapeLibrary = new foShapeLibrary();