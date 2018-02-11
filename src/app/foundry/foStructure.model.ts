import { foKnowledge } from './foKnowledge.model'
import { foConcept } from './foConcept.model'
import { foComponent } from './foComponent.model'
import { foCollection } from './foCollection.model'
import { foLibrary } from './foLibrary.model'

import { RuntimeType } from './foRuntimeType';

class foSubSpec extends foKnowledge {
    structure: foStructure;
    name:string;
}

export class foStructure extends foKnowledge {

    private _concept: foConcept<foComponent>;
    private _structures: foCollection<foSubSpec>;

    //return a new collection that could be destroyed
    structures():foCollection<foSubSpec> {
        if ( !this._structures){
            this._structures = new foCollection<foSubSpec>();
        }
        return this._structures;
    }

    constructor(properties?: any, parent?: foKnowledge) {
        super(properties, parent);      
    }

    subcomponent(name:string, spec?: any | foStructure) {
        let structure = spec instanceof foStructure ? spec : new foStructure(spec, this);
        let subSpec = new foSubSpec({
            name,
            structure
        });
        this.structures().addMember(subSpec);
        return this;
    }

    attribute(spec?: any) {
        return this;
    }

    existWhen(spec?: any) {
        return this;
    }

    concept(concept?: string | foConcept<foComponent>) {
        if ( concept instanceof foConcept ) {
            this._concept = concept;
        } else {
            let library = this.findParent( item => item instanceof foLibrary) as foLibrary;
            this._concept = library.establishConcept<foComponent>(concept);
        }

        return this;
    }

    newInstance(context?: foComponent): foComponent {
        let concept = this._concept ? this._concept : new foConcept<foComponent>();
        let result = concept.newInstance({}, [], context);
        
        result && result.addAsSubcomponent(context);

        this.structures().forEach(item => {
            let structure = item.structure;
            let child = structure.newInstance(result);
            child.myName = item.name;
        });
        return result;
    }

}

RuntimeType.knowledge(foStructure);