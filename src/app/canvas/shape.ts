
export interface iPoint {
    x: number;
    y: number;
}

export interface iShape {
    draw(ctx: CanvasRenderingContext2D): void;
    drawHover(ctx: CanvasRenderingContext2D): void;
    hitTest(hit: iPoint): boolean;
    getOffset(loc: iPoint): iPoint;
    getLocation(): iPoint;
    doMove(loc: iPoint, offset?: iPoint): iPoint;
    isSelected: boolean;
}

export interface iFullShape {
    draw(ctx: CanvasRenderingContext2D): void;
    drawHover(ctx: CanvasRenderingContext2D): void;
    hitTest(x: number, y:number): boolean;
    isSelected: boolean;
    x: number;
    y: number;
    color: string;
    lineWidth: number;
}