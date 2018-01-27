import { Tools } from '../foTools'

import { foGlyph3D } from "./foGlyph3D.model";


import { foGlue3D } from './foGlue3D'
import { foConnectionPoint3D } from './foConnectionPoint3D'
import { foCollection } from '../foCollection.model'
import { foNode } from '../foNode.model'
import { foObject } from '../foObject.model'

import { Lifecycle } from '../foLifecycle';

import { JSONLoader,Object3D, Matrix3, MultiMaterial, Material, Geometry, Mesh } from 'three';

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

    get glue(): foCollection<foGlue3D> {
        if (!this._glue) {
            this._glue = new foCollection<foGlue3D>()
        }
        return this._glue;
    }
    protected _glue: foCollection<foGlue3D>;

    get connectionPoints(): foCollection<foConnectionPoint3D> { return this._connectionPoints || this.createConnectionPoints(); }
    protected _connectionPoints: foCollection<foConnectionPoint3D>;

    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public pinZ = (): number => { return 0.5 * this.depth; }


    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    // protected toJson(): any {
    //     return Tools.mixin(super.toJson(), {
    //         angleX: this.angleX,
    //         angleY: this.angleY,
    //         angleZ: this.angleZ,
    //        // glue: this._glue && Tools.asArray(this.glue.asJson)
    //     });
    // }



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
            glue = new foGlue3D({ myName: name }, this);
            this.addGlue(glue);
        }
        return glue;
    }

    public establishGlue(name: string, target: any, handleName?: string) {
        let glue = this.getGlue(name)
        glue.glueTo(target, handleName);
        return glue;
    }

    public dissolveGlue(name: string) {
        if (this._glue) {
            let glue = this.glue.findMember(name);
            glue && glue.unglue();
            return glue;
        }
    }

    public addGlue(glue: foGlue3D) {
        this.glue.addMember(glue);
        return glue;
    }


    public removeGlue(glue: foGlue3D) {
        if (this._glue) {
            this.glue.removeMember(glue);
        }
        return glue;
    }

    protected generateConnectionPoints(spec: Array<any>, proxy?: Array<any>): foCollection<foConnectionPoint3D> {

        let i = 0;
        if (!this._connectionPoints) {
            this._connectionPoints = new foCollection<foConnectionPoint3D>()
            spec.forEach(item => {
                let type = item.myType ? item.myType : RuntimeType.define(foConnectionPoint3D);
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

    public createConnectionPoints(): foCollection<foConnectionPoint3D> {

        let spec = [
            { x: this.width / 2, y: 0, myName: "top", myType: RuntimeType.define(foConnectionPoint3D) },
            { x: this.width / 2, y: this.height, myName: "bottom", angle: 45 },
            { x: 0, y: this.height / 2, myName: "left" },
            { x: this.width, y: this.height / 2, myName: "right" },
        ];

        return this.generateConnectionPoints(spec);
    }

    getConnectionPoint(name: string): foConnectionPoint3D {
        return this.connectionPoints.findMember(name);
    }


}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foShape3D);
