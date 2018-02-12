import { Tools } from './foTools'

import { foKnowledge } from './foKnowledge.model'

import { foCollection } from './foCollection.model'
import { foConcept } from './foConcept.model'
import { foStructure } from './foStructure.model'
import { foProperty } from './foProperty.model'

import { foNode } from './foNode.model'

import { FactoryDictionary, ActionDictionary, PropertyDictionary, ConceptDictionary, StructureDictionary } from './foDictionaries'

import { WhereClause } from "./foInterface";



export class foLibrary extends foKnowledge {

    private _structures: StructureDictionary = new StructureDictionary({ myName: 'structures' }, this);
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