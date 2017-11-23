
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
export class foShape2D extends foGlyph  {


    public pinX = (): number => { return this.width / 2; }
    public pinY = (): number => { return this.height / 2 }
    public angle = (): number => { return 0; }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myGuid;
    }

    get asJson() {
        return {
            myGuid: this.myGuid,
            x: this.x,
            y: this.y
        }
    }

    public hitTest = (hit: iPoint): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        if (hit.x < x) return false;
        if (hit.x > x + width) return false;
        if (hit.y < y) return false;
        if (hit.y > y + height) return false;
        return true;
    }

    public overlapTest = (hit: iShape): boolean => {
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
        //structual type
        return {
            x: this.x,
            y: this.y
        }
    }

    public getSize = (scale: number = 1): iSize => {
        //structual type
        return {
            width: this.width * scale,
            height: this.height * scale
        }
    }

    public scaleSize = (scale: number): iSize => {
        //structual type
        this.x -= (this.width * (scale - 1)) / 2.0;
        this.y -= (this.height * (scale - 1)) / 2.0;
        this.width *= scale;
        this.height *= scale;
        return this.getSize(1.0);
    }

    public doMove(loc: iPoint, offset?: iPoint): iPoint {
        this.x = loc.x + (offset ? offset.x : 0);
        this.y = loc.y + (offset ? offset.y : 0);

        // this._subcomponents.forEach(item => {
        //     item.doMove(loc, offset);
        // });

        //structual type
        return {
            x: this.x,
            y: this.y
        }
    }

    public setColor(color: string): string {
        this.color = color;
        return this.color;
    };

    public setOpacity(opacity: number): number {
        this.opacity = opacity;
        return this.opacity;
    };

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {

        this.draw(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
    }


    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => { }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(x, y, width, height);

        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
        let fontsize = 20;
        ctx.font = `${fontsize}px Calibri`;
        ctx.fillStyle = 'blue';

        // let text = `x1=${x} y1=${y}|x2=${x+width} y2=${y+height}|`;
        // let array = text.split('|');
        // let dx = x + 10;
        // let dy = y + 20;
        // for (var i = 0; i < array.length; i++) {
        //     ctx.fillText(array[i], dx, dy);
        //     dy += (fontsize + 4);
        //  }

        if (this.isSelected) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.beginPath()
            ctx.rect(x, y, width, height);
            ctx.stroke();
        }

        ctx.restore();
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

