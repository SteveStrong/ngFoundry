
import { Tools } from '../foundry/foTools'
import { cPoint3D } from '../foundry/foGeometry3D';
import { iPoint3D } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foHandle2D } from '../foundry/foHandle2D'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'

import { foShape3D } from '../foundry/foShape3D.model'
import { foGlyph2D } from '../foundry/foGlyph2D.model'
import { Lifecycle } from './foLifecycle';


export enum shape1DNames {
    start = "start",
    finish = "finish",
    center = "center"
};


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foPipe3D extends foShape3D {

    public thickness: number;

    protected _x1: number;
    protected _y1: number;
    protected _z1: number;
    protected _x2: number;
    protected _y2: number;
    protected _z2: number;

    get startX(): number { return this._x1 || 0.0; }
    set startX(value: number) {
        this.smash();
        this._x1 = value;
    }

    get startY(): number { return this._y1 || 0.0; }
    set startY(value: number) {
        this.smash();
        this._y1 = value;
    }
    get startZ(): number { return this._z1 || 0.0; }
    set startZ(value: number) {
        this.smash();
        this._z1 = value;
    }

    get finishX(): number { return this._x2 || 0.0; }
    set finishX(value: number) {
        this.smash();
        this._x2 = value;
    }
    get finishY(): number { return this._y2 || 0.0; }
    set finishY(value: number) {
        this.smash();
        this._y2 = value;
    }
    get finishZ(): number { return this._z2 || 0.0; }
    set finishZ(value: number) {
        this.smash();
        this._z2 = value;
    }

    get width(): number {
        // if (!this._width) {
        //     let { length } = this.angleDistance();
        //     this._width = length;
        // }
        return this._width || 0.0;
    }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }

    get depth(): number { return this._depth || 0.0; }
    set depth(value: number) { this._depth = value; }

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; };
    public pinZ = (): number => { return 0.5 * this.depth; };

    public begin = (name?: string): cPoint3D => {
        return new cPoint3D(this.startX, this.startY, this.startZ, name)
    }

    public end = (name?: string): cPoint3D => {
        return new cPoint3D(this.finishX, this.finishY, this.finishZ, name)
    }

    public center = (name?: string): cPoint3D => {
        return new cPoint3D((this.startX + this.finishX) / 2, (this.startY + this.finishY) / 2,(this.startZ + this.finishZ) / 2, name);
    }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            startX: this.startX,
            startY: this.startY,
            startZ: this.startZ,
            finishX: this.finishX,
            finishY: this.finishY,
            finishZ: this.finishZ,
            glue: this._glue && Tools.asArray(this.glue.asJson)
        });
    }

    private setStart(point: iPoint3D) {
        this.startX = point.x;
        this.startY = point.y;
        let { x: cX, y: cY } = this.center();
        this.x = cX;
        this.y = cY;
        this.width = 0;
    }

    private setFinish(point: iPoint3D) {
        this.finishX = point.x;
        this.finishY = point.y;
        let { x: cX, y: cY } = this.center();
        this.x = cX;
        this.y = cY;
        this.width = 0;
    }


    private angleDistance(): any {
        let { x: x1, y: y1, z: z1 } = this.begin();
        let { x: x2, y: y2, z: z2 } = this.end();

        let dX = x2 - x1;
        let dY = y2 - y1;
        let dZ = z2 - z1;
        return {
           // angle: foGlyph2D.RAD_TO_DEG * Math.atan2(dY, dX),
            length: Math.sqrt(dX * dX + dY * dY + dZ * dZ),
            cX: (x2 + x1) / 2,
            cY: (y2 + y1) / 2,
            cZ: (z2 + z1) / 2,
        };
    }

    glueStartTo(target: foShape3D, handleName?: string) {
        let glue =  this.establishGlue(shape1DNames.start, target, handleName);
        glue.doTargetMoveProxy = this.setStart.bind(this);
        glue.targetMoved(target.getLocation());
        return glue;
    }

    glueFinishTo(target: foShape3D, handleName?: string) {
        let glue = this.establishGlue(shape1DNames.finish, target, handleName);
        glue.doTargetMoveProxy = this.setFinish.bind(this);
        glue.targetMoved(target.getLocation());
        return glue;
    }

    unglueStart() {
        return this.dissolveGlue(shape1DNames.start);
    }

    unglueFinish() {
        return this.dissolveGlue(shape1DNames.finish);
    }

    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        // let { x: cX, y: cY } = this.center();

        // this.x = Number.isNaN(x) ? cX : x;
        // this.y = Number.isNaN(y) ? cY : y;

        // let mtx = new Matrix2D();
        // mtx.appendTransform(this.x, this.y, 1, 1, ang + this.rotationZ(), 0, 0, cX, cY);
        // let start = mtx.transformPoint(this.startX, this.startY);
        // let finish = mtx.transformPoint(this.finishX, this.finishY);
        // this.startX = start.x;
        // this.startY = start.y;
        // this.finishX = finish.x;
        // this.finishY = finish.y;
        // this.width = 0;
        return this;
    }

    public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN): boolean {
        // let changed = super.didLocationChange(x, y, angle);
        // let { x: cX, y: cY } = this.center();
        // if (!Number.isNaN(x) && this.x != cX) {
        //     changed = true;
        // };
        // if (!Number.isNaN(y) && this.y != cY) {
        //     changed = true;
        // };
        return true;
    }

    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        //if (this.didLocationChange(x, y, angle)) {
            this.initialize(x, y, angle);
            Lifecycle.dropped(this, this.getLocation());
        //}
        return this;
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        this.initialize(x, y, angle);
        Lifecycle.moved(this, this.getLocation());
        return this;
    }



    public createHandles(): foCollection<foHandle2D> {

        let begin = this.globalToLocalPoint(this.begin(shape1DNames.start));
        let center = this.globalToLocalPoint(this.center(shape1DNames.center));
        let end = this.globalToLocalPoint(this.end(shape1DNames.finish));

        Tools.mixin(begin, { size: 20 });
        Tools.mixin(end, { size: 20 });
        Tools.mixin(center, { size: 20 });
        let spec = [begin, center, end];
        let proxy = [this.setStart.bind(this), this.moveTo.bind(this), this.setFinish.bind(this)];

        return this.generateHandles(spec, proxy);
    }



    public drawHandles(ctx: CanvasRenderingContext2D) {
        this.createHandles();
        super.drawHandles(ctx);
    }


}


import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foPipe3D);



