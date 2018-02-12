//import { Tools } from './foTools'
import { Action, Spec } from '../foundry/foInterface';


import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept } from './foConcept.model'
import { foProperty } from './foProperty.model'
import { foMethod, foFactory } from './foMethod.model';
import { foNode } from './foNode.model'


export class StructureDictionary extends foDictionary<foKnowledge>{
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

export class ConceptDictionary extends foDictionary<foKnowledge>{
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

export class PropertyDictionary extends foDictionary<foProperty>{
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

export class ActionDictionary<T extends foNode> extends foDictionary<foMethod<T>>{
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

export class FactoryDictionary<T extends foNode> extends foDictionary<foFactory<T>>{
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

