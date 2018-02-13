import { Tools } from '../foTools'

import { foShape3D } from "./foShape3D.model";


import { foGlue3D } from './foGlue3D'
import { foConnectionPoint3D } from './foConnectionPoint3D'
import { foCollection } from '../foCollection.model'
import { foNode } from '../foNode.model'
import { foObject } from '../foObject.model'

import { Screen3D } from "./threeDriver";

import { Lifecycle } from '../foLifecycle';

import { JSONLoader, Object3D, Matrix3, MultiMaterial, Material, Geometry, Mesh } from 'three';

import { SphereGeometry, ConeGeometry } from 'three';


export class foSphere extends foShape3D {
    radius: number;
    geometry = (spec?: any): Geometry => {
        return new SphereGeometry(this.radius);
    }
}

export class foCone extends foShape3D {
    radius: number;
    geometry = (spec?: any): Geometry => {
        return new ConeGeometry(this.radius, this.height);
    }
}

export class foModel3D extends foShape3D {
    url: string;
    private _geometry;
    private _material;

    constructor(properties?: any, subcomponents?: Array<foShape3D>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw()
    }

    geometry = (spec?: any): Geometry => {
        return this._geometry;
    }

    material = (spec?: any): Material => {
        return new MultiMaterial(this._material);
    }

    asyncModelLoader() {
        let self = this;
        let url = this.url || "assets/models/707.js";
        new JSONLoader().load(url, (geometry, materials) => {
            self._geometry = geometry;
            self._material = materials;
            self.setupPreDraw();
        });
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            this.preDraw3D = undefined;

            if (!this._geometry && !this._material) {
                this.asyncModelLoader()
            } else {
                let mesh = this.mesh;
                mesh.name = this.myGuid;
                let parent = this.myParent() as foShape3D;
                if (parent && parent.hasMesh) {
                    parent.mesh.add(mesh)
                } else {
                    screen.addToScene(mesh);
                }
            }

        }

        this.preDraw3D = preDraw;
    }

    //mesh might be loading...
    draw3D = (screen: Screen3D, deep: boolean = true) => {
        if (!this.hasMesh) return;
        let obj = this.mesh;
        obj.position.set(this.x, this.y, this.z);
        obj.rotation.set(this.angleX, this.angleY, this.angleZ);
    };

    public createConnectionPoints(): foCollection<foConnectionPoint3D> {
        return this.generateConnectionPoints([]);
    }
}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foShape3D);