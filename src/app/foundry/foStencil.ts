import { Tools } from '../foundry/foTools';
import { Action, Spec } from '../foundry/foInterface';

import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foMethod, foFactory } from './foMethod.model';
import { foLibrary } from './foLibrary.model';

import { RuntimeType } from './foRuntimeType';
import { Knowcycle } from './foLifecycle';

export class foStencilLibrary extends foLibrary {
  public namespaces(): Array<string> {
    const lookup = {};
    this.concepts.members.forEach(concept => {
      const { namespace } = Tools.splitNamespaceType(concept.myName);
      lookup[namespace] = concept;
    });
    return Object.keys(lookup);
  }

  public find<T extends foNode>(id: string): foConcept<T> {
    const concept = this.concepts.getItem(id) as foConcept<T>;
    return concept;
  }

  public impermanent<T extends foNode>(
    myName: string,
    type: { new (p?: any, s?: Array<T>, r?: T): T },
    specification?: any
  ): foConcept<T> {
    RuntimeType.define(type);

    const concept = new foConcept<T>({ myName });

    concept.definePrimitive(type);
    concept.specification = specification || {};
    return concept;
  }

  public define<T extends foNode>(
    myName: string,
    type: { new (p?: any, s?: Array<T>, r?: T): T },
    specification?: any
  ): foConcept<T> {
    RuntimeType.define(type);

    const concept = new foConcept<T>({ myName });

    concept.definePrimitive(type);
    concept.specification = specification || {};

    this.concepts.addItem(myName, concept);
    Knowcycle.defined(concept);
    return concept;
  }

  public hydrate<T extends foNode>(json: any): foConcept<T> {
    const { specification, primitive } = json;

    const concept = new foConcept<T>(json);
    //foObject.jsonAlert(data);

    const type = RuntimeType.modelPrimitives[primitive];
    if (!type) {
      throw Error('runtimeType not found ' + type);
    }
    concept.definePrimitive(type);
    concept.specification = specification;

    this.concepts.addItem(concept.myName, concept);
    Knowcycle.defined(concept);
    return concept;
  }

  public action<T extends foNode>(
    myName: string,
    funct: Action<T>
  ): foMethod<T> {
    const method = new foMethod(funct, { myName });

    this.actions.addItem(myName, method);
    Knowcycle.defined(method);
    return method;
  }

  public factory<T extends foNode>(
    myName: string,
    funct: Spec<T>
  ): foFactory<T> {
    const method = new foFactory(funct, { myName });

    this.factories.addItem(myName, method);
    Knowcycle.defined(method);
    return method;
  }
}

export let Stencil: foStencilLibrary = new foStencilLibrary();
