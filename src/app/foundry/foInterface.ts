//https://www.typescriptlang.org/docs/handbook/decorators.html

export interface Action<T> {
  (item: T): void;
}

export interface ModelRef<T> {
  (): T;
}

export interface Func<T, R> {
  (item: T): R;
}

export interface WhereClause<T> {
  (item: T): boolean;
}

export interface Spec<T> {
  (spec?: any): Array<T>;
}

export interface iObject {
  myName: string;
  myParent: ModelRef<iObject>;
  myGuid: string;
  asReference(): string;
  getChildAt(i: number): iObject;
  override(properties?: any);
  hasAncestor(member?: iObject): boolean;
  defaultName(name?: string);
  asJson: string;
  isPublic: boolean;
}

export interface iNode {
  addAsSubcomponent(obj: iNode);
  addSubcomponent(obj: iNode);
  removeSubcomponent(obj: iNode);

  // canCaptureSubcomponent(obj:iNode):boolean;
  // captureSubcomponent(obj:iNode);
}

export interface iKnowledge extends iObject {}

// export interface iConnectionPoint extends iObject {
//     doMoveProxy: (loc: any) => void;
//     hitTest: (hit: iPoint2D) => boolean
//     render(ctx: CanvasRenderingContext2D);
// }

//FOR GLYPHS and SHAPES
export interface iName {
  myName: string;
}

export interface iPoint2D extends iName {
  x: number;
  y: number;
}

export interface iPoint3D extends iPoint2D {
  z: number;
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

  set(x: number, y: number, width: number, height: number): iRect;
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
  minmax(obj: iPoint2D): iFrame;
}

export interface iBox extends iRect {
  x: number;
  y: number;
  width: number;
  height: number;

  pinX(): number;
  pinY(): number;

  set(x: number, y: number, width: number, height: number): iRect;
}

export interface iFence {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;

  set(
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number
  ): iFence;
  contains(x: number, y: number, z: number): boolean;
  minmax(obj: iPoint3D): iFrame;
}

export interface iCube {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  myName: string;

  set(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ): iCube;
  contains(x: number, y: number, z: number): boolean;
  localContains(x: number, y: number, z: number): boolean;
}

export interface iGlueSignature {
  sourceGuid: string;
  sourceName: string;
  targetGuid: string;
  targetName: string;
}

export interface iShape extends iRect, iNode {
  isSelected: boolean;

  render(ctx: CanvasRenderingContext2D, deep: boolean): void;
  draw(ctx: CanvasRenderingContext2D): void;
  drawHover(ctx: CanvasRenderingContext2D): void;

  hitTest: (hit: iPoint2D) => boolean;
  overlapTest: (hit: iFrame) => boolean;

  // getOffset(loc: iPoint2D): iPoint2D;
  // getLocation(): any;
  // moveTo(loc: iPoint2D, offset?: iPoint2D);
  // moveBy(loc: iPoint2D, offset?: iPoint2D)
}

export interface iSolid extends iCube, iNode {
  isSelected: boolean;

  hitTest: (hit: iPoint3D) => boolean;
  overlapTest: (hit: iFence) => boolean;

  // getOffset(loc: iPoint2D): iPoint2D;
  // getLocation(): any;
  // moveTo(loc: iPoint2D, offset?: iPoint2D);
  // moveBy(loc: iPoint2D, offset?: iPoint2D)
}
