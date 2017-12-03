
import { iPoint, iRect } from './foInterface';

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
}