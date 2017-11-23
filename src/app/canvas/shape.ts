
import { iNode, iPoint, iSize, iShape } from '../foundry/foInterface'





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