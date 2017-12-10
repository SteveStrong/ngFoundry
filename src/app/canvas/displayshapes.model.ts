import { Tools } from '../foundry/foTools';
import { cPoint } from '../foundry/foGeometry';

import { iObject, iNode, iShape, iPoint, iSize, Action } from '../foundry/foInterface';

import { foDisplayObject } from "../foundry/foDisplayObject.model";

//https://github.com/CreateJS/EaselJS


export class dRectangle extends foDisplayObject {

  constructor(properties?: any) {
    super(properties);
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 20;
    ctx.beginPath()
    ctx.setLineDash([25, 25]);
    ctx.rect(0, 0, this.width, this.height);
    ctx.stroke();
    ctx.restore();
  }

  public hitTest = (hit: iPoint, ctx: CanvasRenderingContext2D): boolean => {
    let loc = this.getLocation();

    ctx.save();
    ctx.globalAlpha = .5;
    ctx.fillRect(loc.x, loc.y, this.width, this.height);
    ctx.restore();

    let width = this.width;
    if (hit.x < loc.x) return false;
    if (hit.x > loc.x + width) return false;

    let height = this.height;
    if (hit.y < loc.y) return false;
    if (hit.y > loc.y + height) return false;

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

    this.preDraw(ctx);
    this.draw(ctx);
    this.postDraw(ctx);
    this.drawPin(ctx);

    deep && this._subcomponents.forEach(item => {
      item.render(ctx, deep);
    });
    ctx.restore();

  }

}

export class Display {
  static lookup = {}
  static afterCreate: Action<foDisplayObject>;

  static create<T extends foDisplayObject>(type: { new(p?: any): T; }, properties?: any): T {
    let instance = new type(properties);
    let { defaults = undefined } = this.lookup[instance.myType] || {};

    defaults && instance.extend(defaults)
    this.afterCreate && this.afterCreate(instance);
    return instance;
  }

  static define<T extends foDisplayObject>(type: { new(p?: any): T; }, properties?: any) {
    let instance = new type();
    this.lookup[instance.myType] = { create: type, defaults: properties };
    return type;
  }

  static makeInstance<T extends foDisplayObject>(type: string, properties?: any, func?: Action<T>) {
    let { create, defaults } = this.lookup[type];
    let spec = Tools.union(properties, defaults);
    let instance = new create(spec);
    func && func(instance);
    this.afterCreate && this.afterCreate(instance);
    return instance;
  }
}





