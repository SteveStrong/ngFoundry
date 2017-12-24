
import { foShape2D } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { cPoint, cRect } from "../foundry/foGeometry";

export class brick extends foShape2D {
  size: string = '0:0';

  constructor(properties?: any) {
    super(properties);
  }
}

export class Line extends foShape1D {
}

export class legoCore extends foShape2D {

  description: string;
  size: string = '0:0';

  constructor(properties: any = {}) {
    super(properties);
    this.description = this.myType
  }

  doAnimation = () => {};

  public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    this.doAnimation();
    super.render(ctx, deep);
  }

  public postDraw = (ctx: CanvasRenderingContext2D): void => {
    this.drawPin(ctx);
  }

}


export class OneByOne extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '1:1';
  }
}

export class TwoByOne extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '2:1';
  }
}

export class TwoByTwo extends legoCore {

  public pinX = (): number => { return 0 * this.width / 2; }
  public pinY = (): number => { return 0 * this.height / 2 }
  constructor(properties: any = {}) {
    super(properties);
    this.size = '2:2';
  }
}

export class TwoByFour extends legoCore {

  public pinX = (): number => { return 0 * this.width / 2; }
  public pinY = (): number => { return 1 * this.height / 2 }
  constructor(properties: any = {}) {
    super(properties);
    this.size = '2:4';
  }



}

export class OneByTen extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '1:10';
  }
}

export class TenByTen extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '10:10';
  }

}

export class Circle extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '1:1';
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = .8;
    ctx.setLineDash([])
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }
}

export class rotateDemo extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '12:12';
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}




export class house extends legoCore {
  description: string = "The Wall Is Solid";

  constructor(properties?: any) {
    super(properties);
  }
}



