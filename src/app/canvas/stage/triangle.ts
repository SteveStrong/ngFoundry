import { iShape } from "./shape";



export class cTriangle implements iShape {
    public x: number = 0;
    public y: number = 0;
    public width: number = 10;
    public height: number = 10;
    public lineWidth: number = 2;
    public color: string = "red";

    private _ctx: CanvasRenderingContext2D;

    constructor(x: number, y: number, width: number, height: number, color: string = "red", line_width: number = 2) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.lineWidth = line_width;
    }

    sierpinski(x1, y1, x2, y2, x3, y3, depth) {
        if (depth == 0)
            this.drawTriangle(x1, y1, x2, y2, x3, y3);
        else {
            var x12 = (x1 + x2) / 2;
            var y12 = (y1 + y2) / 2;
            var x13 = (x1 + x3) / 2;
            var y13 = (y1 + y3) / 2;
            var x23 = (x2 + x3) / 2;
            var y23 = (y2 + y3) / 2;

            this.sierpinski(x1, y1, x12, y12, x13, y13, depth - 1);
            this.sierpinski(x12, y12, x2, y2, x23, y23, depth - 1);
            this.sierpinski(x13, y13, x23, y23, x3, y3, depth - 1);
        }
    }

    drawTriangle(x1, y1, x2, y2, x3, y3) {
        this._ctx.beginPath();

        this._ctx.moveTo(x1, y1);
        this._ctx.lineTo(x2, y2);
        this._ctx.lineTo(x3, y3);
        this._ctx.closePath();
        this._ctx.fill();
    }
    public hitTest = (x: number, y:number): boolean => {
        return false;
    }
    public draw = (ctx: CanvasRenderingContext2D): void => {

        ctx.save();
        this._ctx = ctx;

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        
        ctx.lineWidth = this.lineWidth;

        var centerX = this.width / 2;

        var x1 = centerX;
        var y1 = 0;
        var x2 = this.width;
        var y2 = this.height;
        var x3 = 0;
        var y3 = this.height;
        var depth = 6;

        this.sierpinski(x1, y1, x2, y2, x3, y3, depth);

        ctx.restore();
    }
}

