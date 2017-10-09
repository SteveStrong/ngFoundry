
import { Tools } from '../foundry/foTools'
import { foObject, iObject } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { iShape, iPoint } from "./shape";
import { cPoint } from "./point";


export class foShape extends foComponent implements iShape {
    private _isSelected: boolean = false;

    get isSelected(): boolean { return this._isSelected; }
    set isSelected(value: boolean) { this._isSelected = value; }

    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _opacity: number = 1;

    get x(): number { return this._x || 0.0; }
    set x(value: number) { this._x = value; }

    get y(): number { return this._y || 0.0 }
    set y(value: number) { this._y = value; }

    get width(): number { return this._width || 0.0; }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }

    get opacity(): number { return this._opacity || 1; }
    set opacity(value: number) { this._opacity = value; }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myType = 'foShape';

    }


    public hitTest = (hit: iPoint): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        if (hit.x < x) return false;
        if (hit.x > x + width) return false;
        if (hit.y < y) return false;
        if (hit.y > y + height) return false;
        return true;
    }

    public getOffset = (loc: iPoint): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x - loc.x, y - loc.y);
    }

    public getLocation = (): iPoint => {
        let x = this.x;
        let y = this.y;
        return new cPoint(x, y);
    }

    public setLocation = (loc: iPoint): iPoint => {
        this.x = loc.x;
        this.y = loc.y;
        //structual type
        return {
            x: this.x,
            y: this.y
        }
    }

    public doMove = (loc: iPoint, offset?: iPoint): iPoint => {
        this.x = loc.x + (offset ? offset.x : 0);
        this.y = loc.y + (offset ? offset.y: 0);
        //structual type
        return {
            x: this.x,
            y: this.y
        }
    }

    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => { }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        ctx.save();
        ctx.fillStyle = 'green';
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(x, y, width, height);

        if (this.isSelected) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.beginPath()
            ctx.rect(x, y, width, height);
            ctx.stroke();
        }
        ctx.restore();
    }

    toggleSelected() {
        this._isSelected = !this._isSelected;
    }
}

