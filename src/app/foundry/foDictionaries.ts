//import { Tools } from './foTools'
import { Action, Spec } from '../foundry/foInterface';


import { foKnowledge } from './foKnowledge.model';
import { foDictionary } from './foDictionary.model';
import { foConcept } from './foConcept.model';
import { foModel, foContext } from './foModel.model';
import { foComponent } from './foComponent.model';
import { foStructure } from './foStructure.model';
import { foSolution } from './foSolution.model';
import { foProperty } from './foProperty.model';
import { foMethod, foFactory } from './foMethod.model';
import { foNode } from './foNode.model';

import { Knowcycle } from './foLifecycle';
import { RuntimeType } from './foRuntimeType';

export class SolutionDictionary extends foDictionary<foKnowledge> {
    public establish = (name: string): foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foSolution({ myName: name }));
        });
        return this.getItem(name);
    }

    public define(key: string, properties?: any): foSolution {
        const parent = this.myParent() as foKnowledge;
        let solution = this.getItem(key) as foSolution;
        if (!solution) {
            solution = new foSolution(properties, parent);
            this.add(solution, key);
            Knowcycle.defined(solution);
        }
        return solution;
    }
    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

export class StructureDictionary extends foDictionary<foKnowledge> {
    public establish = (name: string): foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foStructure({ myName: name }));
        });
        return this.getItem(name);
    }

    public define(key: string, properties?: any): foStructure {
        const parent = this.myParent() as foKnowledge;
        let structure = this.getItem(key) as foStructure;
        if (!structure) {
            structure = new foStructure(properties, parent);
            this.add(structure, key);
            Knowcycle.defined(structure);
        }
        return structure;
    }
    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

export class ConceptDictionary extends foDictionary<foKnowledge> {
    public establish = (name: string): foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foConcept({ myName: name }));
        });
        return this.getItem(name);
    }

    public define(key: string, type: { new(p?: any, s?: Array<foComponent>, r?: foComponent): foComponent; }, specification?: any): foConcept<foComponent> {
        let concept = this.getItem(key) as foConcept<foComponent>;
        if (!concept) {
            const parent = this.myParent() as foKnowledge;
            RuntimeType.define(type);
            concept = new foConcept<foComponent>({}, parent);
            concept.definePrimitive(type);
            concept.specification = specification || {};
            this.add(concept, key);
            Knowcycle.defined(concept);
        }
        return concept;
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

export class ContextDictionary extends foDictionary<foKnowledge> {
    public establish = (name: string): foKnowledge => {
        this.findItem(name, () => {
            this.addItem(name, new foContext({ myName: name }));
        });
        return this.getItem(name);
    }

    public define(key: string, type: { new(p?: any, s?: Array<foComponent>, r?: foComponent): foComponent; }, specification?: any): foContext<foModel> {
        let context = this.getItem(key) as foContext<foModel>;
        if (!context) {
            const parent = this.myParent() as foKnowledge;
            RuntimeType.define(type);
            context = new foContext<foModel>({}, parent);
            context.definePrimitive(type);
            context.specification = specification || {};
            this.add(context, key);
            Knowcycle.defined(context);
        }
        return context;
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

export class PropertyDictionary extends foDictionary<foProperty> {
    public establish = (name: string): foProperty => {
        this.findItem(name, () => {
            this.addItem(name, new foProperty({ myName: name }));
        });
        return this.getItem(name);
    }

    public define(key: string, properties: any): foProperty {
        let property = this.getItem(key);
        if (!property) {
            const parent = this.myParent() as foKnowledge;
            property = new foProperty(properties, parent);
            this.add(property, key);
            Knowcycle.defined(property);
        }
        return property;
    }
    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

export class ActionDictionary<T extends foNode> extends foDictionary<foMethod<T>> {
    public establish = (myName: string, funct: Action<T>): foMethod<T> => {
        this.findItem(myName, () => {
            this.addItem(myName, new foMethod<T>(funct, { myName }));
        });
        return this.getItem(myName);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }
}

export class FactoryDictionary<T extends foNode> extends foDictionary<foFactory<T>> {
    public establish = (myName: string, funct: Spec<T>): foFactory<T> => {
        this.findItem(myName, () => {
            this.addItem(myName, new foFactory<T>(funct, { myName }));
        });
        return this.getItem(myName);
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }


}

