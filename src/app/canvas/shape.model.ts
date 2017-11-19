
import { Tools } from '../foundry/foTools'
import { foObject, iObject, ifoNode } from '../foundry/foObject.model'
import { foConcept } from '../foundry/foConcept.model'
import { foComponent } from '../foundry/foComponent.model'

import { iShape, iPoint, iSize } from "./shape";
import { cPoint } from "./point";


export class foShape extends foComponent implements iShape, ifoNode {
    private _isSelected: boolean = false;

    get isSelected(): boolean { return this._isSelected; }
    set isSelected(value: boolean) { this._isSelected = value; }

    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _opacity: number;
    private _color: string;

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

    get color(): string { 
        return this._color || 'green'; 
    }
    set color(value: string) { 
        this._color = value; 
    }

    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.myType = 'foShape';
        this.myGuid;
    }

    get asJson() {
        return {
            myGuid: this.myGuid,
            x: this.x,
            y: this.y
        }
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

    public overlapTest = (hit: iShape): boolean => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        let loc = hit.getLocation();
        let size = hit.getSize(1.0);
        if (loc.x > x + width) return false;
        if (loc.x + size.width < x) return false;
        if (loc.y > y + height) return false;
        if (loc.y + size.height < y) return false;

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

    public getSize = (scale: number = 1): iSize => {
        //structual type
        return {
            width: this.width * scale,
            height: this.height * scale
        }
    }

    public scaleSize = (scale: number): iSize => {
        //structual type
        this.x -= (this.width * (scale - 1)) / 2.0;
        this.y -= (this.height * (scale - 1)) / 2.0;
        this.width *= scale;
        this.height *= scale;
        return this.getSize(1.0);
    }

    public doMove = (loc: iPoint, offset?: iPoint): iPoint => {
        this.x = loc.x + (offset ? offset.x : 0);
        this.y = loc.y + (offset ? offset.y : 0);

        let result = this._subcomponents.members as Array<foShape>;
        result && result.forEach(item => {
            item.doMove(loc, offset);
        });
        //structual type
        return {
            x: this.x,
            y: this.y
        }
    }

    public setColor(color: string): string {
        this.color = color;
        return this.color;
    };

    public setOpacity(opacity: number): number {
        this.opacity = opacity;
        return this.opacity;
    };

    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => { }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(x, y, width, height);

        //http://junerockwell.com/end-of-line-or-line-break-in-html5-canvas/
        let fontsize = 20;
        ctx.font = `${fontsize}px Calibri`;
        ctx.fillStyle = 'blue';

        // let text = `x1=${x} y1=${y}|x2=${x+width} y2=${y+height}|`;
        // let array = text.split('|');
        // let dx = x + 10;
        // let dy = y + 20;
        // for (var i = 0; i < array.length; i++) {
        //     ctx.fillText(array[i], dx, dy);
        //     dy += (fontsize + 4);
        //  }

        if (this.isSelected) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.beginPath()
            ctx.rect(x, y, width, height);
            ctx.stroke();
        }

        let result = this._subcomponents.members as Array<foShape>;
        result && result.forEach(item => {
            item.draw(ctx)
        });

        ctx.restore();
    }

    toggleSelected() {
        this._isSelected = !this._isSelected;
    }
}

