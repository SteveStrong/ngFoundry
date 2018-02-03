import { Tools } from '../foTools'
import { Object3D, Matrix3, Vector3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { cPoint3D } from './foGeometry3D';

import { iPoint3D } from '../foInterface';

import { foObject } from '../foObject.model';
import { foGlyph3D } from './foGlyph3D.model';
import { foComponent } from '../foComponent.model';

import { Lifecycle } from '../foLifecycle';
import { BroadcastChange } from '../foChange';

import { foHandle } from '../foHandle';
import { Screen3D } from './threeDriver';
import { foGlue3D } from 'app/foundry/solids/foGlue3D';

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

    smash() {
        this.setupPreDraw();
    }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
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
            if ( obj){
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
        if ( !this._mesh) return;
        let parent = this.mesh.parent;
        if (parent) {
            parent.remove(this.mesh);
        }
        this._mesh == undefined;
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


    getGlobalMatrix() {
        // let mtx = new Matrix3(this.getMatrix());
        // let parent = <foGlyph2D>this.myParent()
        // if (parent) {
        //     mtx.prependMatrix(parent.getGlobalMatrix());
        // }
        return new Matrix3();
    };

    getMatrix() {
        return this.mesh.matrix;
    };

    getInvMatrix() {
        let mat = this.getMatrix();
        mat = mat.getInverse(mat);
        return mat;
    };

    localToGlobal(x: number, y: number, pt?: cPoint3D) {
        let mtx = this.getGlobalMatrix();
        return mtx; // mtx.transformPoint(x, y, pt);
    };

    globalToLocal(x: number, y: number, pt?: cPoint3D) {
        let inv = this.getGlobalMatrix();
        return inv; // inv.transformPoint(x, y, pt);
    };

    localToGlobalPoint(pt: cPoint3D): cPoint3D {
        //let mtx = this.getGlobalMatrix(new Vector3());
        //return  mtx.transformPoint(pt.x, pt.y, pt);
        return pt;
    };

    globalCenter(pt?: cPoint3D): cPoint3D {
        this.mesh.updateMatrix();
        let vec = this.mesh.getWorldPosition();
        return new cPoint3D(vec[0], vec[1], vec[2]);
    };

    getGlobalPosition(pt?: Vector3): Vector3 {
        this.mesh.updateMatrix();
        let vec = this.mesh.getWorldPosition(pt);
        return vec;
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
                if ( parent && parent.hasMesh ) {
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
        //obj.position.set(this.x, this.y, this.z);
        //obj.rotation.set(this.angleX, this.angleY, this.angleZ);
        //make changes that support animation here
        //let rot = this.mesh.rotation;
        // rot.x += 0.01;
        // rot.y += 0.02;
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen)
    }

}


