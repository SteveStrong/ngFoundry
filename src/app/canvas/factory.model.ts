import { Tools } from '../foundry/foTools';

import { iPoint2D, Action } from '../foundry/foInterface';
import { cPoint2D } from '../foundry/shapes/foGeometry2D';
import { foGlyph2D } from '../foundry/shapes/foGlyph2D.model';

import { foShape2D } from '../foundry/shapes/foShape2D.model';
import { foShape1D } from '../foundry/shapes/foShape1D.model';

import { foStencilLibrary } from '../foundry/foStencil';
import { foCollection } from '../foundry/foCollection.model';
import { foController, foToggle } from '../foundry/foController';
import { foPage } from '../foundry/shapes/foPage.model';

import { foInstance } from '../foundry/foInstance.model';

export { foShape1D, foConnect1D } from '../foundry/shapes/foShape1D.model';
export { foShape2D } from '../foundry/shapes/foShape2D.model';


export let FactoryStencil: foStencilLibrary = new foStencilLibrary().defaultName('Factory');

export class PathwayMixin extends foShape1D {
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
    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    findObjectUnderPoint(hit: iPoint2D, deep: boolean): foGlyph2D {
        const found: foGlyph2D = this.hitTest(hit) ? this : undefined;
        return found;
    }
}

export class stationMixin extends foShape2D {
    doAnimation = () => {
    }
    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        this.doAnimation();
        super.render(ctx, deep);
    }
    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawPin(ctx);
    }

    findObjectUnderPoint(hit: iPoint2D, deep: boolean): foGlyph2D {
        const found: foGlyph2D = this.hitTest(hit) ? this : undefined;
        return found;
    }
}



export class Package extends packageMixin {
    stations: foCollection<Station>;
    currentStation: Station;

    constructor(properties?: any) {
        super(properties);
    }

    doGoToNextStation() {
        this.currentStation  = this.stations.members.shift();
        if ( this.currentStation) {
            const loc = this.currentStation.getLocation();
            this.easeTween(loc, Tools.random(0.5, 2.5));
        } else {
            this.easeTween({x: 0, y: 0}, Tools.random(0.5, 2.5));
            this.color = 'red';
        }
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

export class Station extends stationMixin {

    constructor(properties?: any) {
        super(properties);
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
        this.drawCircle(ctx, this.pinX(), this.pinY(), this.width / 2);

    }
}


export class Environment extends stationMixin {

    constructor(properties?: any) {
        super(properties);
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
        this.drawCircle(ctx, this.pinX(), this.pinY(), this.width / 2);

    }
}


FactoryStencil.define('Package', Package, {
    color: 'green',
    opacity: .5,
    width: 50,
    height: 50
}).onCreation(obj => {
});

FactoryStencil.define('Station', Station, {
    color: 'blue',
    opacity: .5,
    width: 150,
    height: 150,
}).onCreation(obj => {
});

FactoryStencil.define('Environment', Environment, {
    color: 'orange',
    opacity: .5,
    width: 100,
    height: 100,
}).onCreation(obj => {
});

class factoryController extends foController {
    // toggleRule1: foToggle = new foToggle('group', () => { }, () => { return { active: true } })

    generateGrid(xStart: number = 100, xStep: number = 100, xCount = 5, yStart: number = 100, yStep: number = 100, yCount = 5): any[] {
        const list: any[] = Array<any>();
        for (let i = 0; i < xCount; i++) {
            for (let j = 0; j < yCount; j++) {
                const item = {
                    x: xStart + i * xStep,
                    y: yStart + j * yStep,
                };
                list.push(item);
            }
        }
        return list;
    }

    createStation(page: foPage, count: number = 1): foCollection<Station> {
        const list: foCollection<Station> = new foCollection<Station>();
        const knowledge = FactoryStencil.find('Station');
        for (let i = 0; i < count; i++) {
            const result = knowledge.newInstance().defaultName() as Station;
            result.addAsSubcomponent(page).pushTo(list);
        }
        return list;
    }

    createPackage(page: foPage, count: number = 1): foCollection<Package> {
        const list: foCollection<Package> = new foCollection<Package>();
        const knowledge = FactoryStencil.find('Package');
        for (let i = 0; i < count; i++) {
            const result = knowledge.newInstance().defaultName() as Package;
            result.addAsSubcomponent(page).pushTo(list);
        }
        return list;
    }

    buildFactory(page: foPage) {
        const grid = this.generateGrid(100, 210, 3, 200, 200, 2);
        const list = this.createStation(page, grid.length);
        let i = 0;
        list.forEach(item => {
            item.easeTween(grid[i++], Tools.random(0.5, 2.5));
        });
    }

    runFactory(page: foPage) {
        const stations = page.selectGlyph(item => Tools.matches(item.myClass, 'Station'));

        const list = this.createPackage(page, 1);

        list.forEach(item => {
            item.stations = <foCollection<Station>>stations;
        });

        const packages = page.selectGlyph(item => Tools.matches(item.myClass, 'Package'));
        packages.forEach(item => {
            (<Package>item).doGoToNextStation();
        });
    }

    renderView(obj: foInstance, viewParent: foShape2D, grid: Array<any>): foShape2D {
        const knowledge = FactoryStencil.find('Environment');
        const result = knowledge.newInstance().defaultName() as Environment;
        result.addAsSubcomponent(viewParent);

        const loc = grid.shift();
        result.easeTween(loc, 0.5);

        obj.nodes.forEach(item => {
            this.renderView(item, result, grid);
        });

        return result;
    }

    renderModel(page: foPage, model: foInstance) {
        const grid = this.generateGrid(100, 210, 3, 200, 200, 2);
        this.renderView(model, page, grid);
    }

}

export let factoryBehaviour: factoryController = new factoryController().defaultName('Factory');
// factoryBehaviour.addToggle(factoryBehaviour.toggleRule1)

import { RuntimeType } from '../foundry/foRuntimeType';
RuntimeType.define(Package);

