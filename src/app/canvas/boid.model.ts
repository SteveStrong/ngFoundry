import { Tools } from '../foundry/foTools';

import { iPoint2D } from '../foundry/foInterface';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foStencilLibrary } from "../foundry/foStencil";

export let BoidStencil: foStencilLibrary = new foStencilLibrary().defaultName('Boids');
export { foShape2D } from "../foundry/shapes/foShape2D.model";

//http://www.kfish.org/boids/pseudocode.html

class boidMixin extends foShape2D {

  public vx: number;
  public vy: number;

  doAnimation = () => {
    this.x += this.vx;
    this.y += this.vy;

    if (this.isOffCanvasX) {
      this.vx = -this.vx;
    }

    if (this.isOffCanvasY) {
      this.vy = -this.vy;
    }
  };


  get isOffCanvasX(): boolean { // off the right side off the left side off the bottom
    let parent = (<foShape2D>this.myParent());
    let width = parent.width;
    return this.x > width || this.x < 0;
  }

  get isOffCanvasY(): boolean { // off the right side off the left side off the bottom
    let parent = (<foShape2D>this.myParent())
    let height = parent.height;
    return this.y > height || this.y < 0;
  }

}

class BoidShape extends boidMixin {

  //doAnimation = () => { };

  public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    this.doAnimation();
    super.render(ctx, deep);
  }

  public drawSelected = (ctx: CanvasRenderingContext2D): void => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    this.drawOutline(ctx);
    this.drawPin(ctx);
  }

  findObjectUnderPoint(hit: iPoint2D, deep: boolean): foGlyph2D {
    let found: foGlyph2D = this.hitTest(hit) ? this : undefined;
    return found;
  }
}

export class Boid extends BoidShape {

  // constructor(properties?: any) {
  //   super(properties);
  //   this.width = 10;
  //   this.height = 10;
  //   this.color = Tools.randomRGBColor()
  // }

  drawTriangle(ctx: CanvasRenderingContext2D, x1, y1, x2, y2, x3, y3) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }


  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    this.drawTriangle(ctx, 0, this.height, this.width / 2, 0, this.width, this.height);
  }
}

let core = BoidStencil.mixin('core', {
  color: 'blue',
  opacity: .5,
  width: 50,
  height: 50,
  vx: Tools.randomInt(-7, 7),
  vy: Tools.randomInt(-7, 7),
});

BoidStencil.define('Boid', Boid, {
  width: 20,
  height: 20,
  vx: function() { return Tools.randomInt(-7, 7)},
  vy: function() { return Tools.randomInt(-7, 7)},
});

BoidStencil.define('Boid+', Boid, {
}).mixin(core);

BoidStencil.define('Boid++', Boid, {
  color: 'green',
  opacity: .5,
  width: 30,
  height: 30,

}).onCreation( obj => {
  obj.vx = Tools.randomInt(-7, 7);
  obj.vy = Tools.randomInt(-7, 7);
});

import { RuntimeType } from '../foundry/foRuntimeType';
RuntimeType.define(Boid);

