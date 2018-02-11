import { foKnowledge } from './foKnowledge.model'
import { foConcept } from './foConcept.model'
import { foComponent } from './foComponent.model'
import { foCollection } from './foCollection.model'

import { RuntimeType } from './foRuntimeType';

export class Concept extends foConcept<foComponent> {}

export class foStructure extends foKnowledge {

    private _concept: Concept;
    private _structures: foCollection<foStructure>;

    //return a new collection that could be destroyed
    structures():foCollection<foStructure> {
        if ( !this._structures){
            this._structures = new foCollection<foStructure>();
        }
        return this._structures;
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);      
    }

    subcomponent(spec?: any | foStructure) {
        let result = spec instanceof foStructure ? spec : new foStructure(spec, this);
        this.structures().addMember(result);
        return this;
    }

    attribute(spec?: any) {
        return this;
    }

    existWhen(spec?: any) {
        return this;
    }

    concept(concept?: foConcept<foComponent>) {
        this._concept = concept;
        return this;
    }

    newInstance(context?: foComponent): foComponent {
        let concept = this._concept ? this._concept : new foConcept<foComponent>();
        let result = concept.newInstance({}, [], context);
        result && result.addAsSubcomponent(context);

        this.structures().forEach(item => {
            item.newInstance(result);
        })
        return result;
    }

}

RuntimeType.knowledge(foStructure);