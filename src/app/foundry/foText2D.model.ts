
import { Tools } from '../foundry/foTools'
import { cPoint, cMargin } from "../foundry/foGeometry";
import { iShape, iPoint, iSize, Action } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle } from '../foundry/foHandle'
import { foGlue } from '../foundry/foGlue'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { foShape2D, Stencil } from '../foundry/foShape2D.model'


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

        this.extend({
            text: function () {
                if (this.context && this.context.text) {
                    return this.context.text;
                } if (this.context && Tools.isObject(this.context)) {
                    return JSON.stringify(this.context, undefined, 3);
                }
                return this.context;
            }
        });
    }

    protected toJson(): any {
        let result = super.toJson();
        result.text = this.text;
        return result;
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        ctx.textAlign = this.textAlign || 'center';
        ctx.textBaseline = this.textBaseline || 'middle';

        this.height = (this.fontSize || 12) + ((this.margin && this.margin.height) || 0);
        ctx.font = this.font || this.height + "px Georgia";

        let textMetrics = ctx.measureText(this.text);
        this.width = textMetrics.width + ((this.margin && this.margin.width) || 0);

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
        //this.drawHandles(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {

        if (this.background) {
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.fillStyle = this.color;
        let pinX = this.pinX() + ((this.margin && this.margin.left) || 0);
        let pinY = this.pinX() + ((this.margin && this.margin.top) || 0);


        ctx.fillText(this.text, pinX, pinY);
    }

    drawSample(ctx) {
        ctx.translate(-10, 25);
        ctx.scale(1.2, 0.8);
        ctx.rotate(5 * Math.PI / 180);

        var fillText = "fillText";
        var strokeText = "strokeText";

        ctx.textBaseline = "top";
        ctx.font = "32pt Arial";

        ctx.fillStyle = "orange";  // shadow color
        ctx.fillText(fillText, 22, 22);
        ctx.fillStyle = "red";
        ctx.fillText(fillText, 20, 20);

        ctx.strokeStyle = "blue";
        ctx.strokeText(strokeText, 20, 80);
    }

    //http://tutorials.jenkov.com/html5-canvas/text.html
    /// expand with color, background etc.
    drawTextBG(ctx: CanvasRenderingContext2D, txt: string, font: string, x: number, y: number) {

        ctx.save();

        ctx.font = font;

        /// draw text from top - makes life easier at the moment
        ctx.textBaseline = 'top';

        /// color for background
        ctx.fillStyle = '#f50';

        /// get width of text
        var width = ctx.measureText(txt).width;

        /// draw background rect assuming height of font
        ctx.fillRect(x, y, width, parseInt(font, 10));

        ctx.fillStyle = '#000';

        /// draw text on top
        ctx.fillText(txt, x, y);

        ctx.restore();
    }


    drawMultiLineText(ctx: CanvasRenderingContext2D, text: string) {

        let textMetrics = ctx.measureText(text);

        ctx.textAlign = "left" || "right" || "center" || "start" || "end";

        ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";

        ctx.font = '48px serif';
        ctx.font = "20px Georgia";
        ctx.font = "italic 10pt Courier";
        ctx.font = "bold 10pt Courier";
        ctx.font = "italic bold 10pt Courier";

        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
        let fontsize = 60;
        let array = text.split('|');
        let dx = 10;
        let dy = 20;
        for (var i = 0; i < array.length; i++) {
            ctx.fillText(array[i], dx, dy);
            dy += (fontsize + 4);
        }

    }
}

Stencil.define(foText2D);
