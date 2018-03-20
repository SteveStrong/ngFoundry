import { Tools } from '../foundry/foTools';

import { iPoint2D } from '../foundry/foInterface';
import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foCollection } from "../foundry/foCollection.model";
import { foController } from "../foundry/foController";

export let BoidStencil: foStencilLibrary = new foStencilLibrary().defaultName('Boids');
export { foShape2D } from "../foundry/shapes/foShape2D.model";


export let globalBoidList: foCollection<boidMixin> = new foCollection<boidMixin>().setName('All Boids');
//http://www.kfish.org/boids/pseudocode.html

class boidController extends foController {
  applyRule1:boolean=false;
  applyRule2:boolean=false;
  applyRule3:boolean=false;

  applyRules(b:boidMixin){
    this.applyRule1 && this.rule1(b);
    this.applyRule2 && this.rule2(b)
    this.applyRule3 && this.rule3(b)
  };

  //Rule 1: Boids try to fly towards the centre of mass of neighbouring boids. 
  rule1(b:boidMixin){

  }

  //Rule 2: Boids try to keep a small distance away from other objects (including other boids). 
  rule2(b:boidMixin){
    
  }

  //Rule 3: Boids try to match velocity with near boids. 
  rule3(b:boidMixin){
    
  }

  doRule1(){
    this.applyRule1 = !this.applyRule1;
  }
  doRule2(){
    this.applyRule2 = !this.applyRule2;
  }
  doRule3(){
    this.applyRule3 = !this.applyRule3;
  }
}

export let boidBehaviour: boidController = new boidController();
boidBehaviour.addCommands("doRule1", "doRule3", "doRule2");

class boidMixin extends foShape2D {

  public v: cPoint2D = new cPoint2D(1, 1);
  public p: cPoint2D = new cPoint2D(0, 0);

  doAnimation = () => {
    boidBehaviour.applyRules(this);

    this.v.sumTo(this.p); 
    this.x = this.p.x;
    this.y = this.p.y;

    if (this.isOffCanvasX) {
      this.v.x = -this.v.x;
    }

    if (this.isOffCanvasY) {
      this.v.y = -this.v.y;
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

  constructor(properties?: any) {
    super(properties);
    globalBoidList.addMember(this);  
  }

  public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
    super.dropAt(x,y,angle);
    this.p = new cPoint2D(this.x, this.y);
    return this;
}

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
  v: new cPoint2D(Tools.randomInt(-7, 7), Tools.randomInt(-7, 7))
});

BoidStencil.define('Boid', Boid, {
  width: 20,
  height: 20,
  v: function() { return new cPoint2D(Tools.randomInt(-7, 7), Tools.randomInt(-7, 7))}
});

BoidStencil.define('Boid+', Boid, {
}).mixin(core);

BoidStencil.define('Boid++', Boid, {
  color: 'green',
  opacity: .5,
  width: 30,
  height: 30,

}).onCreation(obj => {
  obj.color = Tools.randomRGBColor()
  obj.v = new cPoint2D(Tools.randomInt(-7, 7), Tools.randomInt(-7, 7))
});

import { RuntimeType } from '../foundry/foRuntimeType';
RuntimeType.define(Boid);

