/**
 * Represents an affine transformation matrix, and provides tools for constructing and concatenating matrices.
 *
 * This matrix can be visualized as:
 *
 * 	[ a  c  tx
 * 	  b  d  ty
 * 	  0  0  1  ]
 *
 * Note the locations of b and c.
 *
 * @class Matrix2D
 * @param {Number} [a=1] Specifies the a property for the new matrix.
 * @param {Number} [b=0] Specifies the b property for the new matrix.
 * @param {Number} [c=0] Specifies the c property for the new matrix.
 * @param {Number} [d=1] Specifies the d property for the new matrix.
 * @param {Number} [tx=0] Specifies the tx property for the new matrix.
 * @param {Number} [ty=0] Specifies the ty property for the new matrix.
 * @constructor
 **/

import { cPoint } from './foGeometry';


export class Matrix2D {
    static DEG_TO_RAD: number = Math.PI / 180;

    public a: number = 1; //Position (0, 0) in a 3x3 affine transformation matrix.
    public b: number = 0; //Position (0, 1) in a 3x3 affine transformation matrix.
    public c: number = 0; //Position (1, 0) in a 3x3 affine transformation matrix.
    public d: number = 1; //Position (1, 1) in a 3x3 affine transformation matrix.
    public tx: number = 0; //Position (2, 0) in a 3x3 affine transformation matrix.
    public ty: number = 0; //Position (2, 1) in a 3x3 affine transformation matrix.

    constructor() {
    }

    append(a: number, b: number, c: number, d: number, tx: number, ty: number) {
        let a1 = this.a;
        let b1 = this.b;
        let c1 = this.c;
        let d1 = this.d;
        if (a != 1 || b != 0 || c != 0 || d != 1) {
            this.a = a1 * a + c1 * b;
            this.b = b1 * a + d1 * b;
            this.c = a1 * c + c1 * d;
            this.d = b1 * c + d1 * d;
        }
        this.tx = a1 * tx + c1 * ty + this.tx;
        this.ty = b1 * tx + d1 * ty + this.ty;
        return this;
    };

    prepend(a: number, b: number, c: number, d: number, tx: number, ty: number) {

        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;

        this.a = a * a1 + c * this.b;
        this.b = b * a1 + d * this.b;
        this.c = a * c1 + c * this.d;
        this.d = b * c1 + d * this.d;
        this.tx = a * tx1 + c * this.ty + tx;
        this.ty = b * tx1 + d * this.ty + ty;
        return this;
    };

    setValues(a: number, b: number, c: number, d: number, tx: number, ty: number) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
        return this;
    }


    appendMatrix(matrix: Matrix2D) {
        return this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
    };

    prependMatrix(matrix: Matrix2D) {
        return this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
    };

    appendTransform(x: number, y: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number, regX: number, regY: number) {
        if (rotation % 360) {
            var r = rotation * Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
        } else {
            cos = 1;
            sin = 0;
        }

        if (skewX || skewY) {
            // TODO: can this be combined into a single append operation?
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
        } else {
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
        }

        if (regX || regY) {
            // append the registration offset:
            this.tx -= regX * this.a + regY * this.c;
            this.ty -= regX * this.b + regY * this.d;
        }
        return this;
    };


    prependTransform(x: number, y: number, scaleX: number, scaleY: number, rotation: number, skewX: number, skewY: number, regX: number, regY: number) {
        if (rotation % 360) {
            var r = rotation * Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
        } else {
            cos = 1;
            sin = 0;
        }

        if (regX || regY) {
            // prepend the registration offset:
            this.tx -= regX; this.ty -= regY;
        }
        if (skewX || skewY) {
            // TODO: can this be combined into a single prepend operation?
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
        } else {
            this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
        }
        return this;
    };

    /**
 * Applies a clockwise rotation transformation to the matrix.
 * @method rotate
 * @param {Number} angle The angle to rotate by, in degrees. To use a value in radians, multiply it by `180/Math.PI`.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
    rotate(angle: number) {
        angle = angle * Matrix2D.DEG_TO_RAD;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        var a1 = this.a;
        var b1 = this.b;

        this.a = a1 * cos + this.c * sin;
        this.b = b1 * cos + this.d * sin;
        this.c = -a1 * sin + this.c * cos;
        this.d = -b1 * sin + this.d * cos;
        return this;
    };

    skew(skewX: number, skewY: number) {
        skewX = skewX * Matrix2D.DEG_TO_RAD;
        skewY = skewY * Matrix2D.DEG_TO_RAD;
        this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
        return this;
    };

    scale(x: number, y: number) {
        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        //this.tx *= x;
        //this.ty *= y;
        return this;
    };

    translate(x: number, y: number) {
        this.tx += this.a * x + this.c * y;
        this.ty += this.b * x + this.d * y;
        return this;
    };

    identity() {
        this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        return this;
    };

    invert() {
        let a1 = this.a;
        let b1 = this.b;
        let c1 = this.c;
        let d1 = this.d;
        let tx1 = this.tx;
        let ty1 = this.tx;
        let n = a1 * d1 - b1 * c1;

        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = (c1 * this.ty - d1 * tx1) / n;
        this.ty = -(a1 * this.ty - b1 * ty1) / n;
        return this;
    };

    isIdentity() {
        return this.tx === 0 && this.ty === 0 && this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1;
    };

    equals(matrix: Matrix2D) {
        return this.tx === matrix.tx && this.ty === matrix.ty && this.a === matrix.a && this.b === matrix.b && this.c === matrix.c && this.d === matrix.d;
    };

    /**
 * Transforms a point according to this matrix.
 * @method transformPoint
 * @param {Number} x The x component of the point to transform.
 * @param {Number} y The y component of the point to transform.
 * @param {Point | Object} [pt] An object to copy the result into. If omitted a generic object with x/y properties will be returned.
 * @return {Point} This matrix. Useful for chaining method calls.
 **/
    transformPoint(x: number, y: number, pt?: cPoint): cPoint {
        pt = pt || new cPoint();
        pt.x = x * this.a + y * this.c + this.tx;
        pt.y = x * this.b + y * this.d + this.ty;
        return pt;
    };

    invertPoint(x: number, y: number, pt?: cPoint): cPoint {
        let inv = this.invert();
        return inv.transformPoint(x, y, pt);
    };

    decompose(target) {
        // TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation even when scale is negative
        if (target == null) { target = {}; }
        target.x = this.tx;
        target.y = this.ty;
        target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
        target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

        var skewX = Math.atan2(-this.c, this.d);
        var skewY = Math.atan2(this.b, this.a);

        var delta = Math.abs(1 - skewX / skewY);
        if (delta < 0.00001) { // effectively identical, can use rotation:
            target.rotation = skewY / Matrix2D.DEG_TO_RAD;
            if (this.a < 0 && this.d >= 0) {
                target.rotation += (target.rotation <= 0) ? 180 : -180;
            }
            target.skewX = target.skewY = 0;
        } else {
            target.skewX = skewX / Matrix2D.DEG_TO_RAD;
            target.skewY = skewY / Matrix2D.DEG_TO_RAD;
        }
        return target;
    };

    copy(matrix: Matrix2D) {
        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;
        return this;
    };

    clone() {
        let matrix = new Matrix2D();
        matrix.setValues(this.a, this.b, this.c, this.d, this.tx, this.ty);
        return matrix

    };

    toString() {
        return "[Matrix2D (a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + ")]";
    };
}

export let Identity: Matrix2D = new Matrix2D();