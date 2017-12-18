
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foShape2D } from '../foundry/foShape2D.model'
import { foGlyph } from '../foundry/foGlyph.model'

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape1D extends foShape2D {

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public rotation = (): number => { return this.angle; }

    public begin = (): cPoint => {
        return new cPoint(-this.pinX(), -this.pinY())
    }

    public end = (): cPoint => {
        return new cPoint(this.width - this.pinX(), this.height - this.pinY())
    }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    public drawStart(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.begin()
        let size = 10;

        ctx.save();
        ctx.beginPath();
        //ctx.setLineDash([5, 5]);
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawEnd(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.end()
        let size = 10;

        ctx.save();
        ctx.beginPath();
        //ctx.setLineDash([5, 5]);
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        this.updateContext(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        this.isSelected && this.drawSelected(ctx);

        this.drawStart(ctx);
        this.drawEnd(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();

        this.afterRender && this.afterRender(ctx);
    }

    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.setLineDash([15, 5]);

        let { x:x1, y:y1 } = this.begin();
        let { x:x2, y:y2 } = this.end();

        ctx.globalAlpha = .5;
        ctx.fillRect(x1, y1, this.width, this.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';

        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.lineWidth = 4;



        let { x:x1, y:y1 } = this.begin();
        let { x:x2, y:y2 } = this.end();

        ctx.globalAlpha = .5;
        ctx.fillRect(x1, y1, this.width, this.height);

        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        //this.drawText(ctx, this.myType)
        ctx.restore();
    }
}



