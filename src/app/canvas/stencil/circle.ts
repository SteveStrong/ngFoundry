import { foDisplay2D } from "../../foundry/shapes/foDisplay2D.model";

export class cCircle extends foDisplay2D {
    public x: number = 0;
    public y: number = 0;
    public radius: number = 10;
    public lineWidth: number = 2;
    public color: string = "red";
    public isSelected: boolean;

    constructor(properties?: any) {
        super(properties);
    }

    onInit(x: number, y: number, radius: number, color: string = "red", line_width: number = 2) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.lineWidth = line_width;
    }

    public hitTestxx = (x: number, y: number): boolean => {

        let dx = this.x - x;
        let dy = this.y - y;
        if (dx * dx + dy * dy > this.radius * this.radius) return false;

        return true;
    }
    public drawHover = (ctx: CanvasRenderingContext2D): void => {
    }
    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
}

