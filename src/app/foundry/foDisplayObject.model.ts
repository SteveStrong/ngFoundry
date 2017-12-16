
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
    static _snapToPixelEnabled: boolean = false;

    //protected _subcomponents: foCollection<foDisplayObject>;
    protected _x: number = 0;
    protected _y: number = 0;

    protected _rotation: number = 0;
    protected _scaleX: number = 1;
    protected _scaleY: number = 1;

    protected _visible: boolean = true;
    protected snapToPixel: boolean = false;


    protected _matrix: Matrix2D = new Matrix2D();
    protected _bounds: iRect;

    public pinX = (): number => { return 0 * this.width / 2; }
    public pinY = (): number => { return 0 * this.height / 2 }
    public rotation = (): number => { return this._rotation; }
    

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    isVisible() {
        return !!(this._visible && this._opacity > 0 && this._scaleX != 0 && this._scaleY != 0);
    };

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this._x = x;
        if (!Number.isNaN(y)) this._y = y;
        if (!Number.isNaN(angle)) this._rotation = angle;
        return this;
    }
	/**
	 * Applies this display object's transformation, alpha, globalCompositeOperation, clipping path (mask), and shadow
	 * to the specified context. This is typically called prior to "DisplayObject/draw".
	 * @method updateContext
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D to update.
	 **/
    updateContextxx(ctx: CanvasRenderingContext2D) {
        //changed from original
        let mtx = this.getMatrix(this._matrix);
        let tx = mtx.tx;
        let ty = mtx.ty;
        if (foDisplayObject._snapToPixelEnabled && this.snapToPixel) {
            tx = tx + (tx < 0 ? -0.5 : 0.5) | 0;
            ty = ty + (ty < 0 ? -0.5 : 0.5) | 0;
        }
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, tx, ty);
        ctx.globalAlpha *= this._opacity;

        // if (o.compositeOperation) { ctx.globalCompositeOperation = o.compositeOperation; }
        // if (o.shadow) { this._applyShadow(ctx, o.shadow); }
    };


    localToGlobal(x: number, y: number, pt?: cPoint) {
        return this.getConcatenatedMatrix(this._matrix).transformPoint(x, y, pt || new cPoint());
    };

    globalToLocal(x: number, y: number, pt?: cPoint) {
        return this.getConcatenatedMatrix(this._matrix).invert().transformPoint(x, y, pt || new cPoint());
    };

    localToLocal(x: number, y: number, target: foDisplayObject, pt?: cPoint) {
        pt = this.localToGlobal(x, y, pt);
        return target.globalToLocal(pt.x, pt.y, pt);
    };

    setTransform(x: number, y: number, scaleX: number, scaleY: number, rotation: number) {
        this._x = x || 0;
        this._y = y || 0;
        this._scaleX = scaleX == undefined ? 1 : scaleX;
        this._scaleY = scaleY == undefined ? 1 : scaleY;
        this._rotation = rotation || 0;
        return this;
    };

    getMatrix(matrix: Matrix2D) {
        let mtx = matrix && matrix.identity() || new Matrix2D();
        let transformMatrix = this['transformMatrix'];
        return transformMatrix ? mtx.copy(transformMatrix) : mtx.appendTransform(this._x, this._y, this._scaleX, this._scaleY, this._rotation, 0, 0, this.pinX(), this.pinY());
    };

    getConcatenatedMatrix(matrix: Matrix2D) {
        let o: foDisplayObject = this;
        let mtx = this.getMatrix(matrix);
        while (o = <foDisplayObject>o.myParent()) {
            mtx.prependMatrix(o.getMatrix(o._matrix));
        }
        return mtx;
    };

    private localHitTest = (hit: iPoint): boolean => {

        let shape = this;

        let mtx = new Matrix2D();
        mtx.appendTransform(shape.x, shape.y, 1, 1, shape.rotation(), 0, 0, shape.pinX(), shape.pinY());

        let loc = mtx.invertPoint(hit.x, hit.y);

        if (loc.x < 0) return false;
        if (loc.x > this.width) return false;

        if (loc.y < 0) return false;
        if (loc.y > this.height) return false;

        return true;
    }

    public hitTest = (hit: iPoint, ctx: CanvasRenderingContext2D): boolean => {

        let angle = this.rotation() * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let x = -this.pinX();
        let y = -this.pinY();


        let width = this.width;
        let height = this.height;

        ctx.save();
        ctx.globalAlpha = .3;
        ctx.fillStyle = 'black';
        ctx.translate(this.x + x, this.y + y);
        ctx.transform(cos, sin, -sin, cos, -x, -y);

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 16;
        ctx.beginPath()
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.restore();

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

    _testHit(ctx: CanvasRenderingContext2D):boolean {
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

    setBounds(x:number, y:number, width:number, height:number): iRect {
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
        if (!bounds) { return bounds; }
        let x = bounds.x;
        let y = bounds.y;
        let width = bounds.width;
        let height = bounds.height;
        let mtx = this._matrix;

        mtx = ignoreTransform ? mtx.identity() : this.getMatrix(mtx);

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
        this.drawOrigin(ctx);

        let angle =  this.rotation() * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        ctx.translate(this.x - this.pinX(), this.y - this.pinY());
        ctx.transform(cos, sin, -sin, cos, this.pinX(), this.pinY());

        this.drawOriginX(ctx);

        this.preDraw(ctx);
        this.draw(ctx);
        this.isSelected && this.drawSelected(ctx);
        this.postDraw(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
        this.afterRender(ctx);
    }


    public afterRender = (ctx: CanvasRenderingContext2D): void => { }

    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(-this.pinX(), -this.pinY(), this.width, this.height);
        ctx.stroke();
    }


    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    public preDraw = (ctx: CanvasRenderingContext2D): void => { }
    public postDraw = (ctx: CanvasRenderingContext2D): void => { }
    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = 1;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.fillRect(-this.pinX(), -this.pinY(), this.width, this.height);
        ctx.stroke();    
        ctx.restore();  
    }


}


