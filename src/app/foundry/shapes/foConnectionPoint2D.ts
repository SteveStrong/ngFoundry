
import { foObject } from '../foObject.model';
import { foComponent } from '../foComponent.model';

import { foHandle2D } from './foHandle2D';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foConnectionPoint2D extends foHandle2D {

    get color(): string {
        return this._color || 'pink';
    }
    get size(): number { return this._size || 15.0; }


    constructor(properties?: any, subcomponents?: Array<foHandle2D>, parent?: foObject) {
        super(properties, subcomponents, parent);


    }


    // public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    //     ctx.save();

    //     this.updateContext(ctx);

    //     this.preDraw && this.preDraw(ctx);
    //     this.draw(ctx);
    //     this.drawHover && this.drawHover(ctx);
    //     this.postDraw && this.postDraw(ctx);

    //     ctx.restore();
    // }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;

        ctx.fillRect(0, 0, this.size, this.size);
    }

}


