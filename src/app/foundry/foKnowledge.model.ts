import { Tools, foNames } from './foTools';

import { WhereClause, Action } from './foInterface';

import { foObject } from './foObject.model';

export class foKnowledge extends foObject {
  private static _counter: number = 0;

  constructor(properties?: any, parent?: foKnowledge) {
    super(properties, parent);
  }

  public initialize(
    x: number = Number.NaN,
    y: number = Number.NaN,
    ang: number = Number.NaN
  ) {
    return this;
  }

  usingRuntimeType(type: string, action: Action<foKnowledge>) {
    action(this);
    return this;
  }

  makeComponent(parent?: any, properties?: any, onComplete?: Action<any>): any {
    return undefined;
  }

  newInstance(properties?: any, subcomponents?: any, parent?: any): any {
    return undefined;
  }

  extract(target: any) {
    const result = {};
    return result;
  }

  get commands(): Array<string> {
    return [];
  }

  specReadWriteKeys(): string[] {
    return [];
  }

  defaultName(name?: string) {
    if (name) {
      this.myName = name;
    } else if (Tools.matches(this.myName, foNames.UNKNOWN)) {
      foKnowledge._counter += 1;
      const count = ('0000' + foKnowledge._counter).slice(-4);
      this.myName = `${this.myType}_${count}`;
    }
    return this;
  }

  get displayName() {
    if (this._displayName) { return this._displayName; }
    if (Tools.matches(this.myName, foNames.UNKNOWN)) {
      return this.defaultName().myName;
    }
    return this.myName;
  }
  set displayName(value: string) {
    this._displayName = value;
  }

  select(
    where: WhereClause<foKnowledge>,
    list?: foCollection<foKnowledge>,
    deep: boolean = true
  ): foCollection<foKnowledge> {
    const result = list ? list : new foCollection<foKnowledge>();
    const self = <foKnowledge>this;
    if (where(self)) {
      result.addMember(self);
    }
    return result;
  }

  extractCopySpec(keys?: string[]) {
    const spec = this.asJson;
    keys &&
      keys.forEach(key => {
        spec[key] = this[key];
      });
    return spec;
  }

  createCopy(keys?: string[]) {
    const data = this.extractCopySpec(keys);
    const { myType } = data;

    const type = RuntimeType.find(myType);
    if (type) {
      const copy = RuntimeType.construct(type, data);
      return copy;
    }
  }

  public reHydrate(json: any) {
    this.override(json);
    return this;
  }

  public deHydrate(context?: any, deep: boolean = true) {
    const data = this.extractCopySpec();
    return data;
  }
}

import { RuntimeType } from './foRuntimeType';
import { foCollection } from './foCollection.model';
RuntimeType.knowledge(foKnowledge);
