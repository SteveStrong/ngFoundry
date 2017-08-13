import { iShape } from "./shape";

export class cText implements iShape {
    public x: number = 0;
    public y: number = 0;
    public radius: number = 10;
    public lineWidth: number = 2;
    public color: string = "red";
    public text: string ="Hello";

    constructor(x: number, y: number, text: string, color: string = "red", line_width: number = 2) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.lineWidth = line_width;
    }
    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        ctx.beginPath();

        ctx.font = '50pt Arial';
        ctx.fillStyle = 'gray';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;

        ctx.fillText(this.text , this.x, this.y);
        ctx.strokeText(this.text, this.x, this.y);
        ctx.stroke();
        ctx.restore();
    
    }
}

