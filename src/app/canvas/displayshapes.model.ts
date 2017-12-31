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


