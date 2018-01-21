import { Tools } from '../foundry/foTools'

import { foGlyph3D } from "../foundry/foGlyph3D.model";


import { foGlue } from '../foundry/foGlue'
import { foConnectionPoint } from '../foundry/foConnectionPoint'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'
import { foObject } from '../foundry/foObject.model'

import { Lifecycle } from './foLifecycle';

import { JSONLoader, MultiMaterial, Material, Geometry, Mesh } from 'three';

import { SphereGeometry } from 'three';

export enum shape3DNames {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom",
    front = "front",
    back = "back",
    center = "center"
};

export class foShape3D extends foGlyph3D {

    get glue(): foCollection<foGlue> {
        if (!this._glue) {
            this._glue = new foCollection<foGlue>()
        }
        return this._glue;
    }
    protected _glue: foCollection<foGlue>;

    get connectionPoints(): foCollection<foConnectionPoint> { return this._connectionPoints || this.createConnectionPoints(); }
    protected _connectionPoints: foCollection<foConnectionPoint>;

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public pinZ = (): number => { return 0.5 * this.depth; }


    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            glue: this._glue && Tools.asArray(this.glue.asJson)
        });
    }



    public dropAt(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            let point = this.getLocation();
            this._glue && this.glue.forEach(item => {
                item.targetMoved(point);
            })
            Lifecycle.dropped(this, point);
        }
        return this;
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        if (this.didLocationChange(x, y, angle)) {
            let point = this.getLocation();
            this._glue && this.glue.forEach(item => {
                item.targetMoved(point);
            })
            Lifecycle.moved(this, point);
        }
        return this;
    }



    public pinLocation() {
        return {
            x: this.pinX(),
            y: this.pinY(),
            z: this.pinZ()
        }
    }

    protected getGlue(name: string) {
        let glue = this.glue.findMember(name);
        if (!glue) {
            glue = new foGlue({ myName: name }, this);
            this.addGlue(glue);
        }
        return glue;
    }

    public establishGlue(name: string, target: foShape3D, handleName?: string) {
        let glue = this.getGlue(name)
        //glue.glueTo(target, handleName);
        return glue;
    }

    public dissolveGlue(name: string) {
        if (this._glue) {
            let glue = this.glue.findMember(name);
            glue && glue.unglue();
            return glue;
        }
    }

    public addGlue(glue: foGlue) {
        this.glue.addMember(glue);
        return glue;
    }


    public removeGlue(glue: foGlue) {
        if (this._glue) {
            this.glue.removeMember(glue);
        }
        return glue;
    }

    protected generateConnectionPoints(spec: Array<any>, proxy?: Array<any>): foCollection<foConnectionPoint> {

        let i = 0;
        if (!this._connectionPoints) {
            this._connectionPoints = new foCollection<foConnectionPoint>()
            spec.forEach(item => {
                let type = item.myType ? item.myType : RuntimeType.define(foConnectionPoint);
                let point = new type(item, undefined, this);
                point.doMoveProxy = proxy && proxy[i];
                this._connectionPoints.addMember(point);
                i++;
            });
        } else {
            spec.forEach(item => {
                let point = this._connectionPoints.getChildAt(i)
                point.override(item);
                point.doMoveProxy = proxy && proxy[i];
                i++;
            });
        }
        return this._connectionPoints;
    }

    public createConnectionPoints(): foCollection<foConnectionPoint> {

        let spec = [
            { x: this.width / 2, y: 0, myName: "top", myType: RuntimeType.define(foConnectionPoint) },
            { x: this.width / 2, y: this.height, myName: "bottom", angle: 45 },
            { x: 0, y: this.height / 2, myName: "left" },
            { x: this.width, y: this.height / 2, myName: "right" },
        ];

        return this.generateConnectionPoints(spec);
    }

    getConnectionPoint(name: string): foConnectionPoint {
        return this.connectionPoints.findMember(name);
    }


}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foShape3D);

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