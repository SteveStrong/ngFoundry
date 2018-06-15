
import { Tools } from '../foTools';
import { cPoint2D } from './foGeometry2D';
import { Vector2, Vector3 } from 'three';
import { iPoint2D, iFrame } from '../foInterface';

import { foObject } from '../foObject.model';
import { Matrix2D } from './foMatrix2D';
import { foGlue2D } from './foGlue2D';
import { foConnectionPoint2D } from './foConnectionPoint2D';
import { foCollection } from '../foCollection.model';


import { foGlyph2D } from './foGlyph2D.model';

import { Lifecycle } from '../foLifecycle';

export enum shape2DNames {
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
    center = 'center'
}

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape2D extends foGlyph2D {

    protected _angle: number;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) {
        this.smash();
        this._angle = value;
    }

    protected _glue: foCollection<foGlue2D>;
    get glue(): foCollection<foGlue2D> {
        if (!this._glue) {
            this._glue = new foCollection<foGlue2D>();
        }
        return this._glue;
    }

    protected _connectionPoints: foCollection<foConnectionPoint2D>;
    get connectionPoints(): foCollection<foConnectionPoint2D> {
        this._connectionPoints || this.createConnectionPoints();
        return this._connectionPoints;
    }

    public pinX = (): number => { return 0.5 * this.width; };
    public pinY = (): number => { return 0.5 * this.height; };
    public rotationZ = (): number => { return this.angle; };

    public setPinLeft() {
      this.pinX = (): number => { return 0.0 * this.width; };
      return this;
    }
    public setPinRight() {
      this.pinX = (): number => { return 1.0 * this.width; };
      return this;
    }
    public setPinCenter() {
      this.pinX = (): number => { return 0.5 * this.width; };
      return this;
    }

    public setPinTop() {
      this.pinY = (): number => { return 0.0 * this.height; };
      return this;
    }
    public setPinMiddle() {
      this.pinY = (): number => { return 0.5 * this.height; };
      return this;
    }
    public setPinBottom() {
      this.pinY = (): number => { return 1.0 * this.height; };
      return this;
    }

    pinVector(): Vector3 {
        return new Vector3(
            this.pinX(),
            this.pinY(),
            0,
        );
    }

    protected originPosition(): Vector3 {
        const pin = this.pinVector();
        return new Vector3(
            this.x - pin.x,
            this.y - pin.y,
            0,
        );
    }

    public pinLocation() {
        return {
            x: this.pinX(),
            y: this.pinY(),
            z: 0,
        };
    }


    constructor(properties?: any, subcomponents?: Array<foGlyph2D>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            angle: this.angle,
            // glue: this._glue && Tools.asArray(this.glue.asJson)
        });
    }




    public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN): boolean {
        let changed = super.didLocationChange(x, y, angle);
        if (!Number.isNaN(angle) && this.angle !== angle) {
            changed = true;
            this.angle = angle;
        }
        return changed;
    }


    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            const point = this.getLocation();
            this._glue && this.glue.forEach(item => {
                item.targetMoved(point);
            });
            Lifecycle.dropped(this, point);
        }
        return this;
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            const point = this.getLocation();
            this._glue && this.glue.forEach(item => {
                item.targetMoved(point);
            });
            Lifecycle.moved(this, point);
        }
        return this;
    }

    updateContext(ctx: CanvasRenderingContext2D) {
        const mtx = this.getMatrix();
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
        ctx.globalAlpha *= this.opacity;
    }

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            this._matrix.appendTransform(this.x, this.y, 1, 1, this.rotationZ(), 0, 0, this.pinX(), this.pinY());
        }
        return this._matrix;
    }


    protected localHitTest = (hit: any): boolean => {
        const { x, y } = hit as iPoint2D;
        const loc = this.globalToLocal(x, y);

        if (loc.x < 0) return false;
        if (loc.x > this.width) return false;

        if (loc.y < 0) return false;
        if (loc.y > this.height) return false;

        return true;
    }


    public hitTest = (hit: any): boolean => {
        return this.localHitTest(hit);
    }


    public overlapTest = (hit: iFrame): boolean => {
        const frame = this.globalToLocalFrame(hit.x1, hit.y1, hit.x2, hit.y2);

        if (this.localContains(frame.x1, frame.y1)) return true;
        if (this.localContains(frame.x1, frame.y2)) return true;
        if (this.localContains(frame.x2, frame.y1)) return true;
        if (this.localContains(frame.x2, frame.y2)) return true;
        return false;
    }



    protected getGlue(name?: string) {
        let glue = name && this.glue.findMember(name);
        if (!glue) {
            glue = new foGlue2D({ myName: name }, this);
            this.addGlue(glue);
        }
        return glue;
    }

    public establishGlue(sourceName: string, target: foShape2D, targetName?: string) {
        const glue = this.getGlue(`${this.myGuid}:${sourceName}->${target.myGuid}:${targetName}`);
        glue.glueTo(sourceName, target, targetName);
        return glue;
    }

    public glueConnectionPoints(target: foShape2D, sourceHandle?: string, targetHandle?: string) {
        const glue = this.establishGlue(sourceHandle ? sourceHandle : shape2DNames.center, target, targetHandle ? targetHandle : shape2DNames.center);
        return glue;
    }

    public dissolveGlue(name: string) {
        if (this._glue) {
            const glue = this.glue.findMember(name);
            glue && glue.unglue();
            return glue;
        }
    }

    public addGlue(glue: foGlue2D) {
        this.glue.addMember(glue);
        return glue;
    }


    public removeGlue(glue: foGlue2D) {
        if (this._glue) {
            this.glue.removeMember(glue);
        }
        return glue;
    }

    protected generateConnectionPoints(spec: Array<any>, proxy?: Array<any>): foCollection<foConnectionPoint2D> {

        let i = 0;
        if (!this._connectionPoints) {
            this._connectionPoints = new foCollection<foConnectionPoint2D>();
            spec.forEach(item => {
                const type = item.myType ? item.myType : RuntimeType.define(foConnectionPoint2D);
                const point = new type(item, undefined, this);
                point.doMoveProxy = proxy && proxy[i];
                this._connectionPoints.addMember(point);
                i++;
            });
        } else {
            spec.forEach(item => {
                const point = this._connectionPoints.getChildAt(i);
                point.override(item);
                point.doMoveProxy = proxy && proxy[i];
                i++;
            });
        }
        return this._connectionPoints;
    }

    public createConnectionPoints(): foCollection<foConnectionPoint2D> {
        const w = this.width;
        const h = this.height;
        const spec = [
            { x: w / 2, y: 0, myName: shape2DNames.top, myType: RuntimeType.define(foConnectionPoint2D) },
            { x: w / 2, y: h, myName: shape2DNames.bottom, angle: 45 },
            { x: 0, y: h / 2, myName: shape2DNames.left },
            { x: w, y: h / 2, myName: shape2DNames.right },
        ];

        return this.generateConnectionPoints(spec);
    }

    getConnectionPoint(name: string): foConnectionPoint2D {
        return this.connectionPoints.findMember(name);
    }

    public findConnectionPoint(loc: cPoint2D, e): foConnectionPoint2D {
        if (!this._connectionPoints) return;

        for (var i = 0; i < this.connectionPoints.length; i++) {
            const point: foConnectionPoint2D = this.connectionPoints.getChildAt(i);
            if (point.hitTest(loc)) {
                return point;
            }
        }
    }


    public drawConnectionPoints(ctx: CanvasRenderingContext2D) {
        this.connectionPoints.forEach(item => {
            item.render(ctx);
        });
    }

    public render(ctx: CanvasRenderingContext2D, deep: boolean = true) {
        ctx.save();

        //this.drawOrigin(ctx);
        this.updateContext(ctx);
        //this.drawOriginX(ctx);

        this.preDraw && this.preDraw(ctx);
        this.draw(ctx);
        this.drawHover && this.drawHover(ctx);
        this.postDraw && this.postDraw(ctx);

        this.isSelected && this.drawSelected(ctx);

        deep && this._subcomponents.forEach(item => {
            item.render(ctx, deep);
        });
        ctx.restore();
    }


    public drawOutline(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        this.drawOutline(ctx);
        this.drawHandles(ctx);
        this.drawConnectionPoints(ctx);
        this.drawPin(ctx);
    }

    public draw = (ctx: CanvasRenderingContext2D): void => {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(0, 0, this.width, this.height);
    }

}


import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foShape2D);

export class foGroup2D extends foShape2D {
}

RuntimeType.define(foGroup2D);

