import { Tools } from '../foTools'
import { Matrix4, Vector3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { cPoint3D } from './foGeometry3D';

import { iPoint3D } from '../foInterface';

import { foObject } from '../foObject.model';
import { foGlyph3D } from './foGlyph3D.model';

import { Lifecycle } from '../foLifecycle';
import { BroadcastChange } from '../foChange';

import { foHandle } from '../foHandle';
import { Screen3D } from './threeDriver';


export class foHandle3D extends foHandle {

    get color(): string {
        return this._color || 'cyan';
    }
    get size(): number { return this._size || 10.0; }


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

    protected toJson(): any {
        return Tools.mixin({}, {
            x: this.x,
            y: this.y,
            z: this.z,
            name: this.myName,
            color: this.color,
            size: this.size,
            posW: this.mesh.getWorldPosition()
        });
    }



    constructor(properties?: any, subcomponents?: Array<foHandle3D>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw();
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
            let obj = (geom && mat) && new Mesh(geom, mat);
            if (obj) {
                obj.position.set(this.x, this.y, this.z);
                this._mesh = obj;
            }
        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }
    get hasMesh(): boolean {
        return this._mesh != undefined
    }
    clearMesh() {
        if (!this._mesh) return;
        let parent = this.mesh.parent;
        if (parent) {
            parent.remove(this.mesh);
        }
        this._mesh = undefined;
        this.setupPreDraw();
    }



    public dropAt(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(z)) this.z = z;
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



    alignTo(target: foHandle3D): Vector3 {
        //let parentTarget = target.myParent() as foGlyph3D;
        let parent = this.myParent() as foGlyph3D;

        let point = target.getGlobalPosition();
        let center = this.getGlobalPosition();

        let distance = Math.sqrt(point.distanceToSquared(center));
        let dist = point.add(center.negate());
        if (distance > 1) {
            parent.setGlobalPosition(dist);
        }

        return dist;
    }

    getGlobalMatrix(): Matrix4 {
        let mat = this.mesh.matrixWorld;
        return mat;
    };

    getGlobalInvMatrix(): Matrix4 {
        let mat = this.getGlobalMatrix();
        mat = mat.getInverse(mat);
        return mat;
    };

    getMatrix(): Matrix4 {
        return this.mesh.matrix;
    };

    getInvMatrix(): Matrix4 {
        let mat = this.getMatrix();
        mat = mat.getInverse(mat);
        return mat;
    };

    localToGlobal(pt: Vector3): Vector3 {
        let mat = this.getGlobalMatrix();
        let vec = mat.multiplyVector3(pt);
        return vec;
    };

    globalToLocal(pt: Vector3): Vector3 {
        let inv = this.getGlobalMatrix();
        let vec = inv.multiplyVector3(pt);
        return vec;
    };

    getGlobalPosition(pt?: Vector3): Vector3 {
        this.mesh.updateMatrix();
        let vec = this.mesh.getWorldPosition(pt);
        return vec;
    }

    setGlobalPosition(pt: Vector3): Vector3 {
        this.x = pt.x;
        this.y = pt.y;
        this.z = pt.z;
        return pt;
    }




    public getOffset = (loc: iPoint3D): iPoint3D => {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        return new cPoint3D(x - loc.x, y - loc.y, z - loc.z);
    }



    protected localHitTest = (hit: iPoint3D): boolean => {
        // let { x, y } = hit;
        // let loc = this.globalToLocal(x, y);

        // if (loc.x < 0) return false;
        // if (loc.x > this.size) return false;

        // if (loc.y < 0) return false;
        // if (loc.y > this.size) return false;
        //foObject.beep();
        return true;
    }

    public hitTest = (hit: iPoint3D): boolean => {
        return this.localHitTest(hit);
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            let mesh = this.mesh;
            if (mesh) {
                mesh.name = this.myGuid;
                let parent = this.myParent() as foGlyph3D;
                if (parent && parent.hasMesh) {
                    parent.mesh.add(mesh)
                } else {
                    //this should NEVER be the case
                    screen.addToScene(mesh);
                }

                //should happen during draw
                //mesh.position.set(this.x, this.y, this.z);

                this.preDraw3D = undefined;
            }
        }

        this.preDraw3D = preDraw;
    }

    preDraw3D: (screen: Screen3D) => void;

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        if (!this.hasMesh) return;
        let obj = this.mesh;
        obj.position.set(this.x, this.y, this.z);
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen)
    }

}


