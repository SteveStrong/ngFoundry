
import { foShape2D } from "../foundry/foShape2D.model";


export class brick extends foShape2D {
  constructor(properties?: any) {
    super(properties);
  }
}

export class legoCore extends foShape2D {

  description: string;

  constructor(properties: any={}) {
    super(properties);
    this.description = this.myType
  }
}


export class OneByOne extends legoCore {

  constructor(properties: any={}) {
    properties.size ='1:1';
    super(properties);
  }
}

export class TwoByOne extends legoCore {

  constructor(properties: any={}) {
    properties.size ='2:1';
    super(properties);
  }
}

export class TwoByTwo extends legoCore {

  constructor(properties: any={}) {
    properties.size ='2:2';
    super(properties);
  }
}

export class TwoByFour extends legoCore {

  constructor(properties: any={}) {
    properties.size ='2:4';
    super(properties);
  }
}

export class OneByTen extends legoCore {

  constructor(properties: any={}) {
    properties.size ='1:10';
    super(properties);
  }
}

export class TenByTen extends legoCore {

  constructor(properties: any={}) {
    properties.size ='10:10';
    super(properties);
  }
}


export class wall extends legoCore {

  constructor(properties: any={}) {
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



