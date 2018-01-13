import { foObject } from './foObject.model'
import { foNode } from './foNode.model'
import {  Action, Spec } from '../foundry/foInterface';

export class foMethod<T extends foNode> extends foObject {

  funct:Action<T>

  constructor(funct:Action<T>, spec?:any) {
    super(spec);
    this.funct = funct;
  }
  
}

export class foFactory<T extends foNode> extends foObject {

  funct:Spec<T>

  constructor(funct:Spec<T>, spec?:any) {
    super(spec);
    this.funct = funct;
  }

  run(context?:any) {
    return this.funct(context);
  }
  
}