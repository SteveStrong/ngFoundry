import { Injectable } from '@angular/core';

import { Tools } from '../foundry/foTools'
import { SwimDictionary, SwimElementDef, SwimLaneDef, SwimElementView, SwimLaneView } from "./swim.model";

@Injectable()
export class SwimService {
  Dictionary: SwimDictionary = new SwimDictionary();
  viewElementDef: SwimElementDef = this.Dictionary.swimViewDef;
  viewLaneDef: SwimLaneDef = this.Dictionary.swimLaneViewDef;

  constructor() { }

  getModel(total: number): SwimElementView[] {
    let elements = [
      { 'name': "Steve" },
      { 'name': "Stu" },
      { 'name': "Don" },
      { 'name': "Linda" },
      { 'name': "Anne" },
      { 'name': "Debra" },
      { 'name': "Evan" },
    ].slice(0, total)

    let i = 0;
    let result = elements.map(item => {
      (item as any).index = i++;
      return this.viewElementDef.newInstance(item) as SwimElementView;
    });

    return result;
  }

  getSwimLanes(): SwimLaneView[] {
    let lanes = [
      { 'title': "GitHub" },
      { 'title': "Docker" },
      { 'title': "Data Center" },
      { 'title': "done" },
      { 'title': "vvvvv" }
    ];

    let i = 0;
    let result = lanes.map(item => {
      (item as any).index = i++;
      let found = this.viewLaneDef.newInstance(item) as SwimLaneView;
      (found as any).elements = this.getModel(i + 3);
      return found;
    });

    return result;
  }

}
