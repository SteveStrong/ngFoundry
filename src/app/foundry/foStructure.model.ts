import { WhereClause, Action } from './foInterface';

import { foKnowledge } from './foKnowledge.model';
import { foConcept } from './foConcept.model';
import { foAttribute } from './foAttribute.model';
import { foComponent } from './foComponent.model';

import { foDictionary } from './foDictionary.model';

import { RuntimeType } from './foRuntimeType';

export class foSubStructureSpec extends foKnowledge {
  structure: foStructure;
  name: string;
  order: number = 0;
  spec: any = {};
}

export class foStructure extends foKnowledge {
  private _concept: foConcept<foComponent>;
  private _attributes: foDictionary<foAttribute>;

  private _structures: foDictionary<foSubStructureSpec>;
  private _existWhen: Array<WhereClause<foComponent>>;

  //return a new collection that could be destroyed

  constructor(properties?: any, parent?: foKnowledge) {
    super(properties, parent);
  }

  private addSubStructureSpec(
    name: string,
    structure: foStructure,
    properties?: any
  ): foSubStructureSpec {
    if (!this._structures) {
      this._structures = new foDictionary<foSubStructureSpec>();
    }
    const subSpec = new foSubStructureSpec({
      name,
      structure,
      order: this._structures.count + 1,
      spec: properties || {}
    });
    this._structures.addItem(name, subSpec);
    return subSpec;
  }

  subComponent(name: string, spec?: any | foStructure, properties?: any) {
    const structure =
      spec instanceof foStructure ? spec : new foStructure(spec, this);
    this.addSubStructureSpec(name, structure, properties);
    return this;
  }
  get structures(): Array<foSubStructureSpec> {
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
    //this.select(where, list, deep)
    return this;
  }

  existWhen(when: WhereClause<foComponent>) {
    this._existWhen.push(when);
    return this;
  }

  private canExist(context?: foComponent): boolean {
    const result = true;
    return result;
  }

  makeComponent(parent?: any, properties?: any, onComplete?: Action<any>): any {
    if (!this.canExist(parent)) {
      return;
    }

    const concept = this._concept ? this._concept : new foConcept<foComponent>();
    const result = concept.makeComponent(parent, properties);

    this.structures &&
      this.structures.forEach(item => {
        const structure = item.structure;
        structure.makeComponent(result, item.spec, child => {
          child.defaultName(item.name);
        });
      });

    result && onComplete && onComplete(result);
    return result;
  }
}

RuntimeType.knowledge(foStructure);
