
import { Tools } from '../foundry/foTools'
import { cPoint, cMargin } from "../foundry/foGeometry";
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


export class foImage extends foShape2D {
    public margin: cMargin;

    protected _background: string;
    get background(): string {
        return this._background;
    }
    set background(value: string) {
        this._background = value;
    }

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        let result = super.toJson();
        return result;
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        //this.drawOrigin(ctx);
        this.updateContext(ctx);
        //this.drawOriginX(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        this.isSelected && this.drawSelected(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
    }

    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        this.drawOutline(ctx);
        //this.drawHandles(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {

        let left = ((this.margin && this.margin.left) || 0);
        let top = ((this.margin && this.margin.top) || 0);

        ctx.save();
        if (this.background) {
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        ctx.restore();

        ctx.fillStyle = this.color;

        //ctx.drawImage();
    }

}

Stencil.define(foImage);
