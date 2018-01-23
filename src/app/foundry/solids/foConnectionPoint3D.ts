import { Object3D, Matrix3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { foObject } from '../foObject.model';
import { foComponent } from '../foComponent.model';

import { foHandle3D } from './foHandle3D';


export class foConnectionPoint3D extends foHandle3D {

    protected _angle: number;
    get angle(): number { return this._angle || 0.0; }
    set angle(value: number) {
        this.smash();
        this._angle = value;
    }
    public rotation = (): number => { return this.angle; }

    get color(): string {
        return this._color || 'pink';
    }
    get size(): number { return this._size || 15.0; }


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }


    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (!Number.isNaN(x)) this.x = x;
        if (!Number.isNaN(y)) this.y = y;
        if (!Number.isNaN(angle)) this.angle = angle;
        return this;
    }



    // getMatrix() {
    //     if (this._matrix === undefined) {
    //         this._matrix = new Matrix3();
    //         let delta = this.size / 2;
    //         this._matrix.appendTransform(this.x, this.y, 1, 1, this.rotation(), 0, 0, delta, delta);
    //     }
    //     return this._matrix;
    // };



}


