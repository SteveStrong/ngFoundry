import { Tools, foObject, Action } from '../../foundry';

import { foGlyph2D } from '../shapes/foGlyph2D.model';
import { foShape2D } from '../shapes/foShape2D.model';
import { cPoint2D } from '../shapes/foGeometry2D';

export interface iXY {
  x: number;
  y: number;
}

//and easy way to create a set of layout geometry
export class foLayout2D extends foShape2D {
  private _cursor: cPoint2D = new cPoint2D();
  private _direction: cPoint2D = new cPoint2D(1, 0);
  private _points: Map<String, cPoint2D> = new Map<String, cPoint2D>();

  constructor(
    properties?: any,
    subcomponents?: Array<foGlyph2D>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
    this._direction.normal();
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      // glue: this._glue && Tools.asArray(this.glue.asJson)
    });
  }

  generateGrid(
    key: string,
    xStart: number = 100,
    xStep: number = 100,
    xCount = 5,
    yStart: number = 100,
    yStep: number = 100,
    yCount = 5
  ) {
    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < yCount; j++) {
        const point = new cPoint2D(
          xStart + i * xStep,
          yStart + j * yStep,
          `${key}:${i}:${j}`
        );
        this._points.set(point.myName, point);
      }
    }

    return this;
  }

  public fitSizeToPoints() {
    this._points.forEach(pt => {
      this.width = pt.x > this.width ? pt.x : this.width;
      this.height = pt.y > this.height ? pt.y : this.height;
    });
  }

  public drawCursor(ctx: CanvasRenderingContext2D) {
    const { x, y } = this._cursor;

    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(x - 50, y);
    ctx.lineTo(x + 50, y);
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x, y + 50);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.restore();
  }

  public drawSelected = (ctx: CanvasRenderingContext2D): void => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    this.drawOutline(ctx);
    this.drawHandles(ctx);
    this.drawLabels(ctx);
    this.drawPin(ctx);
    this.drawCursor(ctx);
  }

  public drawLabels = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.fillStyle = 'black';
    this._points.forEach(pt => {
      ctx.fillText(pt.myName, pt.x + 5, pt.y - 10);
    });
    ctx.restore();
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.rect(0, 0, this.width, this.height);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#003300';
    this._points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  findPoint(key: string, onFound?: Action<cPoint2D>, onMissing?): cPoint2D {
    if (this._points.has(key)) {
      const pnt = this._points.get(key);
      onFound && onFound(pnt);
      return pnt;
    } else if (onMissing) {
      onMissing();
      return this._points.get(key);
    }
  }

  getPointsByKey(key?: string): Array<cPoint2D> {
    const list = new Array<cPoint2D>();
    this._points.forEach(pt => {
      if (!key || Tools.startsWith(pt.myName, key)) {
        list.push(pt);
      }
    });
    return list;
  }

  getPointsXY(points?: Array<cPoint2D>): Array<iXY> {
    const list = new Array<iXY>();
    const mtx = this.getGlobalMatrix();
    let point = new cPoint2D();

    if (points) {
      points.forEach(pt => {
        point = mtx.transformPoint(pt.x, pt.y, point);
        list.push({ x: point.x, y: point.y });
      });
    } else {
      this._points.forEach(pt => {
        point = mtx.transformPoint(pt.x, pt.y, point);
        list.push({ x: point.x, y: point.y });
      });
    }
    return list;
  }


  newPoint(x: number, y: number, name: string): cPoint2D {
    const point = new cPoint2D(x, y, name);
    this._points.set(point.myName, point);
    return point;
  }

  setCursor(point: cPoint2D) {
    this._cursor.setValues(point.x, point.y);
  }

  setCursorXY(x: number, y: number) {
    this._cursor.setValues(x, y);
  }

  moveCursor(d: number) {
    this._cursor.addPoint(d * this._direction.x, d * this._direction.y);
  }

  moveCursorXY(dx: number, dy: number) {
    this._cursor.addPoint(dx, dy);
  }

  setDirection(angle: number) {
    const rads = angle * foGlyph2D.DEG_TO_RAD;
    this._direction.setValues(Math.cos(rads), Math.sin(rads));
  }

  setDirectionXY(x: number, y: number) {
    this._cursor.setValues(x, y).normal();
  }

  addPoint(name: string): cPoint2D {
    return this.newPoint(this._cursor.x, this._cursor.y, name);
  }
}
