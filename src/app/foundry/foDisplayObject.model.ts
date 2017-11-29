
import { Tools } from './foTools';
import { cPoint } from './foGeometry';
import { Matrix2D } from './foMatrix2D';

import { iObject, iNode, iShape, iPoint, iSize, Action } from './foInterface';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foComponent } from './foComponent.model';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foDisplayObject extends foNode {
    static _snapToPixelEnabled:boolean=false;

    protected _x: number;
    protected _y: number;
    protected _transformMatrix: number;

    protected _regX: number;
    protected _regY: number;
    protected _rotation: number;
    protected _scaleX: number;
    protected _scaleY: number;
    protected _skewX: number;
    protected _skewY: number;

    protected _alpha: number = 1.0;
    protected _visible: boolean = true;
    protected snapToPixel: boolean = false;
    

    protected matrix: Matrix2D = new Matrix2D();

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

	isVisible() {
		return !!(this._visible && this._alpha > 0 && this._scaleX != 0 && this._scaleY != 0);
    };
    

	/**
	 * Applies this display object's transformation, alpha, globalCompositeOperation, clipping path (mask), and shadow
	 * to the specified context. This is typically called prior to {{#crossLink "DisplayObject/draw"}}{{/crossLink}}.
	 * @method updateContext
	 * @param {CanvasRenderingContext2D} ctx The canvas 2D to update.
	 **/
	updateContext(ctx) {

		

		
		this.getMatrix(mtx);
		var tx = mtx.tx, ty = mtx.ty;
		if (foDisplayObject._snapToPixelEnabled && this.snapToPixel) {
			tx = tx + (tx < 0 ? -0.5 : 0.5) | 0;
			ty = ty + (ty < 0 ? -0.5 : 0.5) | 0;
		}
		ctx.transform(mtx.a,  mtx.b, mtx.c, mtx.d, tx, ty);
		ctx.globalAlpha *= o.alpha;
		if (o.compositeOperation) { ctx.globalCompositeOperation = o.compositeOperation; }
		if (o.shadow) { this._applyShadow(ctx, o.shadow); }
	};


    localToGlobal(x, y, pt) {
		return this.getConcatenatedMatrix(this._props.matrix).transformPoint(x,y, pt||new createjs.Point());
    };

    globalToLocal(x, y, pt) {
		return this.getConcatenatedMatrix(this._props.matrix).invert().transformPoint(x,y, pt||new createjs.Point());
    };
    
    localToLocal(x, y, target, pt) {
		pt = this.localToGlobal(x, y, pt);
		return target.globalToLocal(pt.x, pt.y, pt);
    };
    
    setTransform(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		this._x = x || 0;
		this._y = y || 0;
		this._scaleX = scaleX == null ? 1 : scaleX;
		this._scaleY = scaleY == null ? 1 : scaleY;
		this._rotation = rotation || 0;
		this._skewX = skewX || 0;
		this._skewY = skewY || 0;
		this._regX = regX || 0;
		this._regY = regY || 0;
		return this;
    };
    
    getMatrix(matrix:Matrix2D) {
        let o = this;
        let mtx = matrix && matrix.identity() || new Matrix2D();
		return o.transformMatrix ?  mtx.copy(o.transformMatrix) : mtx.appendTransform(o._x, o._y, o._scaleX, o._scaleY, o._rotation, o._skewX, o._skewY, o._regX, o._regY);
	};
    
	getConcatenatedMatrix(matrix:Matrix2D) {
		var o = this, mtx = this.getMatrix(matrix);
		while (o = o.parent) {
			mtx.prependMatrix(o.getMatrix(o._props.matrix));
		}
		return mtx;
    };

    hitTest(x, y) {
		var ctx = DisplayObject._hitTestContext;
		ctx.setTransform(1, 0, 0, 1, -x, -y);
		this.draw(ctx);
 
		var hit = this._testHit(ctx);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, 2, 2);
		return hit;
    };
    
    _testHit(ctx) {
		try {
			var hit = ctx.getImageData(0, 0, 1, 1).data[3] > 1;
		} catch (e) {
			throw "An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.";
		}
		return hit;
	};
    
    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();
        //this.drawOrigin(ctx);
        ctx.translate(this.x, this.y);
        this.drawOriginX(ctx);

        this.preDraw(ctx);
        this.draw(ctx);
        this.postDraw(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
        //this.drawOriginX(ctx); 
    }



    public drawOrigin(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(-50, 0);
        ctx.lineTo(50, 0);
        ctx.moveTo(0, -50);
        ctx.lineTo(0, 50);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOriginX(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(-50, -50);
        ctx.lineTo(50, 50);
        ctx.moveTo(50, -50);
        ctx.lineTo(-50, 50);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOutline(ctx: CanvasRenderingContext2D) {
        let width = this.width;
        let height = this.height;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, width, height);
        ctx.stroke();
    }


    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        this.drawOutline(ctx);
    }

    public preDraw = (ctx: CanvasRenderingContext2D): void => { }
    public postDraw = (ctx: CanvasRenderingContext2D): void => { }
    public draw = (ctx: CanvasRenderingContext2D): void => {
    }


}


