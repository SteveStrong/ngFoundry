

import { iShape, iPoint } from "./shape";
import { cPoint } from "./point";
import { foShape } from "./shape.model";

export class foRectangle implements iShape {
    private shape: foShape;

    get isSelected(): boolean {
        return this.shape.isSelected;
    }
    set isSelected(value: boolean) {
        this.shape.isSelected = value;
    }

    constructor(properties?: any) {
        this.shape = new foShape(properties);
    }
    public hitTest = (hit: iPoint): boolean => {
        let x = this.shape['x'];
        let y = this.shape['y'];
        let width = this.shape['width'];
        let height = this.shape['height'];
        if (hit.x < x) return false;
        if (hit.x > x + width) return false;
        if (hit.y < y) return false;
        if (hit.y > y + height) return false;
        return true;
    }
    public getOffset = (loc: iPoint): iPoint => {
        let x = this.shape['x'];
        let y = this.shape['y'];
        return new cPoint(x - loc.x, y - loc.y);
    }
    public doMove = (loc: iPoint, offset: iPoint): iPoint => {
        this.shape['x'] = loc.x + offset.x;
        this.shape['y'] = loc.y + offset.y;
        //structual type
        return {
            x: this.shape['x'],
            y: this.shape['y']
        }
    }

    public drawHover = (ctx: CanvasRenderingContext2D): void => { }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => { }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        let x = this.shape['x'];
        let y = this.shape['y'];
        let width = this.shape['width'];
        let height = this.shape['height'];

        ctx.save();
        ctx.fillStyle = 'green';
        ctx.lineWidth = 1;
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

}