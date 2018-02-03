import { Object3D, Matrix3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { foObject } from '../foObject.model';
import { foComponent } from '../foComponent.model';

import { foHandle3D } from './foHandle3D';
import { Screen3D } from './threeDriver';


export class foConnectionPoint3D extends foHandle3D {

    protected _angleX: number;
    get angleX(): number { return this._angleX || 0.0; }
    set angleX(value: number) {
        this.smash();
        this._angleX = value;
    }

    protected _angleY: number;
    get angleY(): number { return this._angleY || 0.0; }
    set angleY(value: number) {
        this.smash();
        this._angleY = value;
    }

    protected _angleZ: number;
    get angleZ(): number { return this._angleZ || 0.0; }
    set angleZ(value: number) {
        this.smash();
        this._angleZ = value;
    }

    public rotationX = (): number => { return this.angleX; }
    public rotationY = (): number => { return this.angleY; }
    public rotationZ = (): number => { return this.angleZ; }

    get color(): string {
        return this._color || 'pink';
    }
    get size(): number { return this._size || 15.0; }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw()
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


