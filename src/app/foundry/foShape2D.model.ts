
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle } from '../foundry/foHandle'
import { foGlue } from '../foundry/foGlue'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foGlyph } from '../foundry/foGlyph.model'


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape2D extends foGlyph {

    protected _angle: number;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) {
        this.smash();
        this._angle = value;
    }

    get glue(): foCollection<foGlue> { return this._glue; }
    protected _glue: foCollection<foGlue>;

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public rotation = (): number => { return this.angle; }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        let result = super.toJson();
        result.angle = this.angle;
        return result;
    }

    public notifyOnChange(source: any, channel: string, ...args: any[]) {
    }

    notifySource(channel: string, ...args: any[]) {
        this._glue && this._glue.forEach(item => {
            item.mySource().notifyOnChange(item, channel, ...args);
        })
    }

    notifyTarget(channel: string, ...args: any[]) {
        this._glue && this._glue.forEach(item => {
            item.myTarget().notifyOnChange(item, channel, ...args);
        })
    }

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(angle)) this.angle = angle;
        this.notifySource('drop', this.getLocation());
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
            this._matrix.appendTransform(this.x, this.y, 1, 1, this.rotation(), 0, 0, this.pinX(), this.pinY());
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


    public overlapTest = (hit: iShape): boolean => {
        let loc = hit.getLocation();
        let size = hit.getSize(1.0);

        let pos = this.getLocation();
        let width = this.width;
        if (loc.x > pos.x + width) return false;
        if (loc.x + size.width < pos.x) return false;

        let height = this.height;
        if (loc.y > pos.y + height) return false;
        if (loc.y + size.height < pos.y) return false;

        return true;
    }

    protected pinLocation() {
        return {
            x: this.pinX(),
            y: this.pinY()
        }
    }

    public moveHandle(handle: foHandle, loc: iPoint) {
        let pt = handle.localToGlobal(0, 0).subtract(loc.x, loc.y);
        this.growSize(pt.x, pt.y)
        switch (handle.myName) {
            case '0:0':
                break;
            case 'W:0':
                break;
            case 'W:H':
                break;
            case '0:H':
                break;

        }
    }

    createGlue(name: string, target: foShape2D, handle?: string) {
        let glue = this.addGlue(new foGlue({ myName: name }));
        glue.glueTo(target, handle);
        target.addGlue(glue);
        return glue;
    }

    addGlue(glue: foGlue) {
        if (!this._glue) {
            this._glue = new foCollection<foGlue>();
        }
        this._glue.addMember(glue);

        if (!glue.hasParent) {
            glue.myParent = () => { return this; }
        }
        return glue;
    }


    removeGlue(glue: foGlue) {
        if (this._glue) {
            this._glue.removeMember(glue);
            glue.removeParent(this);
        }
        return glue;
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        this.drawOrigin(ctx);
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
        this.drawHandles(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(0, 0, this.width, this.height);
    }

}

export class Stencil {
    static lookup = {}

    static create<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any): T {
        let instance = new type(properties);
        let { defaults = undefined } = this.lookup[instance.myType] || {};

        defaults && instance.extend(defaults);
        instance.initialize();

        return instance;
    }

    static define<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type();
        this.lookup[instance.myType] = { create: type, defaults: properties };
        return instance.myType;
    }

    static extends<T extends foGlyph>(name: string, type: { new(p?: any): T; }, properties?: any) {
        this.lookup[name] = { type: name, create: type, defaults: properties };
        return this.lookup[name]
    }

    static spec<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type();
        let { create, defaults } = this.lookup[instance.myType];
        return defaults;
    }

    static makeInstance<T extends foGlyph>(type: string, properties?: any, func?: Action<T>) {
        if (!this.lookup[type]) return;

        let { create, defaults } = this.lookup[type];
        let spec = Tools.union(properties, defaults);
        let instance = new create(spec);
        func && func(instance);
        return instance;
    }
}

Stencil.define(foShape2D);

