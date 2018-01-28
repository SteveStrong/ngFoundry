import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foShape1D } from "../foundry/shapes/foShape1D.model";
import { cPoint2D, cRect } from '../foundry/shapes/foGeometry2D';
import { foHandle2D } from '../foundry/shapes/foHandle2D';
import { foCollection } from '../foundry/foCollection.model';


export class legoCore extends foShape2D {

  description: string;
  size: string = '0:0';

  constructor(properties?: any) {
    super(properties);
    this.description = this.myType;

    this.override({
      height: function () {
        let size = parseInt(this.size.split(':')[1]);
        return 25 * size;
      },
      width: function () {
        let size = parseInt(this.size.split(':')[0]);
        return 25 * size;
      }
    });

  }

  doAnimation = () => { };

  public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    this.doAnimation();
    super.render(ctx, deep);
  }

  public postDraw = (ctx: CanvasRenderingContext2D): void => {
    this.drawPin(ctx);
  }

}


export class OneByOne extends legoCore {
  constructor(properties?: any) {
    super(properties);
    this.size = '1:1';
  }
}

export class TwoByOne extends legoCore {
  constructor(properties?: any) {
    super(properties);
    this.size = '2:1';
  }
}

export class TwoByTwo extends legoCore {
  public pinX = (): number => { return 0 * this.width / 2; }
  public pinY = (): number => { return 0 * this.height / 2 }
  constructor(properties?: any) {
    super(properties);
    this.size = '2:2';
  }
}

export class TwoByFour extends legoCore {
  public pinX = (): number => { return 0 * this.width / 2; }
  public pinY = (): number => { return 1 * this.height / 2 }
  constructor(properties?: any) {
    super(properties);
    this.size = '2:4';
  }
}

export class OneByTen extends legoCore {
  constructor(properties?: any) {
    super(properties);
    this.size = '1:10';
  }
}

export class TenByTen extends legoCore {
  constructor(properties?: any) {
    super(properties);
    this.size = '10:10';
  }
}

export class ThreeByThreeCircle extends legoCore {

  constructor(properties?: any) {
    super(properties);
    this.size = '3:3';
  }

  public createHandles(): foCollection<foHandle2D> {
    let DEG_TO_RAD = Math.PI / 180;
    let cx = this.width / 2;
    let cy = this.height / 2;
    let w = cx * Math.cos(45 * DEG_TO_RAD);
    let h = cy * Math.cos(45 * DEG_TO_RAD);

    let spec = [
      { x: cx - w, y: cy - h, myName: "0:0" },
      { x: cx + w, y: cy - h, myName: "W:0" },
      { x: cx + w, y: cy + h, myName: "W:H" },
      { x: cx - w, y: cy + h, myName: "0:H" },
    ];

    return this.generateHandles(spec);
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {

    let center = this.pinLocation();
    ctx.save();

    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.restore();
  }

  public drawOutline(ctx: CanvasRenderingContext2D) {
    let center = this.pinLocation();
    ctx.beginPath()
    ctx.setLineDash([15, 5]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }

}






