

import { foKnowledge } from './foKnowledge.model'
import { foDictionary } from './foDictionary.model'
import { foConcept } from './foConcept.model'
import { foMethod } from './foMethod.model'


export class foLibrary extends foKnowledge {

    private _concepts: foDictionary<foConcept>;

    constructor(spec:any=undefined) {
        super(spec);
        this.myType = 'foLibrary';     
    }


    get concepts() {
        if ( !this._concepts) {
            this._concepts = new foDictionary<foConcept>();
        }
        return this._concepts;
    }  
    
    establishConcept(key:string, spec:any=undefined) {
        let concepts = this.concepts;
        let concept = concepts.get(key);
        if ( !concept) {
            concept = concepts.add(key, new foConcept(spec));
            concept.createComponent();
            concept.myName = key;
        }
        return concept;
    }
}