import { Tools } from "../foTools";
import { cPoint2D, cMargin } from "./foGeometry2D";
import { iShape, iPoint2D, iSize, Action } from "../foInterface";

import { foObject } from "../foObject.model";
import { Matrix2D } from "./foMatrix2D";
import { foHandle2D } from "./foHandle2D";
import { foGlue2D } from "./foGlue2D";
import { foCollection } from "../foCollection.model";
import { foGlyph2D } from "./foGlyph2D.model";

import { foShape2D } from "./foShape2D.model";

export class foImage2D extends foShape2D {
  protected _loaded: boolean = false;

  public margin: cMargin;

  protected _image: HTMLImageElement;
  protected _imageURL: string;
  get imageURL(): string {
    return this._imageURL;
  }
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
  public pinX = (): number => {
    return 0.5 * this.width;
  };
  public pinY = (): number => {
    return 0.5 * this.height;
  };

  constructor(
    properties?: any,
    subcomponents?: Array<foGlyph2D>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      background: this.background,
      imageURL: this.imageURL,
      margin: this.margin
    });
  }
  public override(properties?: any) {
    if (properties && properties.margin) {
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

    deep &&
      this._subcomponents.forEach(item => {
        item.render(ctx, deep);
      });
    ctx.restore();
  }

  public drawOutline(ctx: CanvasRenderingContext2D) {
    let width = this.width + ((this.margin && this.margin.width) || 0);
    let height = this.height + ((this.margin && this.margin.height) || 0);

    ctx.beginPath();
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
  };

  public draw = (ctx: CanvasRenderingContext2D): void => {
    let left = (this.margin && this.margin.left) || 0;
    let top = (this.margin && this.margin.top) || 0;

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
  };
}

import { RuntimeType } from "../foRuntimeType";
RuntimeType.define(foImage2D);
