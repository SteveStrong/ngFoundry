
import { Tools } from '../foTools'
import { cMargin } from './foGeometry2D';


import { foObject } from '../foObject.model'
import { foNode } from '../foNode.model'

import { foShape2D } from './foShape2D.model'


// ctx.textAlign = "left" || "right" || "center" || "start" || "end";

// ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";

// ctx.font = '48px serif';
// ctx.font = "20px Georgia";
// ctx.font = "italic 10pt Courier";
// ctx.font = "bold 10pt Courier";
// ctx.font = "italic bold 10pt Courier";

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foText2D extends foShape2D {
    public text: string;
    public textAlign: string;
    public textBaseline: string;


    public margin: cMargin;
    public fontSize: number;
    public font: string;

    protected _background: string;
    get background(): string {
        return this._background;
    }
    set background(value: string) {
        this._background = value;
    }

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw();
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            text: this.text,
            background:this.background,
            fontSize:this.fontSize,
            margin:this.margin
        });
    }

    get size():number {
        return (this.fontSize || 12);
    }

    updateContext(ctx: CanvasRenderingContext2D) {
        super.updateContext(ctx);

        ctx.textAlign = this.textAlign || 'center';
        ctx.textBaseline = this.textBaseline || 'middle';
        ctx.font = this.font || this.size + "px Georgia";
    };

    setupPreDraw() {

        let preDraw = (ctx: CanvasRenderingContext2D): void => {
            let textMetrics = ctx.measureText(this.text);
            this.width = textMetrics.width + ((this.margin && this.margin.width) || 0);
            this.height = this.size + ((this.margin && this.margin.height) || 0);
            this.createConnectionPoints();
            this.preDraw = undefined;
        };

        this.preDraw = preDraw;
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

    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        this.drawOutline(ctx);
        this.drawHandles(ctx);
        this.drawConnectionPoints(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {

        let left = ((this.margin && this.margin.left) || 0);
        let top = ((this.margin && this.margin.top) || 0);

        ctx.save();
        if (this.background) {
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        ctx.restore();

        ctx.fillStyle = this.color;

        ctx.fillText(this.text, this.pinX() + left, this.pinY() + top);
    }

    // drawSample(ctx) {
    //     ctx.translate(-10, 25);
    //     ctx.scale(1.2, 0.8);
    //     ctx.rotate(5 * Math.PI / 180);

    //     var fillText = "fillText";
    //     var strokeText = "strokeText";

    //     ctx.textBaseline = "top";
    //     ctx.font = "32pt Arial";

    //     ctx.fillStyle = "orange";  // shadow color
    //     ctx.fillText(fillText, 22, 22);
    //     ctx.fillStyle = "red";
    //     ctx.fillText(fillText, 20, 20);

    //     ctx.strokeStyle = "blue";
    //     ctx.strokeText(strokeText, 20, 80);
    // }

    // //http://tutorials.jenkov.com/html5-canvas/text.html
    // /// expand with color, background etc.
    // drawTextBG(ctx: CanvasRenderingContext2D, txt: string, font: string, x: number, y: number) {

    //     ctx.save();

    //     ctx.font = font;

    //     /// draw text from top - makes life easier at the moment
    //     ctx.textBaseline = 'top';

    //     /// color for background
    //     ctx.fillStyle = '#f50';

    //     /// get width of text
    //     var width = ctx.measureText(txt).width;

    //     /// draw background rect assuming height of font
    //     ctx.fillRect(x, y, width, parseInt(font, 10));

    //     ctx.fillStyle = '#000';

    //     /// draw text on top
    //     ctx.fillText(txt, x, y);

    //     ctx.restore();
    // }


    // drawMultiLineText(ctx: CanvasRenderingContext2D, text: string) {

    //     //let textMetrics = ctx.measureText(text);

    //     ctx.textAlign = "left" || "right" || "center" || "start" || "end";

    //     ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";

    //     ctx.font = '48px serif';
    //     ctx.font = "20px Georgia";
    //     ctx.font = "italic 10pt Courier";
    //     ctx.font = "bold 10pt Courier";
    //     ctx.font = "italic bold 10pt Courier";

    //     //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
    //     let fontsize = 60;
    //     let array = text.split('|');
    //     let dx = 10;
    //     let dy = 20;
    //     for (var i = 0; i < array.length; i++) {
    //         ctx.fillText(array[i], dx, dy);
    //         dy += (fontsize + 4);
    //     }

    // }
}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foText2D);
