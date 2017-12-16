
import { iPoint, iRect, iBox } from './foInterface';

export class cPoint implements iPoint {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add(x: number = 0, y: number = 0) {
        this.x += x;
        this.y += y;
        return this;
    }
}

export class cRect implements iRect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    move(x: number = 0, y: number = 0): iRect {
        this.x += x;
        this.y += y;
        return this;
    }

    size(width: number, height: number): iRect {
        this.width = width;
        this.height = height;
        return this;
    }

    setValue(x: number, y: number, width: number, height: number): iRect {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    contains(x: number, y: number) {
        return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
    }

    draw(ctx: CanvasRenderingContext2D, fill?: boolean) {
        if (fill) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.rect(this.x, this.y, this.width, this.height);
        }
        return this;
    }
}

export class cBox extends cRect implements iBox {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        super(x,y,width,height);
    }

    pinX(): number {
        return 0 * this.width;
    }

    pinY(): number {
        return 0 * this.height;
    }


    draw(ctx: CanvasRenderingContext2D, fill?: boolean) {
        if (fill) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.rect(this.x, this.y, this.width, this.height);
        }
        return this;
    }
}