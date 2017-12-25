import { foDisplay2D } from "../../foundry/foDisplay2D.model";

export class cText extends foDisplay2D {
    public x: number = 0;
    public y: number = 0;
    public radius: number = 10;
    public lineWidth: number = 2;
    public color: string = "red";
    public isSelected: boolean;
    public text: string = "Hello";

    private _ctx: CanvasRenderingContext2D;

    constructor(properties?: any) {
        super(properties);
    }

    onInit(x: number, y: number, text: string, color: string = "red", line_width: number = 2) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.lineWidth = line_width;
    }
    public hitTestxxx = (x: number, y: number): boolean => {
        var textSize: TextMetrics = this._ctx.measureText(this.text);
        var height = 1.5 * parseInt(this._ctx.font);

        if (x < this.x) return false;
        if (x > this.x + textSize.width) return false;
        if (y < this.y) return false;
        if (y > this.y + height) return false;
        return true;
    }
    public drawHover = (ctx: CanvasRenderingContext2D): void => {
    }
    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
    }
    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        this._ctx = ctx;

        ctx.beginPath();



        ctx.font = '50pt Arial';
        ctx.fillStyle = 'gray';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;

        ctx.fillText(this.text, this.x, this.y);
        ctx.strokeText(this.text, this.x, this.y);
        ctx.stroke();
        ctx.restore();

    }
}

