

import { Matrix2D } from './foMatrix2D';
import { foObject } from './foObject.model';
import { foComponent } from './foComponent.model';

import { foHandle2D } from './foHandle2D';
import { iObject, iPoint2D, iPoint } from './foInterface';

export interface iConnectionPoint extends iObject {
    doMoveProxy: (loc: iPoint) => void;
    hitTest: (hit: iPoint2D, ctx?: CanvasRenderingContext2D) => boolean 
    render(ctx: CanvasRenderingContext2D);
}

//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foConnectionPoint2D extends foHandle2D implements iConnectionPoint {

    protected _angle: number;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) {
        this.smash();
        this._angle = value;
    }
    public rotation = (): number => { return this.angle; }

    get color(): string {
        return this._color || 'pink';
    }
    get size(): number { return this._size || 15.0; }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }


    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(angle)) this.angle = angle;
        return this;
    }



    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            let delta = this.size / 2;
            this._matrix.appendTransform(this.x, this.y, 1, 1, this.rotation(), 0, 0, delta, delta);
        }
        return this._matrix;
    };



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


