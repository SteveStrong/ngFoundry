import { WhereClause, Action } from './foInterface';

import { foKnowledge } from './foKnowledge.model';
import { foAttribute } from './foAttribute.model';
import { foComponent } from './foComponent.model';

import { foDictionary } from './foDictionary.model';
import { foStructure } from './foStructure.model';

import { RuntimeType } from './foRuntimeType';

export class foAltStructureSpec extends foKnowledge {
  structure: foStructure;
  exist: WhereClause<foComponent>;
  priority: number = 100;

  isValid(context: any): boolean {
    if (!this.exist) { return true; }
    try {
      const result = this.exist(context);
      return result;
    } catch (ex) {
      return false;
    }
  }
}

export class foSubSolutionSpec extends foKnowledge {
  solution: foSolution;
  name: string;
  order: number = 0;
  spec: any = {};
}

export class foSolution extends foKnowledge {
  private _structures: foDictionary<foAltStructureSpec>;
  private _solutions: foDictionary<foSubSolutionSpec>;

  private _attributes: foDictionary<foAttribute>;

  constructor(properties?: any, parent?: foKnowledge) {
    super(properties, parent);
  }

  attribute(name: string, spec?: any | foAttribute) {
    if (!this._attributes) {
      this._attributes = new foDictionary<foAttribute>();
    }
    return this;
  }

  private addAltStructureSpec(
    structure: foStructure,
    exist: WhereClause<foComponent>,
    priority?: number
  ): foAltStructureSpec {
    if (!this._structures) {
      this._structures = new foDictionary<foAltStructureSpec>();
    }
    const altSpec = new foAltStructureSpec({
      exist,
      structure,
      priority: priority
    });
    this._structures.addItem(structure.myName, altSpec);
    return altSpec;
  }

  useStructure(
    spec?: any | foStructure,
    exist?: WhereClause<foComponent>,
    priority?: number
  ) {
    const structure =
      spec instanceof foStructure ? spec : new foStructure(spec, this);
    this.addAltStructureSpec(structure, exist, priority);
    return this;
  }

  get altStructures(): Array<foAltStructureSpec> {
    if (this._structures) {
      return this._structures.members.sort((a, b) => a.priority - b.priority);
    }
  }

  private addSubStructureSpec(
    name: string,
    solution: foSolution,
    properties?: any
  ): foSubSolutionSpec {
    if (!this._solutions) {
      this._solutions = new foDictionary<foSubSolutionSpec>();
    }
    const subSpec = new foSubSolutionSpec({
      name,
      solution,
      order: this._solutions.count + 1,
      spec: properties || {}
    });
    this._solutions.addItem(name, subSpec);
    return subSpec;
  }

  subSolution(name: string, spec?: any | foSolution, properties?: any) {
    const structure =
      spec instanceof foSolution ? spec : new foSolution(spec, this);
    this.addSubStructureSpec(name, structure, properties);
    return this;
  }

  get solutions(): Array<foSubSolutionSpec> {
    if (this._solutions) {
      return this._solutions.members.sort((a, b) => a.order - b.order);
    }
  }

  makeComponent(parent?: any, properties?: any, onComplete?: Action<any>): any {
    let result;
    this.altStructures &&
      this.altStructures.forEach(item => {
        if (!result && item.isValid(parent)) {
          const structure = item.structure;
          result = structure.makeComponent(parent, properties, child => {
            child.defaultName();
          });
        }
      });

    result &&
      this.solutions &&
      this.solutions.forEach(item => {
        const solution = item.solution;
        solution.makeComponent(result, item.spec, child => {
          child.defaultName(item.name);
        });
      });

    result && onComplete && onComplete(result);
    return result;
  }
}

RuntimeType.knowledge(foSolution);
