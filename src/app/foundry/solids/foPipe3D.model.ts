
import { Tools } from '../foTools'
import { cPoint3D } from './foGeometry3D';
import { iPoint3D } from '../foInterface'

import { foObject } from '../foObject.model'

import { foCollection } from '../foCollection.model'
import { foGlyph3D } from './foGlyph3D.model'

import { foShape3D } from './foShape3D.model'
import { LineCurve3, Vector3, TubeGeometry, Material, Geometry, MeshBasicMaterial, Matrix3, Mesh } from 'three';

import { foHandle3D } from './foHandle3D'
import { foConnectionPoint3D } from './foConnectionPoint3D'
import { Lifecycle } from '../foLifecycle';


export enum pipe3DNames {
    start = "start",
    finish = "finish",
    center = "center"
};

//https://stackoverflow.com/questions/43432263/simulate-air-flowing-through-a-pipe-in-three-js


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

    protected _segments: number;
    protected _radiusSegments: number;

    get segments(): number { return this._segments || 10; }
    set segments(value: number) {
        value != this._segments && this.clearMesh();
        this._segments = value;
    }
    get radiusSegments(): number { return this._radiusSegments || 10; }
    set radiusSegments(value: number) {
        value != this._radiusSegments && this.clearMesh();
        this._radiusSegments = value;
    }

    get startX(): number { return this._x1 || 0.0; }
    set startX(value: number) {
        value != this._x1 && this.clearMesh();
        this._x1 = value;
    }

    get startY(): number { return this._y1 || 0.0; }
    set startY(value: number) {
        value != this._y1 && this.clearMesh();
        this._y1 = value;
    }
    get startZ(): number { return this._z1 || 0.0; }
    set startZ(value: number) {
        value != this._z1 && this.clearMesh();
        this._z1 = value;
    }

    get finishX(): number { return this._x2 || 0.0; }
    set finishX(value: number) {
        value != this._x2 && this.clearMesh();
        this._x2 = value;
    }
    get finishY(): number { return this._y2 || 0.0; }
    set finishY(value: number) {
        value != this._y2 && this.clearMesh();
        this._y2 = value;
    }
    get finishZ(): number { return this._z2 || 0.0; }
    set finishZ(value: number) {
        value != this._z2 && this.clearMesh();
        this._z2 = value;
    }

    get width(): number {
        if (!this._width) {
            let { length } = this.angleDistance();
            this._width = length;
        }
        return this._width || 0.0;
    }
    set width(value: number) {
        value != this._width && this.clearMesh();
        this._width = value;
    }

    get height(): number { return this._height || 0.0; }
    set height(value: number) {
        value != this._height && this.clearMesh();
        this._height = value;
    }

    get depth(): number { return this._depth || 0.0; }
    set depth(value: number) {
        value != this._depth && this.clearMesh();
        this._depth = value;
    }

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
        return new cPoint3D((this.startX + this.finishX) / 2, (this.startY + this.finishY) / 2, (this.startZ + this.finishZ) / 2, name);
    }

    constructor(properties?: any, subcomponents?: Array<foGlyph3D>, parent?: foObject) {
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

    enforceStart(glue: foGlue3D) {
        let target = glue.targetHandle ? glue.targetHandle : glue.myTarget();
        target && this.startAt(target.getGlobalPosition())
    }

    public startAt(point: Vector3) {
        this.startX = point.x;
        this.startY = point.y;
        this.startZ = point.z;
        this.recomputeCenter();
    }

    enforceFinish(glue: foGlue3D) {
        let target = glue.targetHandle ? glue.targetHandle : glue.myTarget();
        target && this.finishAt(target.getGlobalPosition())
    }

    public finishAt(point: Vector3) {
        this.finishX = point.x;
        this.finishY = point.y;
        this.finishZ = point.z;
        this.recomputeCenter();
    }

    private recomputeCenter() {
        let { x: cX, y: cY, z: cZ } = this.center();
        this.x = 0 * cX;
        this.y = 0 * cY;
        this.z = 0 * cZ;
        this.width = 0;
    }



    //https://threejs.org/docs/#api/geometries/TubeGeometry

    geometry = (spec?: any): Geometry => {
        let begin = this.begin();
        let end = this.end();
        let curve = new LineCurve3(begin, end)
        let radius = (this.height + this.depth) / 2;
        return new TubeGeometry(curve, this.segments, radius, this.radiusSegments, false);
    }

    material = (spec?: any): Material => {
        let props = Tools.mixin({
            color: this.color,
            opacity: this.opacity,
            transparent: this.opacity < 1 ? true : false,
            wireframe: false
        }, spec)
        return new MeshBasicMaterial(props);
    }

    // get mesh(): Mesh {
    //     if (!this._mesh) {
    //         let geom = this.geometry()
    //         let mat = this.material()
    //         let obj = (geom && mat) && new Mesh(geom, mat);
    //         if (obj) {
    //             obj.position.set(this.x, this.y, this.z);
    //             // obj.rotation.set(this.angleX, this.angleY, this.angleZ);
    //             this._mesh = obj;
    //         }

    //     }
    //     return this._mesh;
    // }
    // clearMesh() {
    //     if (!this._mesh) return;
    //     let parent = this.mesh.parent;
    //     if (parent) {
    //         parent.remove(this.mesh);
    //     }
    //     this._mesh = undefined;
    //     this.setupPreDraw();
    // }


    private angleDistance(): any {
        let { x: x1, y: y1, z: z1 } = this.begin();
        let { x: x2, y: y2, z: z2 } = this.end();

        let dX = x2 - x1;
        let dY = y2 - y1;
        let dZ = z2 - z1;
        return {
            length: Math.sqrt(dX * dX + dY * dY + dZ * dZ),
            cX: (x2 + x1) / 2,
            cY: (y2 + y1) / 2,
            cZ: (z2 + z1) / 2,
        };
    }

    public establishGlue(sourceName: string, target: foShape3D, targetName?: string) {
        let binding = {}
        binding[pipe3DNames.start] = this.enforceStart.bind(this);
        binding[pipe3DNames.finish] = this.enforceFinish.bind(this);

        let glue = this.getGlue(`${this.myGuid}:${sourceName}->${target.myGuid}:${targetName}`);
        glue.glueTo(sourceName, target, targetName);
        glue.doTargetMoveProxy = binding[sourceName];
        this.enforceGlue();
        return glue;
    }

    public glueStartTo(target: foShape3D, handleName?: string) {
        let glue = this.glueConnectionPoints(target, pipe3DNames.start, handleName);
        this.enforceGlue();
        return glue;
    }

    public glueFinishTo(target: foShape3D, handleName?: string) {
        let glue = this.glueConnectionPoints(target, pipe3DNames.finish, handleName);
        this.enforceGlue();
        return glue;
    }

    public unglueStart() {
        let glue = this.dissolveGlue(pipe3DNames.start);
        if (glue) {
            this.enforceGlue();
        }
        return glue;
    }

    public unglueFinish() {
        let glue = this.dissolveGlue(pipe3DNames.finish);
        if (glue) {
            this.enforceGlue();
        }
        return glue;
    }

    // public initialize(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN) {
    //     let { x: cX, y: cY, z: cZ } = this.center();

    //     this.x = Number.isNaN(x) ? cX : x;
    //     this.y = Number.isNaN(y) ? cY : y;
    //     this.z = Number.isNaN(z) ? cZ : z;

    //     let mtx = new Matrix3();
    //     //mtx.set(this.x, this.y, 1, 1, ang + this.rotationZ(), 0, 0, cX, cY);
    //     // let start = mtx.transformPoint(this.startX, this.startY);
    //     // let finish = mtx.transformPoint(this.finishX, this.finishY);
    //     // this.startX = start.x;
    //     // this.startY = start.y;
    //     // this.finishX = finish.x;
    //     // this.finishY = finish.y;
    //     this.width = 0;
    //     return this;
    // }

    public createHandles(): foCollection<foHandle3D> {

        let begin = this.begin(pipe3DNames.start);
        let center = this.center(pipe3DNames.center);
        let end = this.end(pipe3DNames.finish);

        Tools.mixin(begin, { size: 20 });
        Tools.mixin(end, { size: 20 });
        Tools.mixin(center, { size: 20 });
        let spec = [begin, center, end];
        let proxy = [this.startAt.bind(this), this.moveTo.bind(this), this.finishAt.bind(this)];

        return this.generateHandles(spec, proxy);
    }

    public createConnectionPoints(): foCollection<foConnectionPoint3D> {
        return this.generateConnectionPoints([]);
    }

    // public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN): boolean {
    //     let changed = super.didLocationChange(x, y, z);
    //     let { x: cX, y: cY, z: cZ } = this.center();
    //     if (!Number.isNaN(x) && this.x != cX) {
    //         changed = true;
    //     };
    //     if (!Number.isNaN(y) && this.y != cY) {
    //         changed = true;
    //     };
    //     if (!Number.isNaN(z) && this.z != cZ) {
    //         changed = true;
    //     };
    //     return changed;
    // }

    // public dropAt(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN) {
    //     if (this.didLocationChange(x, y, z)) {
    //         this.initialize(x, y, z);
    //         Lifecycle.dropped(this, this.getLocation());
    //     }
    //     return this;
    // }

    public move(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN) {
        this.initialize(x, y, z);
        Lifecycle.moved(this, this.getLocation());
        return this;
    }

    public moveTo(loc: iPoint3D, offset?: iPoint3D) {
        let x = loc.x + (offset ? offset.x : 0);
        let y = loc.y + (offset ? offset.y : 0);
        let z = loc.z + (offset ? offset.z : 0);
        return this.move(x, y, z);
    }



}


import { RuntimeType } from '../foRuntimeType';
import { foGlue3D } from 'app/foundry/solids/foGlue3D';
RuntimeType.define(foPipe3D);



