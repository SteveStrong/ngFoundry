
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
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

    public drop(params: any) {
        this.override(params);
        return this;
    }

    public hitTest = (hit: iPoint): boolean => {
        let loc = this.getLocation();

        let width = this.width;
        if (hit.x < loc.x) return false;
        if (hit.x > loc.x + width) return false;

        let height = this.height;
        if (hit.y < loc.y) return false;
        if (hit.y > loc.y + height) return false;

        return true;
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


    public drawPin(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();

        ctx.arc(0, 0, 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'pink';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.restore();
    }



    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();
        this.drawOrigin(ctx);

        ctx.globalAlpha = .5;

        let angle =  this.rotation() * Math.PI / 180
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        this.drawOriginX(ctx);

    
        ctx.translate(this.x - this.pinX(), this.y - this.pinY());
        

        this.opacity = .9;

        ctx.transform(cos, sin, -sin, cos, this.pinX(), this.pinY());

        this.draw(ctx);
        this.drawPin(ctx);

        //ctx.fillStyle = "red";
        //ctx.fillRect(-this.pinX(), -this.pinY(), this.width, this.height);
        //ctx.rect(-pinX, -pinY, this.width, this.height);



        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
        this.drawOrigin(ctx);
    }


    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    public drawOutline(ctx: CanvasRenderingContext2D){
        let x = -this.pinX();
        let y = -this.pinY();
        let width = this.width;
        let height = this.height;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(x, y, width, height);
        ctx.stroke();
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {

        let x = -this.pinX();
        let y = -this.pinY();
        let width = this.width;
        let height = this.height;

        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(x, y, width, height);

        this.drawText(ctx, this.myType)

        this.isSelected && this.drawSelected(ctx);
    }

}

export class Stencil {
    static afterCreate: Action<foShape2D>;
    static create<T extends foShape2D>(type: { new(p?: any): T; }, properties?: any): T {
        let instance = new type(properties);
        this.afterCreate && this.afterCreate(instance);
        return instance;
    }
}

