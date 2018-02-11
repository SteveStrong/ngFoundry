import { Tools } from './foTools'
import { Action, Spec } from '../foundry/foInterface';

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foCollection } from './foCollection.model'
import { foConcept } from './foConcept.model'
import { foStructure } from './foStructure.model'
import { foProperty } from './foProperty.model'
import { foMethod, foFactory } from './foMethod.model';
import { foNode } from './foNode.model'

import { WhereClause } from "./foInterface";

class StructureDictionary extends foDictionary<foKnowledge>{
    public establish = (name: string): foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foStructure({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

class ConceptDictionary extends foDictionary<foKnowledge>{
    public establish = (name: string): foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foConcept({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

class PropertyDictionary extends foDictionary<foProperty>{
    public establish = (name: string): foProperty => {
        this.findItem(name, () => {
            this.addItem(name, new foConcept({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

class ActionDictionary<T extends foNode> extends foDictionary<foMethod<T>>{
    public establish = (myName: string, funct: Action<T>): foMethod<T> => {
        this.findItem(myName, () => {
            this.addItem(myName, new foMethod<T>(funct, { myName }));
        })
        return this.getItem(myName);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

class FactoryDictionary<T extends foNode> extends foDictionary<foFactory<T>>{
    public establish = (myName: string, funct: Spec<T>): foFactory<T> => {
        this.findItem(myName, () => {
            this.addItem(myName, new foFactory<T>(funct, { myName }))
        })
        return this.getItem(myName);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}


export class foLibrary extends foKnowledge {

    private _structures: StructureDictionary = new ConceptDictionary({ myName: 'structures' }, this);

    private _concepts: ConceptDictionary = new ConceptDictionary({ myName: 'concepts' }, this);
    private _properties: PropertyDictionary = new PropertyDictionary({ myName: 'properties' }, this);
    private _actions: ActionDictionary<foNode> = new ActionDictionary({ myName: 'actions' }, this);
    private _factory: FactoryDictionary<foNode> = new FactoryDictionary({ myName: 'factories' }, this);

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

    get actions() {
        return this._actions;
    }

    get factories() {
        return this._factory;
    }



    get structures() {
        return this._structures;
    }

    establishStructure(key: string, properties?: any): foStructure {
        let structure = this.structures.getItem(key) as foStructure;
        if (!structure) {
            structure = new foStructure(properties, this);
            this.structures.addItem(key, structure);
            structure.myName = key;
        }
        return structure;
    }

    get concepts() {
        return this._concepts;
    }

    establishConcept<T extends foNode>(key: string, properties?: any): foConcept<T> {
        let concept = this.concepts.getItem(key) as foConcept<T>
        if (!concept) {
            concept = new foConcept<T>({}, this);
            concept.specification = properties;
            this.concepts.addItem(key, concept);
            concept.myName = key;
        }
        return concept;
    }

    get properties() {
        return this._properties;
    }

    establishProperty(key: string, properties: any): foProperty {
        let property = this.properties.getItem(key);
        if (!property) {
            property = new foProperty(properties,this)
            this.properties.addItem(key, property);
            property.myName = key;
        }
        return property;
    }

    select(where: WhereClause<foKnowledge>, list?: foCollection<foKnowledge>, deep: boolean = true): foCollection<foKnowledge> {
        let result = super.select(where, list, deep);

        this.concepts.forEachKeyValue((key, value) => {
            value.select(where, result, deep);
        })

        return result;
    }



}

import { RuntimeType } from './foRuntimeType';

RuntimeType.knowledge(foLibrary);