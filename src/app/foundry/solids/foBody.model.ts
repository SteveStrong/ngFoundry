import { Tools } from '../foTools'

import { foShape3D } from "./foShape3D.model";


import { foGlue3D } from './foGlue3D'
import { foConnectionPoint3D } from './foConnectionPoint3D'
import { foCollection } from '../foCollection.model'
import { foNode } from '../foNode.model'


import { Lifecycle } from '../foLifecycle';

import { JSONLoader, Object3D, Matrix3, MultiMaterial, Material, Geometry, Mesh } from 'three';

import { SphereGeometry } from 'three';


export class foSphere extends foShape3D {
    radius: number;
    geometry = (spec?: any): Geometry => {
        return new SphereGeometry(this.radius);
    }
}

export class foModel3D extends foShape3D {
    url: string;
    private _geometry;
    private _material;


    get mesh(): Mesh {
        if (!this._mesh && this._geometry && this._material) {
            let geom = this.geometry()
            let mat = this.material()
            this._mesh = (geom && mat) && new Mesh(geom, this.material());
        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }

    geometry = (spec?: any): Geometry => {
        return this._geometry;
    }

    material = (spec?: any): Material => {
        return new MultiMaterial(this._material);
    }



    //deep hook for syncing matrix2d with geometry 
    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        let self = this;
        let url = this.url || "assets/models/707.js";
        new JSONLoader().load(url, (geometry, materials) => {
            self._geometry = geometry;
            self._material = materials;
            self.smash();
        });
        return this;
    };


}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foShape3D);