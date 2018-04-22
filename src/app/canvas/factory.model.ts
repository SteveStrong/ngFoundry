import { Tools } from '../foundry/foTools';

import { iPoint2D, Action } from '../foundry/foInterface';
import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foStencilLibrary } from "../foundry/foStencil";
import { foCollection } from "../foundry/foCollection.model";
import { foController, foToggle } from "../foundry/foController";

export { foShape1D, foConnect1D } from "../foundry/shapes/foShape1D.model";
export { foShape2D } from "../foundry/shapes/foShape2D.model";

export let FactoryStencil: foStencilLibrary = new foStencilLibrary().defaultName('Factory');



class factoryController extends foController {
    toggleRule1: foToggle = new foToggle('group', () => { }, () => { return { active: true } })

}

export let factoryBehaviour: factoryController = new factoryController().defaultName('Factory');
factoryBehaviour.addToggle(factoryBehaviour.toggleRule1);

export class pathwayMixin extends foShape2D {
    doAnimation = () => {
    }
    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        this.doAnimation();
        super.render(ctx, deep);
    }
}

export class packageMixin extends foShape2D {
    doAnimation = () => {
    }
    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        this.doAnimation();
        super.render(ctx, deep);
    }
}



class packageShape extends packageMixin {

    //doAnimation = () => { };

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

export class Package extends packageShape {

    constructor(properties?: any) {
        super(properties);
    }

    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        super.dropAt(x, y, angle);
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

    drawCircle(ctx: CanvasRenderingContext2D, x1, y1, radius: number = 100) {
        ctx.beginPath();
        ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }


    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;

        this.drawSquare(ctx, 0, 0, this.width, this.height);
        this.drawSelected(ctx);
    }
}

let core = FactoryStencil.mixin('core', {
    color: 'blue',
    opacity: .5,
    width: 50,
    height: 50,
    s: Tools.randomInt(7, 11)
  });


  FactoryStencil.define('Package', packageShape, {
    color: 'green',
  }).mixin(core).onCreation(obj => {
    //obj.color = Tools.randomRGBColor()
    obj.h = Tools.random(0, 2 * Math.PI );
    obj.s = Tools.random(1, 21);
    obj.gap = Tools.random(25, 100);
  
  });

import { RuntimeType } from '../foundry/foRuntimeType';
RuntimeType.define(Package);

