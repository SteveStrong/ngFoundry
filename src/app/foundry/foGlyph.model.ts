
import { Tools } from './foTools';
import { cPoint, cFrame, cRect } from './foGeometry';
import { Matrix2D } from './foMatrix2D';
import { TweenLite, TweenMax, Back, Power0, Bounce } from "gsap";


import { iObject, iNode, iShape, iPoint, iSize, iRect, iFrame, Action } from './foInterface';

import { foHandle } from './foHandle';
import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foConcept } from './foConcept.model';
import { foComponent } from './foComponent.model';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlyph extends foNode implements iShape {

    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;

    protected _isSelected: boolean = false;
    get isSelected(): boolean { return this._isSelected; }
    set isSelected(value: boolean) { this._isSelected = value; }

    protected _visible: boolean = true;
    get visible(): boolean { return this._visible; }
    set visible(value: boolean) { this._visible = value; }

    public get isVisible() {
        return !!(this.visible && this.opacity > 0);
    };



    protected _subcomponents: foCollection<foGlyph>;
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;
    protected _opacity: number;
    protected _color: string;

    public context: any;

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

    get handles(): foCollection<foHandle> { return this._handles || this.createHandles(); }
    protected _handles: foCollection<foHandle>;

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

    private _layout: () => void;
    public setLayout(func: () => void) {
        this._layout = func;
        return this;
    };
    public doLayout(deep: boolean = true) {
        if (deep) {
            this.nodes.forEach(item => item.doLayout());
        }

        this._layout && this.wait(1000, this._layout);
        return this;
    };


    private _boundry: cFrame = new cFrame(this);
    get boundryFrame(): cFrame {
        let mtx = this.getGlobalMatrix();
        //this is a buffer so we create less garbage
        let pt = this._boundry.point;
        this._boundry.init(mtx.transformPoint(0, 0, pt))
        this._boundry.minmax(mtx.transformPoint(0, this.height, pt));
        this._boundry.minmax(mtx.transformPoint(this.width, 0, pt));
        this._boundry.minmax(mtx.transformPoint(this.width, this.height, pt));

        this.nodes.forEach(item => {
            this._boundry.merge(item.boundryFrame);
        });
        return this._boundry;
    }

    public drawBoundry(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.setLineDash([5, 5]);
        this.boundryFrame.draw(ctx, false);
        ctx.stroke();
    }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    set(x: number, y: number, width: number, height: number): iRect {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    contains(x: number, y: number): boolean {
        return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
    }

    localContains(x: number, y: number): boolean {
        return 0 <= x && x <= this.width && 0 <= y && y <= this.height;
    }

    protected toJson(): any {
        return {
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

    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        return this;
    }

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        return this;
    }

    get nodes(): foCollection<foGlyph> {
        return this._subcomponents;
    }

    public easeTo(x: number, y: number, time: number = .5, ease: any = Back.ease ) {

        TweenLite.to(this, time, {
            x: x,
            y: y,
            ease: ease
        }).eventCallback("onUpdate", () => {
            this.drop();
        }).eventCallback("onComplete", () => {
            this.drop(x, y);
        });
        return this;
    }

    public easeTween(to: any, time: number = .5, ease: any = Back.ease) {
        let from = Tools.union(to, { ease: ease });

        TweenLite.to(this, time, from).eventCallback("onComplete", () => this.override(to));
        return this;
    }

    public moveTo(loc: iPoint, offset?: iPoint) {
        let x = loc.x + (offset ? offset.x : 0);
        let y = loc.y + (offset ? offset.y : 0);
        return this.drop(x, y);
    }

    public moveBy(loc: iPoint, offset?: iPoint) {
        let x = this.x + loc.x + (offset ? offset.x : 0);
        let y = this.y + loc.y + (offset ? offset.y : 0);
        return this.drop(x, y);
    }

    updateContext(ctx: CanvasRenderingContext2D) {
        let mtx = this.getMatrix();
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
        ctx.globalAlpha *= this.opacity;
    };

    getGlobalMatrix() {
        let mtx = new Matrix2D(this.getMatrix());
        let parent = this.myParent && <foGlyph>this.myParent()
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
        return mtx.transformPoint(x, y, pt);
    };

    localToGlobalPoint(pt: cPoint): cPoint {
        let mtx = this.getGlobalMatrix();
        return mtx.transformPoint(pt.x, pt.y, pt);
    };

    globalToLocal(x: number, y: number, pt?: cPoint): cPoint {
        let inv = this.getGlobalMatrix().invertCopy();
        return inv.transformPoint(x, y, pt);
    };

    globalToLocalPoint(pt: cPoint): cPoint {
        let inv = this.getGlobalMatrix().invertCopy();
        return inv.transformPoint(pt.x, pt.y, pt);
    };

    globalToLocalFrame(x1: number, y1: number, x2: number, y2: number, frame?: cFrame): cFrame {
        frame = frame || new cFrame();
        let inv = this.getGlobalMatrix().invertCopy();

        frame.init(inv.transformPoint(x1, y1, frame.point));
        frame.minmax(inv.transformPoint(x1, y2, frame.point));
        frame.minmax(inv.transformPoint(x2, y1, frame.point));
        frame.minmax(inv.transformPoint(x2, y2, frame.point))
        return frame;
    };

    localToLocal(x: number, y: number, target: foGlyph, pt?: cPoint): cPoint {
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
    public setLocation = (loc?: iPoint) => {
        this.x = loc ? loc.x : 0;
        this.y = loc ? loc.y : 0;
    }


    // public getSize = (scale: number = 1): iSize => {
    //     //structual type
    //     return {
    //         width: this.width * scale,
    //         height: this.height * scale
    //     }
    // }

    // public scaleSize = (scale: number): iSize => {
    //     this.x -= (this.width * (scale - 1)) / 2.0;
    //     this.y -= (this.height * (scale - 1)) / 2.0;
    //     this.width *= scale;
    //     this.height *= scale;
    //     return this.getSize();
    // }

    // public growSize = (dx: number, dy: number): iSize => {
    //     try {
    //         this.width += dx;
    //         this.height += dy;
    //     } catch (ex) {
    //     }
    //     return this.getSize();
    // }

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
        this._handles && this._handles.forEach(item => item.color = 'black')
        deep && this.Subcomponents.forEach(item => {
            (<foGlyph>item).unSelect(deep);
        })
    }

    findObjectUnderPoint(hit: iPoint, deep: boolean, ctx: CanvasRenderingContext2D): foGlyph {
        let found: foGlyph = this.hitTest(hit, ctx) ? this : undefined;

        if (deep) {
            let child = this.findChildObjectUnderPoint(hit, ctx);
            found = child ? child : found;
        }
        return found;
    }

    protected findChildObjectUnderPoint(hit: iPoint, ctx: CanvasRenderingContext2D): foGlyph {
        let children = this.nodes;
        for (let i: number = 0; i < children.length; i++) {
            let child: foGlyph = children.getMember(i);
            let found = child.findChildObjectUnderPoint(hit, ctx);
            if (found) return found;
        }
        if (this.hitTest(hit, ctx)) {
            return this;
        }
    }



    findObjectUnderFrame(source: foGlyph, hit: iFrame, deep: boolean, ctx: CanvasRenderingContext2D): foGlyph {
        let found: foGlyph = this.overlapTest(hit, ctx) ? this : undefined;

        if (deep) {
            let child = this.findChildObjectUnderFrame(source, hit, ctx);
            found = child ? child : found;
        }
        return found;
    }

    protected findChildObjectUnderFrame(source: foGlyph, hit: iFrame, ctx: CanvasRenderingContext2D): foGlyph {
        let children = this.nodes;
        for (let i: number = 0; i < children.length; i++) {
            let child: foGlyph = children.getMember(i);
            if (source.hasAncestor(child)) continue;
            let found = child.findChildObjectUnderFrame(source, hit, ctx);
            if (found) return found;

        }
        if (this.overlapTest(hit, ctx)) {
            return this;
        }
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



    public overlapTest = (hit: iFrame, ctx: CanvasRenderingContext2D): boolean => {
        let frame = this.globalToLocalFrame(hit.x1, hit.y1, hit.x2, hit.y2);

        if (this.localContains(frame.x1, frame.y1)) return true;
        if (this.localContains(frame.x1, frame.y2)) return true;
        if (this.localContains(frame.x2, frame.y1)) return true;
        if (this.localContains(frame.x2, frame.y2)) return true;
        return false;
    }

    public pinLocation() {
        return {
            x: 0,
            y: 0,
        }
    }

    public afterRender = (ctx: CanvasRenderingContext2D, deep: boolean = true) => {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'pink';
        this.drawBoundry(ctx);
        ctx.restore();

        deep && this.nodes.forEach(item => {
            item.afterRender(ctx, deep);
        });
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



    protected generateHandles(spec: any): foCollection<foHandle> {

        if (!this._handles) {
            this._handles = new foCollection<foHandle>()
            spec.forEach(item => {
                let handle = new foHandle(item, undefined, this);
                this._handles.addMember(handle);
            });
        } else {
            let i = 0;
            spec.forEach(item => {
                let handle = this._handles.getChildAt(i++)
                handle.override(item);
            });
        }
        return this._handles;
    }

    public createHandles(): foCollection<foHandle> {

        let spec = [
            { x: 0, y: 0, myName: "0:0" },
            { x: this.width, y: 0, myName: "W:0" },
            { x: this.width, y: this.height, myName: "W:H" },
            { x: 0, y: this.height, myName: "0:H" },
        ];

        return this.generateHandles(spec);
    }


    public findHandle(loc: cPoint, e): foHandle {
        if (!this._handles) return;

        for (var i: number = 0; i < this.handles.length; i++) {
            let handle: foHandle = this.handles.getChildAt(i);
            if (handle.hitTest(loc)) {
                return handle;
            }
        }
    }

    public moveHandle(handle: foHandle, loc: iPoint) {
    }


    public drawHandles(ctx: CanvasRenderingContext2D) {
        this.handles.forEach(item => {
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

    layoutSubcomponentsVertical(resize: boolean = true, space: number = 0) {
        let loc = this.getLocation();
        let self = this;

        if (resize) {
            self.height = self.width = 0;
            loc.x = loc.y = 0;
        } else {
            loc = this.nodes.first().getLocation();
        }

        this.nodes.forEach(item => {
            item.setLocation(loc);
        });

        this.nodes.forEach(item => {
            let { x: pinX, y: pinY } = item.pinLocation();
            loc.x = resize ? pinX : loc.x;
            loc.y += pinY;
            item.easeTo(loc.x, loc.y);
            loc.y += (space + item.height) - pinY;

            if (resize) {
                self.width = Math.max(self.width, item.width);
                self.height = loc.y;
            }
        });
        //self.drop(x, y);
        return this;
    }

    layoutSubcomponentsHorizontal(resize: boolean = true, space: number = 0) {
        let loc = this.getLocation();
        let self = this;

        if (resize) {
            self.height = self.width = 0;
            loc.x = loc.y = 0;
        } else {
            loc = this.nodes.first().getLocation();
        }

        this.nodes.forEach(item => {
            item.setLocation(loc);
        });

        this.nodes.forEach(item => {
            let { x: pinX, y: pinY } = item.pinLocation();
            loc.x += pinX;
            loc.y = resize ? pinY : loc.y;
            item.easeTo(loc.x, loc.y);
            loc.x += (space + item.width) - pinX;

            if (resize) {
                self.width = loc.x;
                self.height = Math.max(self.height, item.height);
            }
        });
        //self.drop(x, y);
        return this;
    }

    layoutMarginRight(resize: boolean = false, space: number = 0) {
        let loc = this.getLocation();
        let self = this;

        loc.x = (space + this.width);
        loc.y = 0;

        this.nodes.forEach(item => {
            let { x: pinX, y: pinY } = item.pinLocation();
            loc.x += pinX;
            item.easeTo(loc.x, loc.y + pinY);
            loc.x += (space + item.width) - pinX;

            if (resize) {
                self.width = loc.x;
                self.height = Math.max(self.height, item.height);
            }
        });
        return this;
    }

    layoutMarginTop(resize: boolean = false, space: number = 0) {
        let loc = this.getLocation();
        let self = this;

        loc.x = 10;
        loc.y = (space + this.height);

        this.nodes.forEach(item => {
            let { x: pinX, y: pinY } = item.pinLocation();
            loc.y += pinY;
            item.easeTo(loc.x + pinX, loc.y);
            loc.y += (space + item.height) - pinY;

            if (resize) {
                self.width = Math.max(self.width, item.width);
                self.height = loc.y;
            }
        });
        return this;
    }
}

export class Pallet {
    static lookup = {}

    static create<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any, func?: Action<T>): T {
        let instance = new type(properties);
        func && func(instance);
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
        return instance;
    }
}

Pallet.define(foGlyph);

