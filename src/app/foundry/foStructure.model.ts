import { WhereClause, Action } from './foInterface'

import { foKnowledge } from './foKnowledge.model'
import { foConcept } from './foConcept.model'
import { foAttribute } from './foAttribute.model'
import { foComponent } from './foComponent.model'

import { foDictionary } from './foDictionary.model'

import { RuntimeType } from './foRuntimeType';

class foSubStructSpec extends foKnowledge {
    structure: foStructure;
    name: string;
    order: number = 0;
}




export class foStructure extends foKnowledge {

    private _concept: foConcept<foComponent>;
    private _attributes: foDictionary<foAttribute>;

    private _structures: foDictionary<foSubStructSpec>;
    private _existWhen: Array<WhereClause<foComponent>>;

    //return a new collection that could be destroyed


    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);
    }

    private addSubSpec(name: string, structure: foStructure): foSubStructSpec {
        if (!this._structures) {
            this._structures = new foDictionary<foSubStructSpec>();
        }
        let subSpec = new foSubStructSpec({
            name,
            structure,
            order: this._structures.count + 1
        });
        this._structures.addItem(name, subSpec);
        return subSpec;
    }

    subcomponent(name: string, spec?: any | foStructure) {
        let structure = spec instanceof foStructure ? spec : new foStructure(spec, this);
        this.addSubSpec(name, structure);
        return this;
    }
    get structures(): Array<foSubStructSpec> {
        if (this._structures) {
            return this._structures.members.sort((a, b) => a.order - b.order);
        }
    }

    attribute(name: string, spec?: any | foAttribute) {
        if (!this._attributes) {
            this._attributes = new foDictionary<foAttribute>();
        }
        return this;
    }

    concept(concept?: foConcept<foComponent>) {
        this._concept = concept;
        return this;
    }

    existWhen(when: WhereClause<foComponent>) {
        this._existWhen.push(when)
        return this;
    }

    private canExist(context?: foComponent): boolean {
        let result = true;
        return result;
    }

    makeComponent(parent?: any, properties?: any, onComplete?: Action<any>): any {

        if (!this.canExist(parent)) {
            return;
        }

        let concept = this._concept ? this._concept : new foConcept<foComponent>();
        let result = concept.makeComponent(parent, properties);

        this.structures && this.structures.forEach(item => {
            let structure = item.structure;
            let child = structure.makeComponent(result);
            child && child.defaultName(item.name);
        });

        onComplete && onComplete(result);
        return result;
    }

}

RuntimeType.knowledge(foStructure);