
import { Tools } from './foTools';
import { cPoint } from './foGeometry';
import { Matrix2D } from './foMatrix2D';

import { iObject, iNode, iShape, iPoint, iSize, iRect, Action } from './foInterface';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foComponent } from './foComponent.model';

import { foGlyph } from './foGlyph.model';
import { Lifecycle } from 'app/foundry/foLifecycle';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foHandle extends foNode {

    protected _x: number;
    protected _y: number;
    protected _size: number;
    protected _opacity: number;
    protected _color: string;

    get x(): number { return this._x || 0.0; }
    set x(value: number) {
        this.smash();
        this._x = value;
    }
    get y(): number { return this._y || 0.0 }
    set y(value: number) {
        this.smash();
        this._y = value;
    }

    get size(): number { return this._size || 10.0; }
    set size(value: number) { this._size = value; }

    get opacity(): number { return this._opacity || 1; }
    set opacity(value: number) { this._opacity = value; }

    get color(): string {
        return this._color || 'black';
    }
    set color(value: string) {
        this._color = value;
    }

    public drawHover: (ctx: CanvasRenderingContext2D) => void;
    public preDraw: (ctx: CanvasRenderingContext2D) => void;
    public postDraw: (ctx: CanvasRenderingContext2D) => void;

    protected _matrix: Matrix2D;
    protected _invMatrix: Matrix2D;
    smash() {
        //console.log('smash matrix')
        this._matrix = undefined;
        this._invMatrix = undefined;
    }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }


    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        return this;
    }

    public moveTo(loc: iPoint, offset?: iPoint) {
        this.myParentGlyph().moveHandle(this, loc);
        return this;
    }


    updateContext(ctx: CanvasRenderingContext2D) {
        let mtx = this.getMatrix();
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
        ctx.globalAlpha *= this.opacity;
    };

    getGlobalMatrix() {
        let mtx = new Matrix2D(this.getMatrix());
        let parent = <foGlyph>this.myParent()
        if (parent) {
            mtx.prependMatrix(parent.getGlobalMatrix());
        }
        return mtx;
    };

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            let delta = this.size / 2;
            this._matrix.appendTransform(this.x, this.y, 1, 1, 0, 0, 0, delta, delta);
        }
        return this._matrix;
    };

    getInvMatrix() {
        if (this._invMatrix === undefined) {
            this._invMatrix = this.getMatrix().invertCopy();
        }
        return this._invMatrix;
    };

    localToGlobal(x: number, y: number, pt?: cPoint) {
        let mtx = this.getGlobalMatrix();
        return mtx.transformPoint(x, y, pt);
    };

    globalToLocal(x: number, y: number, pt?: cPoint) {
        let inv = this.getGlobalMatrix().invertCopy();
        return inv.transformPoint(x, y, pt);
    };

    public getOffset = (loc: iPoint): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x - loc.x, y - loc.y);
    }


    


    public myParentGlyph(): foGlyph {
        return this.myParent && <foGlyph>this.myParent()
    }

    protected localHitTest = (hit: iPoint): boolean => {

        let loc = this.globalToLocal(hit.x, hit.y);

        if (loc.x < 0) return false;
        if (loc.x > this.size) return false;

        if (loc.y < 0) return false;
        if (loc.y > this.size) return false;
        //foObject.beep();
        return true;
    }

    public hitTest = (hit: iPoint, ctx?: CanvasRenderingContext2D): boolean => {
        return this.localHitTest(hit);
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        this.updateContext(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        ctx.restore();
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;

        ctx.fillRect(0, 0, this.size, this.size);
    }

}


