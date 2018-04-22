import { Tools } from '../foundry/foTools';

import { iPoint2D, Action } from '../foundry/foInterface';
import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foShape1D, foConnect1D } from "../foundry/shapes/foShape1D.model";

import { foStencilLibrary } from "../foundry/foStencil";
import { foCollection } from "../foundry/foCollection.model";
import { foController, foToggle } from "../foundry/foController";

export { foShape1D, foConnect1D } from "../foundry/shapes/foShape1D.model";
export { foShape2D } from "../foundry/shapes/foShape2D.model";
import { foPage } from "../foundry/shapes/foPage.model";


export let FactoryStencil: foStencilLibrary = new foStencilLibrary().defaultName('Factory');

;

export class pathwayMixin extends foShape1D {
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


FactoryStencil.define('Package', Package, {
    color: 'green',
    opacity: .5,
    width: 50,
    height: 50,
}).onCreation(obj => {
    //obj.color = Tools.randomRGBColor()
    obj.h = Tools.random(0, 2 * Math.PI);
    obj.s = Tools.random(1, 21);
    obj.gap = Tools.random(25, 100);
});

FactoryStencil.define('Station', packageShape, {
    color: 'blue',
    opacity: .5,
    width: 150,
    height: 150,
}).onCreation(obj => {
    //obj.color = Tools.randomRGBColor()
    obj.h = Tools.random(0, 2 * Math.PI);
    obj.s = Tools.random(1, 21);
    obj.gap = Tools.random(25, 100);
});

class factoryController extends foController {
    //toggleRule1: foToggle = new foToggle('group', () => { }, () => { return { active: true } })

    generateGrid(xStart: number = 100, xStep: number = 100, xCount = 5, yStart: number = 100, yStep: number = 100, yCount = 5): any[] {
        let list: any[] = Array<any>()
        for (let i = 0; i < xCount; i++) {
            for (let j = 0; j < yCount; j++) {
                let item = {
                    x: xStart + i * xStep,
                    y: yStart + j * yStep,
                }
                list.push(item);
            }
        }
        return list;
    }

    createStation(page: foPage, count: number = 1): Array<packageShape> {
        let list: Array<packageShape> = new Array<packageShape>();
        let knowledge = FactoryStencil.find('Station');
        for (let i = 0; i < count; i++) {
            let result = knowledge.newInstance().defaultName() as foGlyph2D;
            result.addAsSubcomponent(page).pushTo(list);
        }
        return list;
    }

    createPackage(page: foPage, count: number = 1): Array<packageShape> {
        let list: Array<packageShape> = new Array<packageShape>();
        let knowledge = FactoryStencil.find('Package');
        for (let i = 0; i < count; i++) {
            let result = knowledge.newInstance().defaultName() as foGlyph2D;
            result.addAsSubcomponent(page).pushTo(list);
        }
        return list;
    }

    buildFactory(page: foPage) {
        let grid = this.generateGrid(100, 210, 6, 200, 200, 3);
        let list = this.createStation(page, grid.length);
        let i = 0;
        list.forEach(item => {
            item.easeTween(grid[i++], Tools.random(1.5, 2.5));
        })
    }

    runFactory(page: foPage) {
        let stations = page.selectGlyph(item => Tools.matches(item.myClass, 'Station'));
        let grid = stations.map( item => item.getLocation() )

        let list = this.createPackage(page, 1);

        let i = 0;
        list.forEach(item => {
            item.easeTween(grid[i++], Tools.random(1.5, 2.5));
        })
    }

}

export let factoryBehaviour: factoryController = new factoryController().defaultName('Factory');
//factoryBehaviour.addToggle(factoryBehaviour.toggleRule1)

import { RuntimeType } from '../foundry/foRuntimeType';
RuntimeType.define(Package);

