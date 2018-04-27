import { Tools, foObject, Action } from '../../foundry';

import { foGlyph2D } from '../shapes/foGlyph2D.model';
import { cPoint2D } from '../shapes/foGeometry2D';

export interface iXY {
  x: number;
  y: number;
}

//and easy way to create a set of layout geometry
export class foLayout2D extends foGlyph2D {
  private _points: Map<String, cPoint2D> = new Map<String, cPoint2D>();

  constructor(
    properties?: any,
    subcomponents?: Array<foGlyph2D>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
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


  findPoint(key: string, onFound?: Action<cPoint2D>, onMissing?): cPoint2D {
    if (this._points.has(key)) {
      const pnt =  this._points.get(key);
      onFound && onFound(pnt);
      return pnt;
    } else if ( onMissing ) {
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
    if (points) {
      points.forEach(pt => {
        list.push({ x: pt.x, y: pt.y });
      });
    } else {
      this._points.forEach(pt => {
        list.push({ x: pt.x, y: pt.y });
      });
    }
    return list;
  }
}
