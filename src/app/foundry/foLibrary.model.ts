import { Tools } from './foTools'
import { Action, Spec } from '../foundry/foInterface';

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept } from './foConcept.model'
import { foProperty } from './foProperty.model'
import { foMethod, foFactory } from './foMethod.model';
import { foNode } from './foNode.model'

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

    get concepts() {
        return this._concepts;
    }

    get actions() {
        return this._actions;
    }

    get factories() {
        return this._factory;
    }

    establishConcept<T extends foNode>(key: string, properties?: any) {
        let concept = this.concepts.getItem(key);
        if (!concept) {
            concept = this.concepts.addItem(key, new foConcept<T>(properties));
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