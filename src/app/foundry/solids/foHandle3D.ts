import { Tools } from '../foTools'
import { Object3D, Matrix3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { cPoint3D } from './foGeometry3D';

import { iPoint3D, iPoint } from '../foInterface';

import { foObject } from '../foObject.model';
import { foNode } from '../foNode.model';
import { foComponent } from '../foComponent.model';

import { Lifecycle } from '../foLifecycle';
import { BroadcastChange } from '../foChange';

import { foHandle } from '../foGlyph.model';
import { Screen3D } from './threeDriver';

export class foHandle3D extends foHandle {

    protected _x: number;
    protected _y: number;
    protected _z: number;

    get x(): number { return this._x || 0.0; }
    set x(value: number) {
        this._x = value;
    }
    get y(): number { return this._y || 0.0 }
    set y(value: number) {
        this._y = value;
    }
    get z(): number { return this._z || 0.0 }
    set z(value: number) {
        this._z = value;
    }


    // public drawHover: (ctx: CanvasRenderingContext2D) => void;
    // public preDraw: (ctx: CanvasRenderingContext2D) => void;
    // public postDraw: (ctx: CanvasRenderingContext2D) => void;

    protected _matrix: Matrix3;
    protected _invMatrix: Matrix3;
    smash() {
        //console.log('smash matrix')
        this._matrix = undefined;
        this._invMatrix = undefined;

        this.setupPreDraw();
    }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    geometry = (spec?: any): Geometry => {
        return new BoxGeometry(this.size, this.size, this.size);
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


    protected _mesh: Mesh;
    get mesh(): Mesh {
        if (!this._mesh) {
            let geom = this.geometry()
            let mat = this.material()
            this._mesh = (geom && mat) && new Mesh(geom, this.material());
        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }


    protected _obj3D: Object3D;
    get obj3D(): Object3D {
        if (!this._obj3D && this.mesh) {
            this._obj3D = new Object3D();
            this._obj3D.name = this.myGuid;
            this._obj3D.add(this.mesh)
        }
        return this._obj3D;
    }
    set obj3D(value: Object3D) { this.obj3D = value; }


    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        return this;
    }

    public moveTo(loc: iPoint3D, offset?: iPoint3D) {
        //let x = loc.x + (offset ? offset.x : 0);
        //let y = loc.y + (offset ? offset.y : 0);

        this.doMoveProxy && this.doMoveProxy(loc);
        BroadcastChange.moved(this, loc)
        Lifecycle.handle(this, loc);
        return this;
    }


    getGlobalMatrix() {
        // let mtx = new Matrix3(this.getMatrix());
        // let parent = <foGlyph2D>this.myParent()
        // if (parent) {
        //     mtx.prependMatrix(parent.getGlobalMatrix());
        // }
        return new Matrix3();
    };

    getMatrix() {
        if (this._matrix === undefined) {
            this._matrix = new Matrix3();
            let delta = this.size / 2;
            this._matrix.appendTransform(this.x, this.y, 1, 1, 0, 0, 0, delta, delta);
        }
        return this._matrix;
    };

    getInvMatrix() {
        if (this._invMatrix === undefined) {
            this._invMatrix = this.getMatrix().invertCopy();
        }
        return this._invMatrix;
    };

    localToGlobal(x: number, y: number, pt?: cPoint3D) {
        let mtx = this.getGlobalMatrix();
        return mtx.transformPoint(x, y, pt);
    };

    globalToLocal(x: number, y: number, pt?: cPoint3D) {
        let inv = this.getGlobalMatrix().invertCopy();
        return inv.transformPoint(x, y, pt);
    };

    localToGlobalPoint(pt: cPoint3D): cPoint3D {
        let mtx = this.getGlobalMatrix();
        return mtx.transformPoint(pt.x, pt.y, pt);
    };

    globalCenter(): cPoint3D {
        let { x, y } = this.pinLocation();
        let mtx = this.getGlobalMatrix();
        return mtx.transformPoint(x, y);
    };

    public getOffset = (loc: iPoint3D): iPoint3D => {
        let x = this.x;
        let y = this.y;
        return new cPoint3D(x - loc.x, y - loc.y);
    }



    protected localHitTest = (hit: iPoint): boolean => {
        let { x, y } = hit as iPoint3D
        let loc = this.globalToLocal(x, y);

        if (loc.x < 0) return false;
        if (loc.x > this.size) return false;

        if (loc.y < 0) return false;
        if (loc.y > this.size) return false;
        //foObject.beep();
        return true;
    }

    public hitTest = (hit: iPoint): boolean => {
        return this.localHitTest(hit);
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            if (this._obj3D) {
                this._obj3D.remove(this._mesh)
                screen.removeFromScene(this._obj3D);

                this._obj3D = this._mesh = undefined;
            }
            let obj3D = this.obj3D;
            if (obj3D) {
                obj3D.position.set(this.x, this.y, this.z);
                screen.addToScene(obj3D);
                this.preDraw3D = undefined;
            }

        }

        this.preDraw3D = preDraw;
    }

    preDraw3D: (screen: Screen3D) => void;

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        let obj = this.obj3D;
        if (!obj) return;
        obj.position.set(this.x, this.y, this.z);
        //obj.rotation.set(this.angleX, this.angleY, this.angleZ);
        //make changes that support animation here
        //let rot = this.mesh.rotation;
        // rot.x += 0.01;
        // rot.y += 0.02;
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen)
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

}


