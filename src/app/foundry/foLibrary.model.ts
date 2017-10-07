import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept, foProjection } from './foConcept.model'
import { foProperty } from './foProperty.model'
import { foMethod } from './foMethod.model'


export class foLibrary extends foKnowledge {

    private _concepts: foDictionary<foConcept> = new foDictionary<foConcept>({ myName: 'concepts' });
    private _properties: foDictionary<foProperty> = new foDictionary<foProperty>({ myName: 'properties' });
    //private _projection: foDictionary<foProjection> = new foDictionary<foProjection>({ myName: 'projections' });

    constructor(spec: any = undefined) {
        super(spec);
        this.myType = 'foLibrary';
    }

    get debug() {
        let result = {
            base: this,
            concepts: this.concepts,
            properties: this.properties,
        }
        return Tools.stringify(result);
    }

    get asJson() {
        let result = Tools.asJson(this);

        result.concepts = Tools.asArray(this.concepts.asJson);
        result.properties = Tools.asArray(this.properties.asJson);
        return result;
    }

    get concepts() {
        return this._concepts;
    }

    establishConcept(key: string, spec: any = undefined) {
        let concepts = this.concepts;
        let concept = concepts.get(key);
        if (!concept) {
            concept = concepts.add(key, new foConcept(spec));
            concept.myName = key;
        }
        return concept;
    }

    get properties() {
        return this._properties;
    }

    establishProperty(key: string, spec: any = undefined) {
        let properties = this.properties;
        let property = properties.get(key);
        if (!property) {
            property = properties.add(key, new foProperty(spec));
            property.myName = key;
        }
        return property;
    }

    // get projections() {
    //     return this._projection;
    // }

    // establishProjection(key: string, spec: any = undefined) {
    //     let projections = this.projections;
    //     let projection = projections.get(key);
    //     if (!projection) {
    //         projection = projections.add(key, new foProjection(spec));
    //         projection.myName = key;
    //     }
    //     return projection;
    // }
}