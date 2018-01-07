
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iPoint } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle } from '../foundry/foHandle'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'

import { foShape2D } from '../foundry/foShape2D.model'
import { foGlyph } from '../foundry/foGlyph.model'
import { Lifecycle } from './foLifecycle';


export enum shape1DEndNamed {
    start = "start",
    finish = "finish",
    center = "center"
};


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape1D extends foShape2D {

    public thickness: number;

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
        if (!this._width) {
            let { length } = this.angleDistance();
            this._width = length;
        }
        return this._width;
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
        return new cPoint(this.finishX, this.finishY, name)
    }

    public center = (name?: string): cPoint => {
        return new cPoint((this.startX + this.finishX) / 2, (this.startY + this.finishY) / 2, name);
    }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            startX: this.startX,
            startY: this.startY,
            finishX: this.finishX,
            finishY: this.finishY,
            glue: this._glue && Tools.asArray(this.glue.asJson)
        });
    }

    private setStart(point: iPoint) {
        this.startX = point.x;
        this.startY = point.y;
        let { x: cX, y: cY } = this.center();
        this.x = cX;
        this.y = cY;
        this.width = 0;
    }

    private setFinish(point: iPoint) {
        this.finishX = point.x;
        this.finishY = point.y;
        let { x: cX, y: cY } = this.center();
        this.x = cX;
        this.y = cY;
        this.width = 0;
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

    glueStartTo(target: foShape2D, handleName?: string) {
        let glue =  this.establishGlue(shape1DEndNamed.start, target, handleName);
        glue.doTargetMoveProxy = this.setStart.bind(this);
        return glue;
    }

    glueFinishTo(target: foShape2D, handleName?: string) {
        let glue = this.establishGlue(shape1DEndNamed.finish, target, handleName);
        glue.doTargetMoveProxy = this.setFinish.bind(this);
        return glue;
    }

    unglueStart() {
        return this.dissolveGlue(shape1DEndNamed.start);
    }

    unglueFinish() {
        return this.dissolveGlue(shape1DEndNamed.finish);
    }

    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        let { x: cX, y: cY } = this.center();

        this.x = Number.isNaN(x) ? cX : x;
        this.y = Number.isNaN(y) ? cY : y;

        let mtx = new Matrix2D();
        mtx.appendTransform(this.x, this.y, 1, 1, ang + this.rotation(), 0, 0, cX, cY);
        let start = mtx.transformPoint(this.startX, this.startY);
        let finish = mtx.transformPoint(this.finishX, this.finishY);
        this.startX = start.x;
        this.startY = start.y;
        this.finishX = finish.x;
        this.finishY = finish.y;
        this.width = 0;
        return this;
    }

    public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN): boolean {
        let changed = super.didLocationChange(x, y, angle);
        let { x: cX, y: cY } = this.center();
        if (!Number.isNaN(x) && this.x != cX) {
            changed = true;
        };
        if (!Number.isNaN(y) && this.y != cY) {
            changed = true;
        };
        return changed;
    }

    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            this.initialize(x, y, angle);
            Lifecycle.dropped(this, this.getLocation());
        }
        return this;
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        this.initialize(x, y, angle);
        Lifecycle.moved(this, this.getLocation());
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

        let size = this.height / 2;
        if (loc.y < -size) return false;
        if (loc.y > size) return false;

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

        let begin = this.globalToLocalPoint(this.begin(shape1DEndNamed.start));
        let center = this.globalToLocalPoint(this.center(shape1DEndNamed.center));
        let end = this.globalToLocalPoint(this.end(shape1DEndNamed.finish));

        Tools.mixin(begin, { size: 20 });
        Tools.mixin(end, { size: 20 });
        Tools.mixin(center, { size: 20 });
        let spec = [begin, center, end];
        let proxy = [this.setStart.bind(this), this.moveTo.bind(this), this.setFinish.bind(this)];

        return this.generateHandles(spec, proxy);
    }


    //same as Shape1D
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

        ctx.save();
        ctx.globalAlpha = .3;
        ctx.fillStyle = 'cyan';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore()

        ctx.lineWidth = this.thickness || 4;
        //ctx.strokeStyle = '#003300';

        let { x: x1, y: y1 } = this.globalToLocalPoint(this.begin());
        let { x: x2, y: y2 } = this.globalToLocalPoint(this.end());

        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        this.drawStart(ctx);
        this.drawEnd(ctx);
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
        ctx.fillStyle = 'red';
        ctx.lineWidth = 2 * (this.thickness || 4);
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
        ctx.strokeStyle = this.color;

        ctx.save();
        ctx.globalAlpha = .3;
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore()

        ctx.lineWidth = this.thickness || 1;
        ctx.beginPath()
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

    }
}


import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foShape1D);



