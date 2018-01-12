import { Tools } from '../foundry/foTools';


import { foShape2D } from "../foundry/foShape2D.model";
import { foStencilLibrary } from "../foundry/foStencil";

export let ParticleStencil: foStencilLibrary = new foStencilLibrary().defaultName();
export { foShape2D } from "../foundry/foShape2D.model";

export class particle extends foShape2D {

  public vx: number;
  public vy: number;
  public gravity: number = 0.02;

  constructor(properties?: any) {
    super(properties);
    this.width = 10;
    this.height = 10;
    this.color = Tools.randomRGBColor()
  }

  doAnimation = () => {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;


    if (this.isOffCanvasX || this.isOffCanvasY) {
      // If any of the above conditions are met then we need to re-position the particles on the base :)
      this.doReset();
    }
  };

  public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
    this.doAnimation();

    ctx.save();
    this.updateContext(ctx);

    this.draw(ctx);

    ctx.restore();
  }

  public drawRect = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    this.angle += 1;
    this.angle = this.angle % 360;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  public drawCircle = (ctx: CanvasRenderingContext2D): void => {

    let center = this.pinLocation();
    ctx.beginPath();
    ctx.arc(center.x, center.y, this.width / 2, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
  }

  doReset() {
    let parent = (<foShape2D>this.myParent())
    this.vx = Math.random() * 4 - 2;  // Random Initial Velocities
    this.vy = Math.random() * -4 - 2; // vy should be negative initially then only will it move upwards first and then later come downwards when our gravity is added to it.
    this.x = parent.width / 2;
    this.y = parent.height;
    this.draw = Math.random() > .5 ? this.drawCircle : this.drawRect;
    return this;
  }

  get isOffCanvasX(): boolean { // off the right side off the left side off the bottom
    let parent = (<foShape2D>this.myParent())
    let width = parent.width;
    return this.x > width || this.x < 0;
  }

  get isOffCanvasY(): boolean { // off the right side off the left side off the bottom
    let parent = (<foShape2D>this.myParent())
    return this.y > parent.height || this.y < 0;
  }

}


export class particleEngine extends foShape2D {
  particleCount: number;

  constructor(properties?: any) {
    super(properties);
    this.nodes.isHidden = true;
    this.nodes.isSelectable = false;
  }

  doStart() {
    var particleType = ParticleStencil.define('particle', particle);
    let count = this.particleCount || 100;
    for (var i = 0; i < count; i++) {
      particleType.newInstance()
        .addAsSubcomponent(this)
        .doReset();
    }
  }

  doStop() {
    this.nodes.clearAll();
  }

  doRotate() {
    this.angle += 30;
  }
}

ParticleStencil.define<foShape2D>('engine', particleEngine, {
  color: 'white',
  particleCount: 100,
  opacity: .1,
  width: 700,
  height: 700,
}).addCommands("doStart", "doStop", "doRotate");


import { RuntimeType } from '../foundry/foRuntimeType';
RuntimeType.define(particleEngine);

