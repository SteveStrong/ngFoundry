import { Tools } from './foTools';

import { foObject } from './foObject.model';
import { foInstance } from './foInstance.model';

import { foCollection } from './foCollection.model';

export class foComponent extends foInstance {
  constructor(
    properties?: any,
    subcomponents?: Array<foComponent>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
  }

  init(properties?: any, subcomponents?: Array<foInstance>, parent?: foObject) {
    this.myName =
      properties && properties['myName'] ? properties['myName'] : 'unknown';

    //create a different behaviour
    this.override(properties);

    this._subcomponents = new foCollection<foComponent>();
    subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));
    return this;
  }

  //return a new collection that could be destroyed
  subcomponents(): Array<foComponent> {
    const result = new foCollection<foComponent>(this._subcomponents
      .members as Array<foComponent>);
    return result.members;
  }

  protected toJson(): any {
    const concept = this.createdFrom && this.createdFrom();
    const members = (concept && concept.extract(this)) || {};
    return Tools.mixin(super.toJson(), members);
  }

  clearAll() {
    this.nodes.clearAll();
  }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foComponent);
