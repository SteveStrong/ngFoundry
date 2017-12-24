
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


    get width(): number {
        let { angle, length } = this.angleDistance();
        return this._width || length;
    }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; };
    public rotation = (): number => { return this.angle; }

    public begin = (name?: string): cPoint => {
        return new cPoint(this.startX, this.startY, name)
    }

    public end = (name?: string): cPoint => {
        return new cPoint(this.finishX, this.finishY,name)
    }

    public center = (name?: string): cPoint => {
        return new cPoint((this.startX + this.finishX) / 2, (this.startY + this.finishY) / 2, name);
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
            angle: foGlyph.RAD_TO_DEG * Math.atan2(dY, dX),
            length: Math.sqrt(dX * dX + dY * dY),
            cX: (x2 + x1) / 2,
            cY: (y2 + y1) / 2,
        };
    }

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        let ang = Number.isNaN(angle) ? 0 : angle;

        if (!Number.isNaN(x) && !Number.isNaN(y)) {
            this.x = x;
            this.y = y;
            let { angle, length, cX, cY } = this.angleDistance();
            let mtx = new Matrix2D();
            mtx.appendTransform(x - cX, y - cY, 1, 1, this.rotation(), 0, 0, 0, 0);
            let start = mtx.transformPoint(this.startX, this.startY);
            let finish = mtx.transformPoint(this.finishX, this.finishY);
            this.startX = start.x;
            this.startY = start.y;
            this.finishX = finish.x;
            this.finishY = finish.y;
        }
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

            let { angle } = this.angleDistance();

            this._matrix.appendTransform(this.x, this.y, 1, 1, angle + this.rotation(), 0, 0, this.pinX(), this.pinY());
        }
        return this._matrix;
    };


    protected localHitTest = (hit: iPoint): boolean => {

        let loc = this.globalToLocal(hit.x, hit.y);

        if (loc.x < 0) return false;
        if (loc.x > this.width) return false;

        if (loc.y < -this.height / 2) return false;
        if (loc.y > this.height / 2) return false;

        return true;
    }


    public hitTest = (hit: iPoint, ctx?: CanvasRenderingContext2D): boolean => {
        return this.localHitTest(hit);
    }

    public drawEnd(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.globalToLocalPoint(this.end())
        let size = 10;

        ctx.save();
        ctx.beginPath();
        //ctx.setLineDash([5, 5]);
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.lineWidth = 2;
        //ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawStart(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.globalToLocalPoint(this.begin());
        let size = 10;

        ctx.save();
        ctx.beginPath();
        //ctx.setLineDash([5, 5]);
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineWidth = 2;
        //ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public createHandles(): foCollection<foHandle> {

        let begin = this.globalToLocalPoint(this.begin('start'));
        let center = this.globalToLocalPoint(this.center('center'));
        let end = this.globalToLocalPoint(this.end('end'));

        let spec = [begin, center, end];
        return this.generateHandles(spec);
    }

    public moveHandle(handle: foHandle, loc: iPoint) {
        switch (handle.myName) {
            case 'start':
                this.startX = loc.x;
                this.startY = loc.y
                break;

            case 'end':
                this.finishX = loc.x;
                this.finishY = loc.y
                break;

            case 'center':
                this.moveTo(loc)
                break;
        }
        let { angle, length, cX, cY } = this.angleDistance();
        this.x = cX;
        this.y = cY;
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

        this.afterRender && this.afterRender(ctx);
    }



    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.setLineDash([15, 5]);

       // ctx.fillRect(0, 0, this.width, this.height);

        ctx.lineWidth = 4;
        //ctx.strokeStyle = '#003300';

        let { x: x1, y: y1 } = this.globalToLocalPoint(this.begin());
        let { x: x2, y: y2 } = this.globalToLocalPoint(this.end());

        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        //this.drawStart(ctx);
        //this.drawEnd(ctx);
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
        ctx.fillStyle = 'red';
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawHandles(ctx);
        this.drawPin(ctx);
    }

    public drawHandles(ctx: CanvasRenderingContext2D) {
        this.createHandles();
        super.drawHandles(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        let { x: x1, y: y1 } = this.globalToLocalPoint(this.begin());
        let { x: x2, y: y2 } = this.globalToLocalPoint(this.end());

        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;

        //ctx.fillStyle = 'green';
        //ctx.fillRect(0, 0, this.width, this.height);

        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}



