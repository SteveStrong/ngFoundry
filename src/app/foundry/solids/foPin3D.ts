import { Tools } from '../foTools';
import { Vector3, Geometry, Material, SphereGeometry, Mesh, MeshBasicMaterial } from 'three';

import { foObject } from '../foObject.model';

import { foHandle3D } from './foHandle3D';
import { Screen3D } from './threeDriver';


export class foPin3D extends foHandle3D {

    protected _angleX: number;
    get angleX(): number { return this._angleX || 0.0; }
    set angleX(value: number) {
        this._angleX = value;
    }

    protected _angleY: number;
    get angleY(): number { return this._angleY || 0.0; }
    set angleY(value: number) {
        this._angleY = value;
    }

    protected _angleZ: number;
    get angleZ(): number { return this._angleZ || 0.0; }
    set angleZ(value: number) {
        this._angleZ = value;
    }

    public rotationX = (): number => { return this.angleX; }
    public rotationY = (): number => { return this.angleY; }
    public rotationZ = (): number => { return this.angleZ; }

    get color(): string {
        return this._color || 'pink';
    }
    get size(): number { return this._size || 10.0; }


    constructor(properties?: any, subcomponents?: Array<foHandle3D>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw()
    }

    geometry = (spec?: any): Geometry => {
        return new SphereGeometry(this.size);
    }

    
    material = (spec?: any): Material => {
        let props = Tools.mixin({
            color: this.color,
            transparent: false,
            wireframe: false
        }, spec)
        return new MeshBasicMaterial(props);
    }

    get mesh(): Mesh {
        if (!this._mesh) {
            let geom = this.geometry()
            let mat = this.material()
            let obj = (geom && mat) && new Mesh(geom, mat);
            if (obj) {
                obj.position.set(this.x, this.y, this.z);
                obj.rotation.set(this.angleX, this.angleY, this.angleZ);
                this._mesh = obj;
            }
        }
        return this._mesh;
    }


    setGlobalRotation(pt: Vector3): Vector3 {
        this.angleX = pt.x;
        this.angleY = pt.y;
        this.angleZ = pt.z;
        return pt;
    }


    public dropAt(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(z)) this.z = z;
        return this;
    }

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        let obj = this.mesh;
        if (!obj) return;
        obj.position.set(this.x, this.y, this.z);
        obj.rotation.set(this.angleX, this.angleY, this.angleZ);
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen)
    }


}


import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foPin3D);


