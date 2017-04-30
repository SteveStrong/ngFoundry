import { Injectable } from '@angular/core';

import { Tools } from '../foundry/foTools'
import { SwimDictionary, SwimDef, SwimView } from "./swim.model";

@Injectable()
export class SwimService {
  Dictionary: SwimDictionary = new SwimDictionary();
  viewDef: SwimDef = this.Dictionary.swimViewDef;

  constructor() { }

  getModel():SwimView[] {
    let elements = [
      { 'name': "Steve" },
      { 'name': "Stu" },
      { 'name': "Don" },
      { 'name': "Linda" },
      { 'name': "Anne" },
      { 'name': "Debra" },
      { 'name': "Evan" },
    ];

    let i = 0;
    let result = elements.map(item => {
      (item as any).index = i++;    
      return this.viewDef.newInstance(item) as SwimView;
    });

    return result;
  }

}
