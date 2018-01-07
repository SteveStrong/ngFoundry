
import { Tools } from '../foundry/foTools'
import { cPoint } from "../foundry/foGeometry";
import { iPoint, iFrame } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle } from '../foundry/foHandle'
import { foGlue } from '../foundry/foGlue'
import { foConnectionPoint } from '../foundry/foConnectionPoint'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'

import { foGlyph } from '../foundry/foGlyph.model'

import { Lifecycle } from './foLifecycle';

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foShape2D extends foGlyph {

    protected _angle: number;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) {
        this.smash();
        this._angle = value;
    }

    get glue(): foCollection<foGlue> { return this._glue || new foCollection<foGlue>(); }
    protected _glue: foCollection<foGlue>;

    get connectionPoints(): foCollection<foConnectionPoint> { return this._connectionPoints || this.createConnectionPoints(); }
    protected _connectionPoints: foCollection<foConnectionPoint>;

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public rotation = (): number => { return this.angle; }


    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            angle: this.angle
        });
    }

    public notifyOnChange(source: any, channel: string, ...args: any[]) {
    }

    notifySource(channel: string, ...args: any[]) {
        this._glue && this._glue.forEach(item => {
            item.mySource().notifyOnChange(item, channel, ...args);
        })
    }

    notifyTarget(channel: string, ...args: any[]) {
        this._glue && this._glue.forEach(item => {
            item.myTarget().notifyOnChange(item, channel, ...args);
        })
    }

    public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN): boolean {
        let changed = super.didLocationChange(x, y, angle);
        if (!Number.isNaN(angle) && this.angle != angle) {
            changed = true;
            this.angle = angle;
        };
        return changed;
    }

    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            this.notifySource('drop', this.getLocation());
            Lifecycle.dropped(this, this.getLocation());
        }
        return this;
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            this.notifySource('drop', this.getLocation());
            Lifecycle.moved(this, this.getLocation());
        }
        return this;
    }

    updateContext(ctx: CanvasRenderingContext2D) {
        let mtx = this.getMatrix();
        ctx.transform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
        ctx.globalAlpha *= this.opacity;
    };

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix2D();
            this._matrix.appendTransform(this.x, this.y, 1, 1, this.rotation(), 0, 0, this.pinX(), this.pinY());
        }
        return this._matrix;
    };


    protected localHitTest = (hit: iPoint): boolean => {

        let loc = this.globalToLocal(hit.x, hit.y);

        if (loc.x < 0) return false;
        if (loc.x > this.width) return false;

        if (loc.y < 0) return false;
        if (loc.y > this.height) return false;

        return true;
    }


    public hitTest = (hit: iPoint, ctx?: CanvasRenderingContext2D): boolean => {
        return this.localHitTest(hit);
    }


    public overlapTest = (hit: iFrame, ctx: CanvasRenderingContext2D): boolean => {
        let frame = this.globalToLocalFrame(hit.x1, hit.y1, hit.x2, hit.y2);

        if (this.localContains(frame.x1, frame.y1)) return true;
        if (this.localContains(frame.x1, frame.y2)) return true;
        if (this.localContains(frame.x2, frame.y1)) return true;
        if (this.localContains(frame.x2, frame.y2)) return true;
        return false;
    }

    public pinLocation() {
        return {
            x: this.pinX(),
            y: this.pinY()
        }
    }

    public moveHandle(handle: foHandle, loc: iPoint) {
        //let pt = handle.localToGlobal(0, 0).subtract(loc.x, loc.y);
        //this.growSize(pt.x, pt.y)
        switch (handle.myName) {
            case '0:0':
                break;
            case 'W:0':
                break;
            case 'W:H':
                break;
            case '0:H':
                break;

        }
        Lifecycle.handle(handle, loc);
    }


    protected getGlue(name: string) {
        let glue = this.glue.findMember(name);
        if (!glue) {
            glue = new foGlue({ myName: name }, this);
            this.addGlue(glue);
        }
        return glue;
    }

    protected establishGlue(name: string, target: foShape2D, handleName?: string) {
        let glue = this.getGlue(name)
        glue.glueTo(target, handleName);
        return glue;
    }

    protected dissolveGlue(name: string) {
        let glue = this.glue.findMember(name);
        glue && glue.unglue();
        return glue;
    }

    public addGlue(glue: foGlue) {
        this.glue.addMember(glue);
        return glue;
    }


    public removeGlue(glue: foGlue) {
        if (this._glue) {
            this.glue.removeMember(glue);
        }
        return glue;
    }

    protected generateConnectionPoints(spec: any): foCollection<foConnectionPoint> {

        if (!this._connectionPoints) {
            this._connectionPoints = new foCollection<foConnectionPoint>()
            spec.forEach(item => {
                let type = item.myType ? item.myType : RuntimeType.define(foConnectionPoint);
                let point = new type(item, undefined, this);
                this._connectionPoints.addMember(point);
            });
        } else {
            let i = 0;
            spec.forEach(item => {
                let point = this._connectionPoints.getChildAt(i++)
                point.override(item);
            });
        }
        return this._connectionPoints;
    }

    public createConnectionPoints(): foCollection<foConnectionPoint> {

        let spec = [
            { x: this.width / 2, y: 0, myName: "top", myType: RuntimeType.define(foConnectionPoint) },
            { x: this.width / 2, y: this.height, myName: "bottom", angle: 45 },
            { x: 0, y: this.height / 2, myName: "left" },
            { x: this.width, y: this.height / 2, myName: "right" },
        ];

        return this.generateConnectionPoints(spec);
    }

    getConnectionPoint(name: string): foConnectionPoint {
        if (!this._connectionPoints) return;
        return this._connectionPoints.findMember(name);
    }

    public findConnectionPoint(loc: cPoint, e): foConnectionPoint {
        if (!this._connectionPoints) return;

        for (var i: number = 0; i < this.connectionPoints.length; i++) {
            let point: foConnectionPoint = this.connectionPoints.getChildAt(i);
            if (point.hitTest(loc)) {
                return point;
            }
        }
    }


    public drawConnectionPoints(ctx: CanvasRenderingContext2D) {
        this.connectionPoints.forEach(item => {
            item.render(ctx);
        })
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
        ctx.beginPath()
        ctx.setLineDash([15, 5]);
        ctx.rect(0, 0, this.width, this.height);
        ctx.stroke();
    }

    public drawSelected = (ctx: CanvasRenderingContext2D): void => {
        ctx.strokeStyle = "red";
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

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foShape2D);

