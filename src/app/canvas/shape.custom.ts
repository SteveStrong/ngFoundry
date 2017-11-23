
import { foShape } from "./shape.model";


export class rawBrick extends foShape {
  constructor(properties?: any) {
    super(properties);
  }
}

export class legoCore extends foShape {

  constructor(properties?: any) {
    super(properties);
  }

  description: string = "legoCore";

}

export class lego extends legoCore {

  constructor(properties?: any) {
    super(properties);
  }

  description: string = "lego"

}


export class door extends lego {

  constructor(properties?: any) {
    super(properties);
  }

  description: string = "The Door Is Red";
}


export class wall extends lego {

  constructor(properties?: any) {
    super(properties);
  }

  description: string = "The Wall Is: ";

  public render(ctx: CanvasRenderingContext2D) {

    // ctx.save();
    // ctx.translate(this.x, this.y);
    // this.drawExtra(ctx);
    // ctx.restore();

    let angle = 15 * Math.PI / 180;

    ctx.save();
    //ctx.rotate(angle)
    //ctx.translate(30, 55);
    ctx.translate(this.x, this.y);
    super.render(ctx);
    ctx.restore();
  }

  public drawExtra = (ctx: CanvasRenderingContext2D): void => {

    ctx.save();
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.globalAlpha = .8;
    ctx.fillRect(0, 0, 100, 150);

    ctx.setLineDash([])
    ctx.beginPath();
    ctx.ellipse(100, 100, 50, 75, 45 * Math.PI / 180, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([5, 5])
    ctx.moveTo(0, 200);
    ctx.lineTo(200, 0);
    ctx.stroke();

    ctx.restore();
  }

}

export class house extends lego {
  description: string = "The Wall Is Solid";

  constructor(properties?: any) {
    super(properties);
  }
}


export class stencil {
  static create<T extends foShape>(type: { new(p?: any): T; }, properties?: any): T {
    let instance = new type(properties);
    return instance;
  }
}
