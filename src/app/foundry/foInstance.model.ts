import { Tools } from './foTools';

import { foObject } from './foObject.model';
import { foNode } from './foNode.model';

import { foCollection } from './foCollection.model';
import { foKnowledge } from './foKnowledge.model';

export class foInstance extends foNode {
  public createdFrom: () => foKnowledge;
  setCreatedFrom(source: any) {
    this.createdFrom = () => {
      return source;
    };
  }

  constructor(
    properties?: any,
    subcomponents?: Array<foInstance>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
    this.createdFrom = undefined;
  }

  protected _subcomponents: foCollection<foInstance>;
  get nodes(): foCollection<foInstance> {
    return this._subcomponents;
  }

  protected toJson(): any {
    const concept = this.createdFrom && this.createdFrom();
    const keys = concept ? concept.specReadWriteKeys() : [];
    return Tools.mixin(super.toJson(), this.extract(keys));
  }

  createCopy(keys?: string[]) {
    const data = this.extractCopySpec(keys);

    const concept = this.createdFrom && this.createdFrom();
    let copy = concept && concept.newInstance(data);
    if (copy) { return copy; }

    const { myType } = data;
    const type = RuntimeType.find(myType);
    copy = RuntimeType.create(type, data);

    return copy;
  }

  createDeepCopy(): foInstance {
    const copy = this.createCopy();

    this.nodes.forEach(item => {
      const child = item.createDeepCopy();
      copy.addSubcomponent(child);
    });
    return copy;
  }

  public isEqualTo(obj: foInstance, deep: boolean = true) {
    let result = true;

    Object.keys(this).forEach(key => {
      const local: any = this[key];
      const other: any = obj[key];

      const isLocal = local instanceof foInstance;
      const isOther = other instanceof foInstance;

      const isLocalCol = local instanceof foCollection;
      const isOtherCol = other instanceof foCollection;

      const isLocalFn = Tools.isFunction(local);
      const isOtherFn = Tools.isFunction(other);

      if ((isLocal && isOther) || (isLocalCol && isOtherCol)) {
        result = local.isEqualTo(other) ? result : false;
      } else if (isLocalFn && isOtherFn) {
      } else if (key === 'myGuid' || key.startsWith('_') || key === 'UnDo') {
        //skip over myGuid
      } else {
        result = local === other ? result : false;
      }

      if (!result) {
        return false;
      }
    });
    return result;
  }

  public reHydrate(json: any) {
    this.override(json);
    return this;
  }

  public deHydrate(context?: any, deep: boolean = true) {
    const concept = this.createdFrom && this.createdFrom();
    const keys = concept ? concept.specReadWriteKeys() : [];
    const data = this.extractCopySpec(keys);

    if (deep && this.nodes.count) {
      data.subcomponents = this.nodes.map(item => {
        const child = item.deHydrate(context, deep);
        return child;
      });
    }
    return data;
  }
}

import { RuntimeType } from './foRuntimeType';

RuntimeType.define<foInstance>(foInstance);

Tools['isaInstance'] = function(obj) {
  return obj && obj.isInstanceOf(foInstance);
};
