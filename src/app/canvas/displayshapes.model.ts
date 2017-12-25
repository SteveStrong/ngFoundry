import { Tools } from '../foundry/foTools';
import { cPoint } from '../foundry/foGeometry';

import { iObject, iNode, iShape, iPoint, iSize, Action } from '../foundry/foInterface';

import { foDisplay2D } from "../foundry/foDisplay2D.model";

//https://github.com/CreateJS/EaselJS


export class dRectangle extends foDisplay2D {

  constructor(properties?: any) {
    super(properties);
  }

  doAnimation = () => {};

  public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    this.doAnimation();
    super.render(ctx, deep);
  }

}

export class dGlue extends dRectangle {

  public pinX = (): number => { return 0.5 * this.width; }
  public pinY = (): number => { return 0.5 * this.height; }

  constructor(properties?: any) {
    super(properties);
    this.width = 50;
    this.height = 25;
    this.color = 'green';
    this.opacity = .8;
  }



  public postDraw = (ctx: CanvasRenderingContext2D): void => {
    this.drawPin(ctx);
  }

}

export class Display {
  static lookup = {}
  static afterCreate: Action<foDisplay2D>;

  static create<T extends foDisplay2D>(type: { new(p?: any): T; }, properties?: any): T {
    let instance = new type(properties);
    let { defaults = undefined } = this.lookup[instance.myType] || {};

    defaults && instance.extend(defaults)
    this.afterCreate && this.afterCreate(instance);
    return instance;
  }

  static define<T extends foDisplay2D>(type: { new(p?: any): T; }, properties?: any) {
    let instance = new type();
    this.lookup[instance.myType] = { create: type, defaults: properties };
    return type;
  }

  static makeInstance<T extends foDisplay2D>(type: string, properties?: any, func?: Action<T>) {
    let { create, defaults } = this.lookup[type];
    let spec = Tools.union(properties, defaults);
    let instance = new create(spec);
    func && func(instance);
    this.afterCreate && this.afterCreate(instance);
    return instance;
  }
}





