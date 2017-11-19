
import { ifoNode } from '../foundry/foObject.model'

export interface iPoint {
    x: number;
    y: number;
}

export interface iSize {
    width: number;
    height: number;
}

export interface iShape extends ifoNode {
    draw(ctx: CanvasRenderingContext2D): void;
    drawHover(ctx: CanvasRenderingContext2D): void;
    hitTest(hit: iPoint): boolean;
    overlapTest(hit: iShape): boolean;
    getOffset(loc: iPoint): iPoint;
    getLocation(): iPoint;
    setLocation(loc: iPoint): iPoint;
    doMove(loc: iPoint, offset?: iPoint): iPoint;
    getSize(scale: number): iSize;
    scaleSize(scale: number): iSize;
    isSelected: boolean;

    setColor(color:string): string;
    setOpacity(opacity:number): number;
}

export interface iFullShape {
    draw(ctx: CanvasRenderingContext2D): void;
    drawHover(ctx: CanvasRenderingContext2D): void;
    hitTest(x: number, y: number): boolean;
    isSelected: boolean;
    x: number;
    y: number;
    color: string;
    lineWidth: number;
}