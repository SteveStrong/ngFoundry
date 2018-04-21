import { Tools } from '../foundry/foTools';

import { iPoint2D, Action } from '../foundry/foInterface';
import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foCollection } from "../foundry/foCollection.model";
import { foController, foToggle } from "../foundry/foController";

export let BoidStencil: foStencilLibrary = new foStencilLibrary().defaultName('Boids');
export { foShape2D } from "../foundry/shapes/foShape2D.model";



export let globalBoidList: foCollection<boidMixin> = new foCollection<boidMixin>().setName('All Boids');
//http://www.kfish.org/boids/pseudocode.html

class boidController extends foController {
  applyRule1: boolean = false;
  applyRule2: boolean = false;
  applyRule3: boolean = false;

  applyRules(boid: boidMixin, func:Action<cPoint2D>) {
    let v = new cPoint2D();
    if (this.applyRule1) {
      this.rule1(boid).sumTo(v);
    }

    if (this.applyRule2) {
      this.rule2(boid).sumTo(v);
    }

    if (this.applyRule3) {
      this.rule3(boid).sumTo(v);
    }
    if ( this.applyRule1 || this.applyRule2 || this.applyRule3) {
      func(v);
    }
  };

  ruleCenter(boid: boidMixin): cPoint2D {
    //center of mass sum up all the locations for all the others


    if (globalBoidList.length <= 1) {
      return boid.p;
    }

    let count = 0;
    let center = new cPoint2D();
    globalBoidList.forEach(item => {
      if (item.myIndex > 1) {
        item.p.sumTo(center);
        count++;
      }
    })

    if (count) {
      let g = 1.0 / count;
      center.scale(g);
    }
    return center;
  }


  //Rule 1: Boids try to fly towards the centre of mass of neighbouring boids. 
  rule1(boid: boidMixin): cPoint2D {
    //center of mass sum up all the locations for all the others

    let count = 0;
    let center = new cPoint2D();

    globalBoidList.forEach(item => {
      if (item != boid || item.myIndex > 1) {
        item.p.sumTo(center);
        count++;
      }
    })

    if (count) {
      let g = 1.0 / count;
      center.scale(g);
      let delta = boid.p.deltaBetween(center)
      delta.scale(-0.1);
      return delta;
    }
    return center;

  }

  //Rule 2: Boids try to keep a small distance away from other objects (including other boids). 
  rule2(boid: boidMixin): cPoint2D {
    let center = new cPoint2D();
    return center;
  }

  //Rule 3: Boids try to match velocity with near boids. 
  rule3(boid: boidMixin): cPoint2D {
    let center = new cPoint2D();
    return center;
  }


  toggleRule1: foToggle = new foToggle('Rule 1', () => { this.applyRule1 = !this.applyRule1 }, () => { return { active: this.applyRule1 } })
  toggleRule2: foToggle = new foToggle('Rule 2', () => { this.applyRule2 = !this.applyRule2 }, () => { return { active: this.applyRule2 } })
  toggleRule3: foToggle = new foToggle('Rule 3', () => { this.applyRule3 = !this.applyRule3 }, () => { return { active: this.applyRule3 } })
}

export let boidBehaviour: boidController = new boidController();
boidBehaviour.addToggle(boidBehaviour.toggleRule1, boidBehaviour.toggleRule2, boidBehaviour.toggleRule3);

export class boidMixin extends foShape2D {
  myIndex: number;
  public s: number = 0;
  public h: number = 0;
  public p: cPoint2D = new cPoint2D(0, 0);

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      p: this.p,
      h: this.h,
      s: this.s,
    });
  }

  get velosity() {
    let x = this.s * Math.cos(this.h)
    let y = this.s * Math.sin(this.h)
    return new cPoint2D(x,y);
  }

  doAnimation = () => {
    if (this.myIndex > 1) {
     
      let v = this.velosity;
      let s = v.mag();
      boidBehaviour.applyRules(this, dv => {
          v = v.sum(dv).normal().scale(s);
      });


      v.sumTo(this.p);

      this.s = v.mag();
      this.h = v.atan();
    } else {
      boidBehaviour.ruleCenter(this).setTo(this.p);
    }
    this.x = this.p.x;
    this.y = this.p.y;
    this.angle = this.h * foGlyph.RAD_TO_DEG;



    if (this.isOffCanvasX) {
      let x = Math.cos(this.h)
      let y = Math.sin(this.h)
      this.h = Math.atan2(y, -x)
    }

    if (this.isOffCanvasY) {
      let x = Math.cos(this.h)
      let y = Math.sin(this.h)
      this.h = Math.atan2(-y, x)
    }
  };


  get isOffCanvasX(): boolean { // off the right side off the left side off the bottom
    let parent = this.myParent && this.myParent() as foShape2D;
    if (parent) {
      let width = parent.width;
      return this.x > width || this.x < 0;
    }
  }

  get isOffCanvasY(): boolean { // off the right side off the left side off the bottom
    let parent = this.myParent && this.myParent() as foShape2D;
    if (parent) {
      let height = parent.height;
      return this.y > height || this.y < 0;
    }
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
    this.myIndex = globalBoidList.length;
  }

  public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
    super.dropAt(x, y, angle);
    this.p = new cPoint2D(x, y);
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

  drawSquare(ctx: CanvasRenderingContext2D, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    ctx.fill();
  }


  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity;
    if (this.myIndex == 1) {
      this.drawSquare(ctx, 0, 0, this.width, this.height);
      this.drawSelected(ctx);
    } else {
      this.drawTriangle(ctx, 0, this.height, this.width, this.height/2, 0, 0);
    }
  }
}

let core = BoidStencil.mixin('core', {
  color: 'blue',
  opacity: .5,
  width: 50,
  height: 50,
  s: Tools.randomInt(7, 11)
});

BoidStencil.define('Boid', Boid, {
  width: 20,
  height: 20,
  h: function () { return Tools.random(0, Math.PI / 2) },
  s: function () { return Tools.randomInt(1, 21) }
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
  obj.h = Tools.random(0, 2 * Math.PI );
  obj.s = Tools.randomInt(1, 21)


});



import { RuntimeType } from '../foundry/foRuntimeType';
import { foGlyph } from '../foundry/foGlyph.model';
RuntimeType.define(Boid);

