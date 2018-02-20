import { Tools } from '../foTools'

import { foGlyph3D } from "./foGlyph3D.model";
import { Geometry, BoxGeometry, Vector3 } from 'three';
import { cPoint3D } from './foGeometry3D';

import { foGlue3D } from './foGlue3D'
import { foConnectionPoint3D } from './foConnectionPoint3D'
import { foCollection } from '../foCollection.model'

import { foObject } from '../foObject.model'

import { Screen3D } from "./threeDriver";

import { Lifecycle } from '../foLifecycle';

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

    protected _glue: foCollection<foGlue3D>;
    get glue(): foCollection<foGlue3D> {
        if (!this._glue) {
            this._glue = new foCollection<foGlue3D>()
        }
        return this._glue;
    }

    protected _connectionPoints: foCollection<foConnectionPoint3D>;
    get connectionPoints(): foCollection<foConnectionPoint3D> {
        this._connectionPoints || this.createConnectionPoints();
        return this._connectionPoints;
    }


    public pinX = (): number => { return 0.5 * this.width; }
    public pinY = (): number => { return 0.5 * this.height; }
    public pinZ = (): number => { return 0.5 * this.depth; }

    pinVector(): Vector3 {
        return new Vector3(
            this.pinX() - 0.5 * this.width,
            this.pinY() - 0.5 * this.height,
            this.pinZ() - 0.5 * this.depth,
        )
    }

    protected originPosition(): Vector3 {
        let pin = this.pinVector();
        return new Vector3(
            this.x - pin.x,
            this.y - pin.y,
            this.z - pin.z,
        )
    }

    public pinLocation() {
        return {
            x: this.pinX() - 0.5 * this.width,
            y: this.pinY() - 0.5 * this.height,
            z: this.pinZ() - 0.5 * this.depth,
        }
    }

    constructor(properties?: any, subcomponents?: Array<foGlyph3D>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw()
    }

    public center = (name?: string): cPoint3D => {
        return new cPoint3D(this.x, this.y, this.z, name);
    }


    // protected toJson(): any {
    //     if (!this._connectionPoints) {
    //         return super.toJson();
    //     }

    //     return Tools.mixin(super.toJson(), {
    //         list: this.connectionPoints.map(item => {
    //             return item.toJson();
    //         })
    //     });
    // }

    geometry = (spec?: any): Geometry => {
        return new BoxGeometry(this.width, this.height, this.depth);
    }


    enforceGlue() {
        this.afterMeshCreated = () => {
            this.glue.forEach(item => {
                item.targetMovedSyncGlue();
            })
        }
    }


    protected getGlue(name?: string) {
        let glue = name && this.glue.findMember(name);
        if (!glue) {
            glue = new foGlue3D({ myName: name }, this);
            this.addGlue(glue);
        }
        return glue;
    }

    public establishGlue(sourceName: string, target: foShape3D, targetName?: string) {
        let glue = this.getGlue(`${this.myGuid}:${sourceName}->${target.myGuid}:${targetName}`);
        glue.glueTo(sourceName, target, targetName);
        glue.doTargetMoveProxy = glue.enforceAlignTo.bind(glue);
        this.enforceGlue();
        return glue;
    }

    public glueConnectionPoints(target: foShape3D, sourceHandle?: string, targetHandle?: string) {
        let glue = this.establishGlue(sourceHandle ? sourceHandle : shape3DNames.center, target, targetHandle ? targetHandle : shape3DNames.center);
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

        let w = this.width / 2;
        let h = this.height / 2;
        let d = this.depth / 2;
        let spec = [
            { x: 0, y: h, z: 0, myName: shape3DNames.top, myType: RuntimeType.define(foConnectionPoint3D) },
            { x: 0, y: -h, z: 0, myName: shape3DNames.bottom },
            { x: w, y: 0, z: 0, myName: shape3DNames.left },
            { x: -w, y: 0, z: 0, myName: shape3DNames.right },
            { x: 0, y: 0, z: d, myName: shape3DNames.front },
            { x: 0, y: 0, z: -d, myName: shape3DNames.back },
            { x: 0, y: 0, z: 0, myName: shape3DNames.center },
        ];

        return this.generateConnectionPoints(spec);
    }

    getConnectionPoint(name?: string): foConnectionPoint3D {
        let pntName = name ? name : shape3DNames.center;
        return this.connectionPoints.findMember(pntName);
    }

    public drawConnectionPoints(screen: Screen3D) {
        this.connectionPoints.forEach(item => {
            item.render3D(screen);
        })
    }



    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen);

        this.drawPin(screen);
        //this.drawHandles(screen);
        //this.drawConnectionPoints(screen);
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foShape3D);
