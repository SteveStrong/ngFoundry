import { foObject } from './foObject.model';
import { foComponent } from './foComponent.model';
import { foConcept } from './foConcept.model';

export class foModel extends foComponent {
  constructor(
    properties?: any,
    subcomponents?: Array<foComponent>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
  }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foModel);

export class foContext<T extends foModel> extends foConcept<T> {}
