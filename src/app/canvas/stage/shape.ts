
export interface iShape {
    draw(ctx: CanvasRenderingContext2D): void;
    hitTest(x: number, y:number): boolean;
    x: number;
    y: number;
    color: string;
    lineWidth: number;
}