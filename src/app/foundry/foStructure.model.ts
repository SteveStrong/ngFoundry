import { foKnowledge } from './foKnowledge.model'
import { foConcept } from './foConcept.model'
import { foComponent } from './foComponent.model'

import { foLibrary } from './foLibrary.model'
import { foDictionary } from './foDictionary.model'

import { RuntimeType } from './foRuntimeType';

class foSubStructSpec extends foKnowledge {
    structure: foStructure;
    name: string;
    order: number = 0;
}


export class foStructure extends foKnowledge {

    private _concept: foConcept<foComponent>;
    private _structures: foDictionary<foSubStructSpec>;

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

    attribute(spec?: any) {
        return this;
    }

    existWhen(spec?: any) {
        return this;
    }

    concept(concept?: string | foConcept<foComponent>) {
        if (concept instanceof foConcept) {
            this._concept = concept;
        } else {
            let library = this.findParent(item => item instanceof foLibrary) as foLibrary;
            this._concept = library.establishConcept<foComponent>(concept);
        }

        return this;
    }

    newInstance(context?: foComponent): foComponent {
        let concept = this._concept ? this._concept : new foConcept<foComponent>();
        let result = concept.newInstance({}, [], context);

        this.structures && this.structures.forEach(item => {
            let structure = item.structure;
            let child = structure.newInstance(result);
            child.myName = item.name;
        });
        return result;
    }

}

RuntimeType.knowledge(foStructure);