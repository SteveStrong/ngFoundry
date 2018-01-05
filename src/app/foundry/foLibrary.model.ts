import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept, foProjection } from './foConcept.model'
import { foProperty } from './foProperty.model'
import { foMethod } from './foMethod.model'

import { foNode } from './foNode.model'

export class foLibrary extends foKnowledge {

    private _concepts: foDictionary<foKnowledge> = new foDictionary<foKnowledge>({ myName: 'concepts' });
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

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            concepts: Tools.asArray(this.concepts.asJson),
            properties: Tools.asArray(this.properties.asJson)
        });
    }

    get concepts() {
        return this._concepts;
    }

    establishConcept(key: string, properties?: any) {
        let concept = this.concepts.getItem(key);
        if (!concept) {
            concept = this.concepts.addItem(key, new foConcept(properties));
            concept.myName = key;
        }
        return concept;
    }

    get properties() {
        return this._properties;
    }

    establishProperty(key: string, properties: any) {
        let property = this.properties.getItem(key);
        if (!property) {
            property = this.properties.addItem(key, new foProperty(properties));
            property.myName = key;
        }
        return property;
    }

}