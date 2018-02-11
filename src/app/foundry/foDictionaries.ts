//import { Tools } from './foTools'
import { Action, Spec } from '../foundry/foInterface';

import { foLibrary } from './foLibrary.model'
import { foModel } from './foModel.model'
import { foObject } from './foObject.model'

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept } from './foConcept.model'
import { foStructure } from './foStructure.model'
import { foCollection } from './foCollection.model'
import { foProperty } from './foProperty.model'
import { foMethod, foFactory } from './foMethod.model';
import { foNode } from './foNode.model'

import { WhereClause } from "./foInterface";


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

export class LibraryDictionary extends foDictionary<foLibrary>{
    public establish = (name: string): foLibrary => {
        this.findItem(name, () => {
            this.addItem(name, new foLibrary({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }

    select(where: WhereClause<foKnowledge>, list?: foCollection<foKnowledge>, deep: boolean = true): foCollection<foKnowledge> {
        let result = list ? list : new foCollection<foKnowledge>();

        this.forEachKeyValue((key, value) => {
            if (where(value)) result.addMember(value);
            value.select(where, result, deep);
        })

        return result;
    }
}

export class ModelDictionary extends foDictionary<foModel>{
    public establish = (name: string): foModel => {
        this.findItem(name, () => {
            this.addItem(name, new foModel({ myName: name }))
        })
        return this.getItem(name);
    }

    constructor(properties?: any, parent?: foObject) {
        super(properties, parent);
    }

    selectComponent(where: WhereClause<foObject>, list?: foCollection<foObject>, deep: boolean = true): foCollection<foObject> {
        let result = list ? list : new foCollection<foObject>();

        this.forEachKeyValue((key, value) => {
            if (where(value)) result.addMember(value);
            value.select(where, result, deep);
        })

        return result;
    }
}