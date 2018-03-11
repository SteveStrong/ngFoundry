
import { Tools } from '../foTools'
import { cMargin } from './foGeometry2D';
import { cPoint2D, cFrame } from './foGeometry2D';

import { foObject } from '../foObject.model'
import { foGlyph2D } from './foGlyph2D.model'

import { foShape2D } from './foShape2D.model'
import { CanvasInput } from './canvasInput'
import { WatchKeys, keycode } from './canvasKeypress'

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

    constructor(properties?: any, subcomponents?: Array<foGlyph2D>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw();
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            text: this.text,
            background: this.background,
            fontSize: this.fontSize,
            margin: this.margin
        });
    }

    get size(): number {
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
}

export class foInputText2D extends foText2D {

    public openEditorxxx = (loc: cPoint2D, e: MouseEvent, keys) => {
        let canvas = document.getElementById('canvasInput');
        let input = new CanvasInput({
            canvas: canvas,
            x: loc.x,
            y: loc.y,
            fontSize: 18,
            fontFamily: 'Arial',
            fontColor: '#212121',
            fontWeight: 'bold',
            width: 300,
            padding: 8,
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 3,
            boxShadow: '1px 1px 0px #fff',
            innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
            placeHolder: 'Enter message here...'
        });
        return input;

    }

    public sendKeys = (e: KeyboardEvent, keys: any) => {
        //alert('got code:' + keys.code);
        if (e.keyCode >= 48 && e.keyCode <= 90) {
            this.text += e.key;
        } else if (e.keyCode == 32) {
            this.text += e.key;
        } else {
            this.processKeys(e, keys)
        }
    }

    processKeys(e: KeyboardEvent, keys: any) {
        switch (e.keyCode) {
            case 8:  //"backspace"
                let len = this.text.length;
                this.text = len ? this.text.substring(0, len - 1) : this.text;
                break;
            default:
                if (e.key.length == 1) {
                    this.text += e.key;
                }
                break;
        }
    }

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
RuntimeType.define(foInputText2D);
