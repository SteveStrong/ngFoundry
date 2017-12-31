
import { foShape2D, Stencil } from "../foundry/foShape2D.model";
import { foShape1D } from "../foundry/foShape1D.model";
import { cPoint, cRect } from "../foundry/foGeometry";
import { RuntimeType } from '../foundry/foRuntimeType';


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
RuntimeType.define(TenByTen);

export class ThreeByThreeCircle extends legoCore {

  constructor(properties?: any) {
    super(properties);
    this.size = '3:3';
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






