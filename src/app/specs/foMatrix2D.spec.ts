import { TestBed, async } from '@angular/core/testing';

import { cPoint2D  } from '../foundry/shapes/foGeometry2D';
import { Matrix2D, Identity  } from '../foundry/shapes/foMatrix2D';




describe('Matrix2D', () => {
  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   imports: [],
    //   providers: [],
    //   declarations: [],
    // }).compileComponents();
  }));

  it('should create the a Matrix2D', async(() => {
    const obj = new Matrix2D();
    expect(obj).toBeTruthy();
  }));

  it(`by default a new matrix == idenity`, async(() => {
    const obj = new Matrix2D();
    expect(obj).toBeTruthy();
    expect(obj.isIdentity).toBeTruthy();
    expect(obj.equals(Identity)).toBeTruthy();
  }));


  it(`can translate a point`, async(() => {
    const obj = new Matrix2D();
    obj.translate(10,10);
    let pt1 = new cPoint2D(10,20);

    expect(pt1.x).toEqual(10);
    expect(pt1.y).toEqual(20);

    let pt2 = obj.transformPoint(pt1.x, pt1.y);

    expect(pt2.x).toEqual(20);
    expect(pt2.y).toEqual(30);

  }));

  it(`can rotate a point`, async(() => {
    const obj = new Matrix2D();
    obj.rotate(90);
    let pt1 = new cPoint2D(10,0);

    expect(pt1.x).toEqual(10);
    expect(pt1.y).toEqual(0);

    let pt2 = obj.transformPoint(pt1.x, pt1.y);

    expect(pt2.x).toBeCloseTo(0);
    expect(pt2.y).toBeCloseTo(10);

  }));

});
