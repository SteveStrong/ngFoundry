
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
    protected _transformMatrix: number;

    protected _regX: number = 0;
    protected _regY: number = 0;
    protected _rotation: number = 0;
    protected _scaleX: number = 1;
    protected _scaleY: number = 1;
    protected _skewX: number = 0;
    protected _skewY: number = 0;

    protected _alpha: number = 1.0;
    protected _visible: boolean = true;
    protected snapToPixel: boolean = false;


    protected matrix: Matrix2D = new Matrix2D();
    protected _bounds: iRect;

    public pinX = (): number => { return 0 * this.width / 2; }
    public pinY = (): number => { return 0 * this.height / 2 }
    public rotation = (): number => { return this._rotation; }
    

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    isVisible() {
        return !!(this._visible && this._alpha > 0 && this._scaleX != 0 && this._scaleY != 0);
    };


	/**
	 * Applies this display object's transformation, alpha, globalCompositeOperation, clipping path (mask), and shadow
	 * to the specified context. This is typically called prior to "DisplayObject/draw".
	 * @method updateContext
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D to update.
	 **/
    updateContext(ctx: CanvasRenderingContext2D) {
        //changed from original
        let mtx = this.getMatrix(this.matrix);
        let tx = mtx.tx;
        let ty = mtx.ty;
        if (foDisplayObject._snapToPixelEnabled && this.snapToPixel) {
            tx = tx + (tx < 0 ? -0.5 : 0.5) | 0;
            ty = ty + (ty < 0 ? -0.5 : 0.5) | 0;
        }
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, tx, ty);
        ctx.globalAlpha *= this._alpha;

        // if (o.compositeOperation) { ctx.globalCompositeOperation = o.compositeOperation; }
        // if (o.shadow) { this._applyShadow(ctx, o.shadow); }
    };


    localToGlobal(x: number, y: number, pt?: cPoint) {
        return this.getConcatenatedMatrix(this.matrix).transformPoint(x, y, pt || new cPoint());
    };

    globalToLocal(x: number, y: number, pt?: cPoint) {
        return this.getConcatenatedMatrix(this.matrix).invert().transformPoint(x, y, pt || new cPoint());
    };

    localToLocal(x: number, y: number, target: foDisplayObject, pt?: cPoint) {
        pt = this.localToGlobal(x, y, pt);
        return target.globalToLocal(pt.x, pt.y, pt);
    };

    setTransform(x: number, y: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number, regX: number, regY: number) {
        this._x = x || 0;
        this._y = y || 0;
        this._scaleX = scaleX == undefined ? 1 : scaleX;
        this._scaleY = scaleY == undefined ? 1 : scaleY;
        this._rotation = rotation || 0;
        this._skewX = skewX || 0;
        this._skewY = skewY || 0;
        this._regX = regX || this.pinX(); //is this right?
        this._regY = regY || this.pinY();
        return this;
    };

    getMatrix(matrix: Matrix2D) {
        let mtx = matrix && matrix.identity() || new Matrix2D();
        let transformMatrix = this['transformMatrix'];
        return transformMatrix ? mtx.copy(transformMatrix) : mtx.appendTransform(this._x, this._y, this._scaleX, this._scaleY, this._rotation, this._skewX, this._skewY, this._regX, this._regY);
    };

    getConcatenatedMatrix(matrix: Matrix2D) {
        let o: foDisplayObject = this;
        let mtx = this.getMatrix(matrix);
        while (o = <foDisplayObject>o.myParent()) {
            mtx.prependMatrix(o.getMatrix(o.matrix));
        }
        return mtx;
    };

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
        let mtx = this.matrix;

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

        this.drawOriginX(ctx);

        ctx.translate(this.x - this.pinX(), this.y - this.pinY());
        ctx.transform(cos, sin, -sin, cos, this.pinX(), this.pinY());

        this.preDraw(ctx);
        this.draw(ctx);
        this.postDraw(ctx);
        this.drawPin(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
    }



    public drawOutline(ctx: CanvasRenderingContext2D) {
    }


    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        this.drawOutline(ctx);
    }

    public preDraw = (ctx: CanvasRenderingContext2D): void => { }
    public postDraw = (ctx: CanvasRenderingContext2D): void => { }
    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 10;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();    
        ctx.restore();  
    }


}


