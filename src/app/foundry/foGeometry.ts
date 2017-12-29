
import { iPoint, iRect, iBox, iMargin, iFrame } from './foInterface';

export class cPoint implements iPoint {
    public x: number;
    public y: number;
    public myName: string;

    constructor(x: number = 0, y: number = 0, name?: string) {
        this.x = x;
        this.y = y;
        this.myName = name;
    }

    set(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
        return this;
    }

    add(x: number = 0, y: number = 0) {
        this.x += x;
        this.y += y;
        return this;
    }

    subtract(x: number = 0, y: number = 0) {
        this.x -= x;
        this.y -= y;
        return this;
    }

    midpoint(pt: cPoint) {
        let x = (this.x + pt.x) / 2;
        let y = (this.y + pt.y) / 2;
        return new cPoint(x, y);
    }
}

export class cRect implements iRect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public myName: string;

    constructor(x: number, y: number, width: number, height: number, name?: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.myName = name;
    }

    moveBy(x: number = 0, y: number = 0): iRect {
        this.x += x;
        this.y += y;
        return this;
    }

    moveTo(x: number = 0, y: number = 0): iRect {
        this.x = x;
        this.y = y;
        return this;
    }

    sizeBy(width: number, height: number): iRect {
        this.width += width;
        this.height += height;
        return this;
    }

    sizeTo(width: number, height: number): iRect {
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


export class cFrame implements iFrame {
    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    setValue(x1: number, y1: number, x2: number, y2: number): iFrame {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        return this;
    }

    merge(obj:iFrame): iFrame {
        this.x1 = Math.min(this.x1,obj.x1);
        this.y1 = Math.min(this.y1,obj.y1);
        this.x2 = Math.max(this.x2,obj.x2);
        this.y2 = Math.max(this.y2,obj.y2);
        return this;
    }
    contains(x: number, y: number) {
        return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2;
    }

    draw(ctx: CanvasRenderingContext2D, fill?: boolean) {
        let width = this.x2 - this.x1;
        let height = this.y2 - this.y1;
        if (fill) {
            ctx.fillRect(this.x1, this.y1, width, height);
        } else {
            ctx.rect(this.x1, this.y1, width, height);
        }
        return this;
    }
}

export class cMargin implements iMargin {
    public left: number = 0;
    public top: number = 0;
    public right: number = 0;
    public bottom: number = 0;


    constructor(left: number=0, top: number=0, right: number=0, bottom: number=0) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    setAll(size: number=0) {
        this.left = size;
        this.top = size;
        this.right = size;
        this.bottom = size;
        return this;
    }

    get width() {
        return this.left + this.right;
    }
    get height() {
        return this.top + this.bottom;
    }
}
export class cBox extends cRect implements iBox {

    constructor(x: number, y: number, width: number, height: number, name?: string) {
        super(x, y, width, height, name);
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