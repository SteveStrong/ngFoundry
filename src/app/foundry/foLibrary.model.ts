import { Tools } from './foTools';

import { foKnowledge } from './foKnowledge.model';

//import { Knowcycle } from './foLifecycle';
import { foCollection } from './foCollection.model';
//import { foComponent } from './foComponent.model'
//import { foConcept } from './foConcept.model'
//import { foStructure } from './foStructure.model'
//import { foProperty } from './foProperty.model'

import { foNode } from './foNode.model';

import {
  FactoryDictionary,
  ActionDictionary,
  PropertyDictionary,
  ConceptDictionary,
  StructureDictionary,
  SolutionDictionary
} from './foDictionaries';

import { WhereClause } from './foInterface';

export class foLibrary extends foKnowledge {
  private _mixins: any = {};

  private _solutions: SolutionDictionary = new SolutionDictionary(
    {
      myName: 'solutions'
    },
    this
  );

  private _structures: StructureDictionary = new StructureDictionary(
    {
      myName: 'structures',
      concepts: this.concepts
    },
    this
  );

  private _concepts: ConceptDictionary = new ConceptDictionary(
    {
      myName: 'concepts'
    },
    this
  );

  private _properties: PropertyDictionary = new PropertyDictionary(
    {
      myName: 'properties'
    },
    this
  );

  private _actions: ActionDictionary<foNode> = new ActionDictionary(
    {
      myName: 'actions'
    },
    this
  );

  private _factory: FactoryDictionary<foNode> = new FactoryDictionary(
    {
      myName: 'factories'
    },
    this
  );

  constructor(properties?: any, parent?: foKnowledge) {
    super(properties, parent);
  }

  get debug() {
    const result = {
      base: this,
      concepts: this.concepts,
      properties: this.properties
    };
    return Tools.stringify(result);
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      concepts: Tools.asArray(this.concepts.asJson),
      properties: Tools.asArray(this.properties.asJson)
    });
  }

  public mixin(key: string, specification?: any): any {
    let found = specification;
    if (found) {
      this._mixins[key] = found;
    } else {
      found = this._mixins[key];
    }

    return found;
  }

  get actions() {
    return this._actions;
  }

  get factories() {
    return this._factory;
  }

  get structures() {
    return this._structures;
  }

  get solutions() {
    return this._solutions;
  }

  get concepts() {
    return this._concepts;
  }

  get properties() {
    return this._properties;
  }

  select(
    where: WhereClause<foKnowledge>,
    list?: foCollection<foKnowledge>,
    deep: boolean = true
  ): foCollection<foKnowledge> {
    const result = super.select(where, list, deep);

    this.concepts.forEachKeyValue((key, value) => {
      value.select(where, result, deep);
    });

    return result;
  }
}

import { RuntimeType } from './foRuntimeType';

RuntimeType.knowledge(foLibrary);
