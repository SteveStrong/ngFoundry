import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept, foProjection } from './foConcept.model'
import { foProperty } from './foProperty.model'
import { foMethod } from './foMethod.model'

import { foNode } from './foNode.model'

export class foLibrary<T extends foNode> extends foKnowledge {

    private _concepts: foDictionary<foConcept<T>> = new foDictionary<foConcept<T>>({ myName: 'concepts' });
    private _properties: foDictionary<foProperty> = new foDictionary<foProperty>({ myName: 'properties' });
    //private _projection: foDictionary<foProjection> = new foDictionary<foProjection>({ myName: 'projections' });

    constructor(spec?: any) {
        super(spec);
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
        let concept = concepts.getItem(key);
        if (!concept) {
            concept = concepts.addItem(key, new foConcept(spec));
            concept.myName = key;
        }
        return concept;
    }

    get properties() {
        return this._properties;
    }

    establishProperty(key: string, spec: any = undefined) {
        let properties = this.properties;
        let property = properties.getItem(key);
        if (!property) {
            property = properties.addItem(key, new foProperty(spec));
            property.myName = key;
        }
        return property;
    }

}