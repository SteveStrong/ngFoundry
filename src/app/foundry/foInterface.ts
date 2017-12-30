//https://www.typescriptlang.org/docs/handbook/decorators.html

export interface Action<T> {
    (item: T): void;
}

export interface ModelRef<T> {
    (): T;
}

export interface Func<T, TResult> {
    (item: T): TResult;
}

export interface iObject {
    myName: string;
    myParent: ModelRef<iObject>;
    myGuid: string;
    asReference(): string;
    getChildAt(i: number): iObject;
    override(properties?: any);
    hasAncestor(member?: iObject):boolean;
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
    myName: string;

    set(x: number, y: number): iPoint
    add(x: number, y: number): iPoint
}

export interface iMargin {
    left: number;
    top: number;
    right: number;
    bottom: number;
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
    myName: string;

    set(x: number, y: number, width: number, height: number): iRect
    contains(x: number, y: number): boolean;
    localContains(x: number, y: number): boolean;
}

export interface iFrame {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    set(x1: number, y1: number, x2: number, y2: number): iFrame;
    contains(x: number, y: number): boolean;
    merge(obj: iFrame): iFrame;
    minmax(obj: iPoint): iFrame;
}

export interface iBox extends iRect {
    x: number;
    y: number;
    width: number;
    height: number;

    pinX(): number;
    pinY(): number;

    set(x: number, y: number, width: number, height: number): iRect
}

export interface iShape extends iRect, iNode {
    isSelected: boolean;

    render(ctx: CanvasRenderingContext2D, deep: boolean): void;
    draw(ctx: CanvasRenderingContext2D): void;
    drawHover(ctx: CanvasRenderingContext2D): void;
    hitTest(hit: iPoint, ctx: CanvasRenderingContext2D): boolean;
    overlapTest(hit: iFrame, ctx: CanvasRenderingContext2D): boolean;

    getOffset(loc: iPoint): iPoint;
    getLocation(): iPoint;
    moveTo(loc: iPoint, offset?: iPoint);
    moveBy(loc: iPoint, offset?: iPoint)

    setColor(color: string): string;
    setOpacity(opacity: number): number;
}

