import { Tools } from '../foundry/foTools'
import { Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { foNode } from './foNode.model'
import { foGlyph } from '../foundry/foGlyph.model'
import { foConcept } from 'app/foundry/foConcept.model';
import { foLibrary } from 'app/foundry/foLibrary.model';


import { RuntimeType } from './foRuntimeType';
import { Knowcycle } from './foLifecycle';

// export class foStencilSpec<T extends foGlyph> extends foObject {

//     primitive: string;
//     create: { new(p?: any, s?: Array<T>, r?: T): T; };
//     properties: any;
//     subcomponents: Array<T>;
//     commands: Array<string> = new Array<string>();

//     constructor(props?:any){
//         super()
//         props && Tools.mixin(this, props)
//     }

//     set(name: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, inits?: any, subs?: Array<T>) {
//         this.myName = name;
//         this.primitive = type.name;
//         this.create = type;
//         this.properties = inits;
//         this.subcomponents = subs;
//     }

//     protected toJson(): any {
//         return Tools.mixin(super.toJson(), {
//             primitive: this.primitive,
//             properties: this.properties,
//             subcomponents: this.subcomponents,
//         });
//     }

//     newInstance<T extends foGlyph>(properties?: any, subcomponents?: Array<T>) {
//         let spec = Tools.union(properties, this.properties);
//         let instance = new this.create(spec);
//         instance.myClass = this.myName;
//         return instance;
//     }


//     addCommands(...cmds: string[]) {
//         this.commands && this.commands.push(...cmds)
//         return this;
//     }

//     getCommands(): Array<string> {
//         return this.commands;
//     }
// }

export class foMaster extends foConcept<foGlyph> {

} 

export class foStencilLibrary extends foLibrary {

    public namespaces(): Array<string> {
        let lookup = {}
        this.concepts.members.forEach( concept => {
            let { namespace, name } = Tools.splitNamespaceType(concept.myName);
            lookup[namespace] = concept;
        })
        return Object.keys(lookup);
    }



    public find<T extends foNode>(id: string): foConcept<T> {
        let concept = this.concepts.getItem(id) as foConcept<T>;
        return concept;
    }


    public define<T extends foNode>(myName: string, type: { new(p?: any, s?: Array<T>, r?: T): T; }, specification?: any): foConcept<T> {
 
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


    public newInstance<T extends foNode>(id: string, properties?: any, func?: Action<T>): T {
        let concept = this.find(id);
        let instance = concept.newInstance(properties) as T;
        func && func(instance);
        return instance;
    }
}


export let Stencil: foStencilLibrary = new foStencilLibrary();


