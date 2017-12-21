
import { Tools } from './foTools';
import { cPoint } from './foGeometry';
import { Matrix2D } from './foMatrix2D';

import { iObject, iNode, iShape, iPoint, iSize, iRect, Action } from './foInterface';

import { foHandle } from './foHandle';
import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foComponent } from './foComponent.model';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlyph extends foNode implements iShape {

    protected _isSelected: boolean = false;
    get isSelected(): boolean { return this._isSelected; }
    set isSelected(value: boolean) { this._isSelected = value; }

    protected _subcomponents: foCollection<foGlyph>;
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;
    protected _opacity: number;
    protected _color: string;

    protected _handles: Array<foHandle> = new Array<foHandle>()

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

    get width(): number { return this._width || 0.0; }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }

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
    public afterRender: (ctx: CanvasRenderingContext2D) => void;

    protected _matrix: Matrix2D;
    protected _invMatrix: Matrix2D;
    smash() {
        //console.log('smash matrix')
        this._matrix = undefined;
        this._invMatrix = undefined;
    }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    get asJson() {
        let parent = <foGlyph>this.myParent();
        return {
            parentGuid: parent && parent.myGuid,
            myGuid: this.myGuid,
            myType: this.myType,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            opacity: this.opacity,
            color: this.color,
        }
    }

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
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
            this._matrix.appendTransform(this.x, this.y, 1, 1, 0, 0, 0, 0, 0);
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
        return mtx.transformPoint(x, y, pt || new cPoint());
    };

    globalToLocal(x: number, y: number, pt?: cPoint) {
        let inv = this.getGlobalMatrix().invertCopy();
        return inv.transformPoint(x, y, pt || new cPoint());
    };

    localToLocal(x: number, y: number, target: foGlyph, pt?: cPoint) {
        pt = this.localToGlobal(x, y, pt);
        return target.globalToLocal(pt.x, pt.y, pt);
    };

    public getOffset = (loc: iPoint): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x - loc.x, y - loc.y);
    }

    public getLocation = (): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x, y);
    }

    public setLocation = (loc: iPoint): iPoint => {
        this.x = loc.x;
        this.y = loc.y;
        return this.getLocation();
    }

    public getSize = (scale: number = 1): iSize => {
        //structual type
        return {
            width: this.width * scale,
            height: this.height * scale
        }
    }

    public scaleSize = (scale: number): iSize => {
        this.x -= (this.width * (scale - 1)) / 2.0;
        this.y -= (this.height * (scale - 1)) / 2.0;
        this.width *= scale;
        this.height *= scale;
        return this.getSize(1.0);
    }

    public doMove(loc: iPoint, offset?: iPoint): iPoint {
        this.x = loc.x + (offset ? offset.x : 0);
        this.y = loc.y + (offset ? offset.y : 0);

        return new cPoint(this.x, this.y);
    }

    public setColor(color: string): string {
        this.color = color;
        return this.color;
    };

    public setOpacity(opacity: number): number {
        this.opacity = opacity;
        return this.opacity;
    };

    unSelect(deep: boolean = true) {
        this.isSelected = false;
        deep && this.Subcomponents.forEach(item => {
            (<foGlyph>item).unSelect(deep);
        })
    }

    protected childObjectUnderPoint(hit: iPoint, ctx: CanvasRenderingContext2D): foGlyph {
        let children = this.Subcomponents;
        let total = children.length;
        for (let i: number = 0; i < total; i++) {
            let child: foGlyph = <foGlyph>children[i];
            if (child.hitTest(hit, ctx)) {
                return child;
            }
        }
        return undefined;
    }

    findObjectUnderPoint(hit: iPoint, deep: boolean, ctx: CanvasRenderingContext2D): foGlyph {
        let found: foGlyph = this.hitTest(hit, ctx) && this;

        if (deep) {
            let child = this.childObjectUnderPoint(hit, ctx);
            found = child ? child : found;
        }
        return found;
    }

    protected childObjectUnderShape(hit: iShape, ctx: CanvasRenderingContext2D): foGlyph {
        let children = this.Subcomponents;
        let total = children.length;
        for (let i: number = 0; i < total; i++) {
            let child: foGlyph = <foGlyph>children[i];
            if (child.overlapTest(hit, ctx)) {
                return child;
            }
        }
        return undefined;
    }

    findObjectUnderShape(hit: iShape, deep: boolean, ctx: CanvasRenderingContext2D): foGlyph {
        let found: foGlyph = this.overlapTest(hit, ctx) && this;

        if (deep) {
            let child = this.childObjectUnderShape(hit, ctx);
            found = child ? child : found;
        }
        return found;
    }

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



    public overlapTest = (hit: iShape, ctx: CanvasRenderingContext2D): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        let loc = hit.getLocation();
        let size = hit.getSize(1.0);
        if (loc.x > x + width) return false;
        if (loc.x + size.width < x) return false;
        if (loc.y > y + height) return false;
        if (loc.y + size.height < y) return false;
        return true;
    }

    protected pinLocation() {
        return {
            x: 0,
            y: 0,
        }
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

    drawText(ctx: CanvasRenderingContext2D, text: string) {
        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
        let fontsize = 20;
        let array = text.split('|');
        let dx = 10;
        let dy = 20;
        for (var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], dx, dy);
            dy += (fontsize + 4);
        }
    };



    public drawPin(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.pinLocation();

        ctx.save();
        ctx.beginPath();

        ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'pink';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }

    public drawOrigin(ctx: CanvasRenderingContext2D) {
        let { x, y } = this.pinLocation();

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
        let { x, y } = this.pinLocation();

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

    public createHandles() {
        if (this._handles.length == 0) {
            let handles = [
                { x: 0, y: 0 },
                { x: this.width, y: 0 },
                { x: this.width, y: this.height },
                { x: 0, y: this.height },
            ]
            handles.forEach(item => {
                this._handles.push(new foHandle(item, undefined, this));
            });
        }
    }

    public getHandles(): Array<foHandle> {
        return this._handles;
    }

    public findHandle(loc: cPoint, e): foHandle {
        if ( !this._handles) return;

        for (var i: number = 0; i < this._handles.length; i++) {
            let handle: foHandle = this._handles[i];
            if (handle.hitTest(loc)) {
                return handle;
            }
        }
    }


    public drawHandles(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();

        this.createHandles();

        this._handles.forEach(item => {
            item.render(ctx);
        })

    }


    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawHandles(ctx)
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(0, 0, this.width, this.height);

        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/

        let text = `x1=${this.x} y1=${this.y}|x2=${this.x + this.width} y2=${this.y + this.height}|`;
        this.drawText(ctx, text);
    }

    toggleSelected() {
        this._isSelected = !this._isSelected;
    }
}

export class Pallet {
    static lookup = {}
    static afterCreate: Action<foGlyph>;

    static create<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any, func?: Action<T>): T {
        let instance = new type(properties);
        func && func(instance);
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }

    static define<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type();
        this.lookup[instance.myType] = { create: type, defaults: properties };
        return type;
    }

    static makeInstance<T extends foGlyph>(type: string, properties?: any, func?: Action<T>) {
        let { create, defaults } = this.lookup[type];
        let instance = new create(Tools.union(properties, defaults));
        func && func(instance);
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }
}

