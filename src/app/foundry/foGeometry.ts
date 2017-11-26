
import { iPoint } from './foInterface';

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