import { Tools } from '../foundry/foTools'

import { foNode } from './foNode.model'
import { foConcept } from 'app/foundry/foConcept.model';
import { foLibrary } from 'app/foundry/foLibrary.model';


import { RuntimeType } from './foRuntimeType';
import { Knowcycle } from './foLifecycle';



export class foStencilLibrary extends foLibrary {

    public namespaces(): Array<string> {
        let lookup = {}
        this.concepts.members.forEach( concept => {
            let { namespace } = Tools.splitNamespaceType(concept.myName);
            lookup[namespace] = concept;
        })
        return Object.keys(lookup);
    }



    public find<T extends foNode>(id: string): foConcept<T> {
        let concept = this.concepts.getItem(id) as foConcept<T>;
        return concept;
    }


    public define<T extends foNode>(myName: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, specification?: any): foConcept<T> {
        RuntimeType.define(type);
        
        let concept = new foConcept<T>({ myName });
        concept.definePrimitive(type);
        concept.specification = specification || {};

        this.concepts.addItem(myName, concept);
        Knowcycle.defined(concept);
        return concept;
    }

    public hydrate<T extends foNode>(json: any): foConcept<T> {
        let { specification, primitive } = json;

        let concept = new foConcept<T>(json);
        //foObject.jsonAlert(data);

        let type = RuntimeType.modelPrimitives[primitive];
        if (!type) {
            throw Error('runtimeType not found ' + type)
        }
        concept.definePrimitive(type);
        concept.specification = specification;

        this.concepts.addItem(concept.myName, concept);
        Knowcycle.defined(concept);
        return concept;
    }

}


export let Stencil: foStencilLibrary = new foStencilLibrary();


