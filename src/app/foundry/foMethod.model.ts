import { foKnowledge } from './foKnowledge.model';
import { foNode } from './foNode.model';
import { Action, Spec } from '../foundry/foInterface';

export class foMethod<T extends foNode> extends foKnowledge {
  funct: Action<T>;

  constructor(funct: Action<T>, spec?: any) {
    super(spec);
    this.funct = funct;
  }

  run(context?: any) {
    return this.funct(context);
  }
}

export class foFactory<T extends foNode> extends foKnowledge {
  funct: Spec<T>;

  constructor(funct: Spec<T>, spec?: any) {
    super(spec);
    this.funct = funct;
  }

  run(context?: any) {
    return this.funct(context);
  }
}
