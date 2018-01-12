import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept } from './foConcept.model'
import { foProperty } from './foProperty.model'


class ConceptDictionary extends foDictionary<foKnowledge>{
    public establish = (name:string):foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foConcept({myName:name}))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

class PropertyDictionary extends foDictionary<foProperty>{
    public establish = (name:string):foProperty => {
        this.findItem(name, () => {
            this.addItem(name, new foConcept({myName:name}))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}


export class foLibrary extends foKnowledge {

    private _concepts: ConceptDictionary = new ConceptDictionary({ myName: 'concepts' }, this);
    private _properties: PropertyDictionary = new PropertyDictionary({ myName: 'properties' }, this);
    //private _projection: foDictionary<foProjection> = new foDictionary<foProjection>({ myName: 'projections' });

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
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

import { RuntimeType } from './foRuntimeType';
RuntimeType.knowledge(foLibrary);