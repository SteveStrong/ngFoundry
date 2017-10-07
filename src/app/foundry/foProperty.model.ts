

import { foKnowledge } from './foKnowledge.model'

export class foProperty extends foKnowledge {

  constructor(spec:any=undefined) {
    super(spec);
    this.myType = 'foProperty';
  }
  
}