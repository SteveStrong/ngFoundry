import { Tools } from './foTools'
import { PubSub } from './foPubSub'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foAttribute, foViewAttribute } from './foAttribute.model'

import { foObject, iObject } from './foObject.model'
import { foComponent } from './foComponent.model'
import { foNode } from './foNode.model'



export class foConcept extends foKnowledge {

    private _create = (properties?: any, subcomponents?: Array<foNode>, parent?: foObject) => {
        return new foObject();
    }

    private _spec: any;

    private _attributes: foDictionary<foAttribute> = new foDictionary<foAttribute>({ myName: 'attributes' });
    private _projections: foDictionary<foProjection> = new foDictionary<foProjection>({ myName: 'prohections' });


    constructor(properties?: any) {
        super(properties);
        this._spec = properties || {};
        this.myType = 'foConcept';

        this.createNode();
        //this.createComponent();
    }


    get attributes() {
        if (!this._attributes) {
            this._attributes = new foDictionary<foAttribute>({ myName: 'attributes' });
        }
        return this._attributes;
    }

    establishAttribute(key: string, spec: any = undefined) {
        let attributes = this.attributes;
        let attribute = attributes.get(key);
        if (!attribute) {
            attribute = attributes.add(key, new foAttribute(spec));
            attribute.myName = key;

            PubSub.Pub("attribute", ["added", this, attribute]);
        }
        return attribute;
    }

    get projections() {
        if (!this._projections) {
            this._projections = new foDictionary<foProjection>({ myName: 'projections' });
        }
        return this._projections;
    }

    establishProjection(key: string, spec: any = undefined) {
        let projections = this.projections;
        let projection = projections.get(key);
        if (!projection) {
            projection = new foProjection(this, spec);
            projections.add(key, projection);
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

    newInstance(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        let fullSpec = Tools.union(this._spec, properties)
        let result = this._create(fullSpec, subcomponents, parent);
        return result;
    }


    //start fluent interface
    target() {
        return this;
    }

    createNode() {
        this._create = (properties?, subcomponents?, parent?) => {
            return new foNode(properties, subcomponents, parent);
        }
        return this;
    }

    createComponent() {
        this._create = (properties?, subcomponents?, parent?) => {
            return new foComponent(properties, subcomponents, parent);
        }
        return this;
    }

    createCustom(funct) {
        this._create = funct;
        return this;
    }

}

export class foProjection extends foConcept {

    private _mySource: foConcept = undefined;

    constructor(source: foConcept, properties?: any) {
        super(properties);
        this._mySource = source;
        this.myType = 'foProjection';

        PubSub.Sub("attribute", (action, source, attribute) => {
            if (this._mySource === source) {
                let view = this.establishViewAttribute(attribute)
            }
        });
    }

    establishViewAttribute(attribute: foAttribute, spec: any = undefined) {
        let attributes = this.attributes;
        let key = attribute.myName;
        let view = <foViewAttribute>attributes.get(key);
        if (!view) {
            view = new foViewAttribute(attribute, spec);
            this.attributes.add(key, view);
            view.myName = key;
           
        }
        return view;
    }



}