
import { Tools } from './foTools';
import { cPoint, cRect } from './foGeometry';
import { Matrix2D } from './foMatrix2D';

import { iObject, iNode, iShape, iPoint, iSize, Action, iRect } from './foInterface';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foComponent } from './foComponent.model';

import { foGlyph } from '../foundry/foGlyph.model'

//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foDisplayObject extends foGlyph {
    static snapToPixelEnabled: boolean = false;
    protected snapToPixel: boolean = false;

    protected _angle: number = 0;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) {
        this.smash();
        this._angle = value;
    }

    protected _scaleX: number = 1;
    get scaleX(): number { return this._scaleX || 1.0; }
    set scaleX(value: number) {
        this.smash();
        this._scaleX = value;
    }

    protected _scaleY: number = 1;
    get scaleY(): number { return this._scaleY || 1.0; }
    set scaleY(value: number) {
        this.smash();
        this._scaleY = value;
    }

    protected _visible: boolean = true;
    get visible(): boolean { return this._visible; }
    set visible(value: boolean) { this._visible = value; }


    protected _bounds: iRect;

    public pinX = (): number => { return 0 * this.width; }
    public pinY = (): number => { return 0 * this.height; }
    public rotation = (): number => { return this._angle; }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    get isVisible() {
        return !!(this.visible && this.opacity > 0 && this.scaleX != 0 && this.scaleY != 0);
    };

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(angle)) this.angle = angle;
        return this;
    }
	/**
	 * Applies this display object's transformation, alpha, globalCompositeOperation, clipping path (mask), and shadow
	 * to the specified context. This is typically called prior to "DisplayObject/draw".
	 * @method updateContext
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D to update.
	 **/
    updateContext(ctx: CanvasRenderingContext2D) {

        let mtx = this.getMatrix();
        let tx = mtx.tx;
        let ty = mtx.ty;
        if (foDisplayObject.snapToPixelEnabled && this.snapToPixel) {
            tx = tx + (tx < 0 ? -0.5 : 0.5) | 0;
            ty = ty + (ty < 0 ? -0.5 : 0.5) | 0;
        }
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, tx, ty);
        ctx.globalAlpha *= this.opacity;
    };

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            this._matrix.appendTransform(this.x, this.y, this.scaleX, this.scaleY, this.rotation(), 0, 0, this.pinX(), this.pinY());
             //console.log('getMatrix');
        }
        return this._matrix;
    };



    protected localHitTest = (hit: iPoint): boolean => {

        let loc = this.globalToLocal(hit.x, hit.y);

        if (loc.x < 0) return false;
        if (loc.x > this.width) return false;

        if (loc.y < 0) return false;
        if (loc.y > this.height) return false;

        return true;
    }



    public hitTest = (hit: iPoint, ctx?: CanvasRenderingContext2D): boolean => {
        return this.localHitTest(hit);
    }


    public hitTestWithDraw = (hit: iPoint, ctx: CanvasRenderingContext2D): boolean => {
        let x = hit.x;
        let y = hit.y;
        ///var ctx = DisplayObject._hitTestContext;

        ctx.setTransform(1, 0, 0, 1, -x, -y);
        this.draw(ctx);

        let isHit = this._testHit(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 2, 2);
        return isHit;
    };

    _testHit(ctx: CanvasRenderingContext2D): boolean {
        try {
            let hit = ctx.getImageData(0, 0, 1, 1).data[3] > 1;
            return hit;
        } catch (e) {
            throw "An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.";
        }
        //return false;
    };

    getBounds(): iRect {
        return this._bounds;
    };

    clearBounds() {
        this._bounds = undefined;
        return this._bounds;
    };

    setBounds(x: number, y: number, width: number, height: number): iRect {
        this._bounds = this._bounds || new cRect(x, y, width, height);
        return this._bounds;
    };

    getTransformedBounds(): iRect {
        return this._getBounds();
    };

    _getBounds(matrix?: Matrix2D, ignoreTransform?): iRect {
        return this._transformBounds(this.getBounds(), matrix, ignoreTransform);
    };

    _transformBounds(bounds: iRect, matrix: Matrix2D, ignoreTransform): iRect {
        if (!bounds) {
            return bounds;
        }
        let x = bounds.x;
        let y = bounds.y;
        let width = bounds.width;
        let height = bounds.height;
        let mtx = this.getMatrix();

        if (x || y) {  // TODO: simplify this.
            mtx.appendTransform(0, 0, 1, 1, 0, 0, 0, -x, -y);
        }

        if (matrix) {
            mtx.prependMatrix(matrix);
        }

        let x_a = width * mtx.a, x_b = width * mtx.b;
        let y_c = height * mtx.c, y_d = height * mtx.d;
        let tx = mtx.tx, ty = mtx.ty;

        let minX = tx, maxX = tx, minY = ty, maxY = ty;

        if ((x = x_a + tx) < minX) { minX = x; } else if (x > maxX) { maxX = x; }
        if ((x = x_a + y_c + tx) < minX) { minX = x; } else if (x > maxX) { maxX = x; }
        if ((x = y_c + tx) < minX) { minX = x; } else if (x > maxX) { maxX = x; }

        if ((y = x_b + ty) < minY) { minY = y; } else if (y > maxY) { maxY = y; }
        if ((y = x_b + y_d + ty) < minY) { minY = y; } else if (y > maxY) { maxY = y; }
        if ((y = y_d + ty) < minY) { minY = y; } else if (y > maxY) { maxY = y; }

        return bounds.setValue(minX, minY, maxX - minX, maxY - minY);
    };


    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        //this.drawOrigin(ctx);
        this.updateContext(ctx);
        this.drawOriginX(ctx);

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

    public drawPin(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.arc(this.pinX(), this.pinY(), 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'pink';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOrigin(ctx: CanvasRenderingContext2D) {
        let x = this.pinX();
        let y = this.pinY();

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x - 50, y);
        ctx.lineTo(x + 50, y);
        ctx.moveTo(x, y - 50);
        ctx.lineTo(x, y + 50);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOriginX(ctx: CanvasRenderingContext2D) {
        let x = this.pinX();
        let y = this.pinY();

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(x - 50, y - 50);
        ctx.lineTo(x + 50, y + 50);
        ctx.moveTo(x + 50, y - 50);
        ctx.lineTo(x - 50, y + 50);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
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
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = 6;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
    }


}


