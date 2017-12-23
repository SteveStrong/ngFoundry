
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle } from '../foundry/foHandle'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foShape2D } from '../foundry/foShape2D.model'
import { foGlyph } from '../foundry/foGlyph.model'

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape1D extends foShape2D {

    protected _x1: number;
    protected _y1: number;
    protected _x2: number;
    protected _y2: number;

    get startX(): number { return this._x1 || 0.0; }
    set startX(value: number) {
        this.smash();
        this._x1 = value;
    }
    get startY(): number { return this._y1 || 0.0; }
    set startY(value: number) {
        this.smash();
        this._y1 = value;
    }

    get finishX(): number { return this._x2 || 0.0; }
    set finishX(value: number) {
        this.smash();
        this._x2 = value;
    }
    get finishY(): number { return this._y2 || 0.0; }
    set finishY(value: number) {
        this.smash();
        this._y2 = value;
    }

    get angle(): number { 
        let { angle, length } = this.angleDistance();
        return angle; 
    }
    set angle(value: number) { 
        //this.smash();
        this._angle = value; 
    }

    get width(): number {
        let { angle, length } = this.angleDistance();
        return this._width || length;
    }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }

    public pinX = (): number => { return 0.0 * this.width; }
    public pinY = (): number => { return 0.0 * this.height; }
    public rotation = (): number => { return this.angle; }

    public begin = (): cPoint => {
        return new cPoint(this.startX, this.startY)
    }

    public end = (): cPoint => {
        return new cPoint(this.finishX, this.finishY)
    }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    private angleDistance(): any {
        let { x: x1, y: y1 } = this.begin();
        let { x: x2, y: y2 } = this.end();

        let dX = x2 - x1;
        let dY = y2 - y1;
        return {
            angle: Math.atan2(dY, dX),
            length: Math.sqrt(dX * dX + dY * dY),
            cX: (x2 + x1) / 2,
            cY: (y2 + y1) / 2,
        };
    }

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(angle)) this.angle = angle;
        return this;
    }

    updateContext(ctx: CanvasRenderingContext2D) {
        let mtx = this.getMatrix();
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
        ctx.globalAlpha *= this.opacity;
    };

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            //this._matrix.appendTransform(this.x, this.y, 1, 1, this.rotation(), 0, 0, this.pinX(), this.pinY());
            //console.log('getMatrix');

            let { angle, length, cX, cY } = this.angleDistance();

            let { x: x1, y: y1 } = this.begin();
            let { x: x2, y: y2 } = this.end();

            this._matrix.appendTransform(x1, y1, 1, 1, angle, 0, 0, this.pinX(), this.pinY());
   
        }
        return this._matrix;
    };

    protected localHitTest = (hit: iPoint): boolean => {

        let { angle, length, cX, cY } = this.angleDistance();
        this._angle = angle;

        let loc = this.globalToLocal(hit.x, hit.y);

        if (loc.x < 0) return false;
        if (loc.x > this.width) return false;

        if (loc.y < -this.height/2) return false;
        if (loc.y > this.height/2) return false;

        return true;
    }


    public hitTest = (hit: iPoint, ctx?: CanvasRenderingContext2D): boolean => {
        return this.localHitTest(hit);
    }

    public drawEnd(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.end()
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

    public drawStart(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.begin()
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

    public createHandles() {
        let { angle, length, cX, cY } = this.angleDistance();

        let { x: x1, y: y1 } = this.begin();
        let { x: x2, y: y2 } = this.end();

        let handles = [
            { x: x1, y: y1 },
            { x: cX, y: cY },
            { x: x2, y: y2 },
        ];

        if (!this._handles) {
            this._handles = new foCollection<foHandle>()
            handles.forEach(item => {
                let handle = new foHandle(item, undefined, this);
                this._handles.addMember(handle);
            });
        } else {
            let i = 0;
            handles.forEach(item => {
                let handle = this._handles.getChildAt(i++)
                handle.override(item);
            });
        }
        return this._handles;
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

        let { angle, length, cX, cY } = this.angleDistance();

        let { x: x1, y: y1 } = this.begin();
        let { x: x2, y: y2 } = this.end();


        ctx.save();
        ctx.lineWidth = 10;
        ctx.fillStyle = 'red';
        ctx.globalAlpha = 1;

        ctx.translate(x1, y1);
        ctx.rotate(angle);
        ctx.fillRect(0, -this.height / 2, length, this.height);

        ctx.restore();

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
        this.drawHandles(ctx);
        this.drawPin(ctx);
    }

    public drawHandles(ctx: CanvasRenderingContext2D) {
        let { x: x1, y: y1 } = this.begin();
        //let { x: x2, y: y2 } = this.end();

        let { angle, length, cX, cY } = this.angleDistance();

        this.createHandles();

        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, -this.height / 2, length, this.height);
        ctx.stroke();

        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(angle);
        //ctx.fillRect(-length/2, -this.height/2, length, this.height);
        ctx.rect(0, -this.height / 2, length, this.height);
        ctx.restore();


        super.drawHandles(ctx);

    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        let { x: x1, y: y1 } = this.begin();
        let { x: x2, y: y2 } = this.end();

        let { angle, length, cX, cY } = this.angleDistance();

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;


        ctx.save();
        //ctx.fillStyle = 'red';
        ctx.translate(x1, y1);
        ctx.rotate(angle);
        //ctx.fillRect(-length/2, -this.height/2, length, this.height);
        ctx.fillRect(0, -this.height / 2, length, this.height);
        ctx.restore();

        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        this.drawHandles(ctx);
        this.drawPin(ctx);

        //this.drawText(ctx, this.myType)
        ctx.restore();
    }
}



