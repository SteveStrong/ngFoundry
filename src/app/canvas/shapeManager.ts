import { Tools } from '../foundry/foTools'
import { iObject } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { iShape } from "./shape";


export class shapeManager extends foComponent {

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

//   findHitShape(x: number, y: number): iShape {
//     for (var i: number = 0; i < this.subcomponents().length; i++) {
//       let shape: iShape = this.subcomponents()[i];
//       if (shape.hitTest(x, y)) {
//         return shape
//       }
//     }
//     return null;
//   }

}