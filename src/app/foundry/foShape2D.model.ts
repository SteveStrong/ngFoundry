
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
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
    set angle(value: number) { this._angle = value; }

    public pinX = (): number => { return 1 * this.width / 2; }
    public pinY = (): number => { return 1 * this.height / 2 }
    public rotation = (): number => { return this.angle; }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    public drop(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(angle)) this.angle = angle;
        return this;
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
            angle: this.angle,
            opacity: this.opacity,
            color: this.color,
        }
    }

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

    // public renderHitTest(ctx: CanvasRenderingContext2D) {
    //     let angle = this.rotation() * Math.PI / 180
    //     let cos = Math.cos(angle);
    //     let sin = Math.sin(angle);
    //     let x = -this.pinX();
    //     let y = -this.pinY();

    //     let width = this.width;
    //     let height = this.height;

    //     ctx.save();
    //     ctx.globalAlpha = .3;
    //     ctx.fillStyle = 'gray';
    //     ctx.translate(this.x + x, this.y + y);
    //     ctx.transform(cos, sin, -sin, cos, -x, -y);
    //     ctx.fillRect(-x, -y, width, height);

    //     ctx.strokeStyle = "blue";
    //     ctx.lineWidth = 16;
    //     ctx.beginPath()
    //     ctx.moveTo(x, y);
    //     ctx.lineTo(x + width, y);
    //     ctx.lineTo(x + width, y + height);
    //     ctx.lineTo(x, y + height);
    //     ctx.lineTo(x, y);
    //     ctx.stroke();

    //     ctx.restore();
    // }

    public hitTest = (hit: iPoint, ctx: CanvasRenderingContext2D): boolean => {
        //ctx && this.renderHitTest(ctx);
        return this.localHitTest(hit);
    }


    public getLocation = (): iPoint => {
        let x = this.x - this.pinX();
        let y = this.y - this.pinY();
        return new cPoint(x, y);
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



    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();
        this.drawOrigin(ctx);

        //ctx.globalAlpha = .5;

        let angle = this.rotation() * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        ctx.translate(this.x - this.pinX(), this.y - this.pinY());
        ctx.transform(cos, sin, -sin, cos, this.pinX(), this.pinY());

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
        //this.drawOrigin(ctx);
    }




    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(-this.pinX(), -this.pinY(), this.width, this.height);
        ctx.stroke();
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(-this.pinX(), -this.pinY(), this.width, this.height);

        //this.drawText(ctx, this.myType)
    }

}

export class Stencil {
    static lookup = {}
    static afterCreate: Action<foShape2D>;

    static create<T extends foShape2D>(type: { new(p?: any): T; }, properties?: any): T {
        let instance = new type(properties);
        let { defaults = undefined } = this.lookup[instance.myType] || {};

        defaults && instance.extend(defaults)
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }

    static define<T extends foGlyph>(type: { new(p?: any): T; }, properties?: any) {
        let instance = new type();
        this.lookup[instance.myType] = { create: type, defaults: properties };
        return type;
    }

    static makeInstance<T extends foGlyph>(type: string, properties?: any, func?: Action<T>) {
        if (!this.lookup[type]) return;

        let { create, defaults } = this.lookup[type];
        let spec = Tools.union(properties, defaults);
        let instance = new create(spec);
        func && func(instance);
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }
}

