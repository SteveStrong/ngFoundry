
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


export class foImage extends foShape2D {
    protected _loaded: boolean = false;

    public margin: cMargin;

    protected _image: HTMLImageElement;
    protected _imageURL: string;
    get imageURL(): string { return this._imageURL; }
    set imageURL(value: string) {
        this._loaded = false;

        this._imageURL = value;
        this._image = new Image();
        this._image.onload = () => {
            this._loaded = true;
        };
        this._image.src = this._imageURL;

    }
    protected _background: string;
    get background(): string {
        return this._background;
    }
    set background(value: string) {
        this._background = value;
    }

    //"http://backyardnaturalist.ca/wp-content/uploads/2011/06/goldfinch-feeder.jpg";
    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        let result = super.toJson();
        result.background = this.background;
        result.imageURL = this.imageURL;
        result.margin = this.margin;
        return result;
    }
    public override(properties?: any) {
        if ( properties && properties.margin ) {
            let m = properties.margin;
            properties.margin = new cMargin(m.left, m.top, m.right, m.bottom);
        }
        return super.override(properties);
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
        let width = this.width + ((this.margin && this.margin.width) || 0);
        let height = this.height + ((this.margin && this.margin.height) || 0);

        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, width, height);
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
        let left = ((this.margin && this.margin.left) || 0);
        let top = ((this.margin && this.margin.top) || 0);

        ctx.save();
        if (this.background) {
            let width = this.width + ((this.margin && this.margin.width) || 0);
            let height = this.height + ((this.margin && this.margin.height) || 0);

            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();

        if (this._loaded) {
            ctx.drawImage(this._image, left, top, this.width, this.height);
        }
    }

}

Stencil.define(foImage);
import { RuntimeType } from './foRuntimeType';
RuntimeType.model(foImage);
