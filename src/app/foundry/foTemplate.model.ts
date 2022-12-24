import { foKnowledge } from './foKnowledge.model';
import { RuntimeType } from './foRuntimeType';

export class foTemplate extends foKnowledge {
  constructor(spec?: any) {
    super(spec);
  }
}

RuntimeType.knowledge(foTemplate);
