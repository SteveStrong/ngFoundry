//https://www.typescriptlang.org/docs/handbook/decorators.html

export interface Action<T>
{
    (item: T): void;
}

export interface ModelRef<T>
{
    (): T;
}

export interface Func<T,TResult>
{
    (item: T): TResult;
}

export interface iObject {
    myName: string;
    myParent: ModelRef<iObject>;
    asReference(): string;
    getChildAt(i: number): iObject;
    override(properties?: any);
 }

export interface iNode {
    addAsSubcomponent(obj: iNode);
    addSubcomponent(obj: iNode);
    removeSubcomponent(obj: iNode);
}

export interface iKnowledge extends iObject {
}

//FOR GLYPHS and SHAPES
export interface iPoint {
    x: number;
    y: number;
    add(x: number, y: number): iPoint
}

export interface iSize {
    width: number;
    height: number;
}

export interface iRect {
    x: number;
    y: number;
    width: number;
    height: number;

    setValue(x: number, y: number, width: number, height: number): iRect
}

export interface iShape extends iNode {
    render(ctx: CanvasRenderingContext2D, deep:boolean): void;
    draw(ctx: CanvasRenderingContext2D): void;
    drawHover(ctx: CanvasRenderingContext2D): void;
    hitTest(hit: iPoint, ctx: CanvasRenderingContext2D): boolean;
    overlapTest(hit: iShape, ctx: CanvasRenderingContext2D): boolean;
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

