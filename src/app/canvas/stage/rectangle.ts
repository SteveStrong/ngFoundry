

import { iShape } from "./shape";

export class cRectangle implements iShape {
    public x: number = 0;
    public y: number = 0;
    public lineWidth: number = 5;
    public width: number = 0;
    public height: number = 0;
    public color: string = "blue";

    constructor(x: number, y: number, width: number, height: number, color: string = "blue", line_width: number = 2) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.lineWidth = line_width;
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.rect(this.x + 2, this.y + 2, this.width + 2, this.height + 2);

        ctx.stroke();
        ctx.restore();
    }

}