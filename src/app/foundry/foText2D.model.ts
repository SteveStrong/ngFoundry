
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle } from '../foundry/foHandle'
import { foGlue } from '../foundry/foGlue'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foShape2D, Stencil } from '../foundry/foShape2D.model'


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foText2D extends foShape2D {
    text:string = 'This is the default text'

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson():any {
        let result = super.toJson();
        result.angle = this.angle;
        return result;
    }  



    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.rect(0, 0, this.width, this.height);

        
        this.drawText(ctx, this.text)
    }

}


Stencil.define(foText2D);

