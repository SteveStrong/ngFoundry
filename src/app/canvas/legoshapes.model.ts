
import { foShape2D } from "../foundry/foShape2D.model";


export class brick extends foShape2D {
  size: string = '0:0';

  constructor(properties?: any) {
    super(properties);
  }
}

export class legoCore extends foShape2D {

  description: string;
  size: string = '0:0';

  constructor(properties: any = {}) {
    super(properties);
    this.description = this.myType
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

  constructor(properties: any = {}) {
    super(properties);
    this.size = '2:2';
  }
}

export class TwoByFour extends legoCore {

  public pinX = (): number => { return 0 * this.width / 2; }
  public pinY = (): number => { return 0 * this.height / 2 }
  constructor(properties: any = {}) {
    super(properties);
    this.size = '2:4';
  }

  public postDraw = (ctx: CanvasRenderingContext2D): void => { 
    this.drawPin(ctx);
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

  public renderxxx(ctx: CanvasRenderingContext2D, deep: boolean = true) {

    let angle = this.rotation() * Math.PI / 180
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    ctx.save();
    let loc = this.getLocation();

    //ctx.translate(this.x - this.pinX(), this.y - this.pinY());
    ctx.translate(this.x, this.y);
    //ctx.transform(cos, sin, -sin, cos, 0, 0);
    //ctx.transform(cos, sin, -sin, cos, -this.pinX(), -this.pinY());
    ////ctx.translate(0, -this.pinY());
    //ctx.translate(this.x - this.pinX(), this.y - this.pinY());

    this.draw(ctx);
    this.drawPin(ctx);

    deep && this._subcomponents.forEach(item => {
      item.render(ctx, deep);
    });
    ctx.restore();
    this.drawOrigin(ctx);
  }
}

export class Circle extends legoCore {

  constructor(properties: any = {}) {
    super(properties);
    this.size = '1:1';
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {

    ctx.save();
    ctx.fillStyle = 'black';
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
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}


export class wall extends legoCore {

  constructor(properties: any = {}) {
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

export class house extends legoCore {
  description: string = "The Wall Is Solid";

  constructor(properties?: any) {
    super(properties);
  }
}



