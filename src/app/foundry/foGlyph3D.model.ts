import { Object3D, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';

import { Tools } from '../foundry/foTools'
import { cPoint2D } from '../foundry/foGeometry2D';
import { iPoint2D, iFrame } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foGlue } from '../foundry/foGlue'
import { foConnectionPoint } from '../foundry/foConnectionPoint'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'

import { foGlyph2D } from '../foundry/foGlyph2D.model'
import { Screen3D } from "../foundryDrivers/threeDriver";


import { Lifecycle } from './foLifecycle';


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foGlyph3D extends foGlyph2D {

    protected _subcomponents: foCollection<foGlyph3D>;
    protected _z: number;
    get z(): number { return this._z || 0.0; }
    set z(value: number) {
        this.smash();
        this._z = value;
    }

    protected _depth: number;
    get depth(): number { return this._depth || 0.0; }
    set depth(value: number) { this._depth = value; }

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

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    is2D() { return false; }
    is3D() { return true; }


    geometry = (spec?:any):Geometry => {
        return new BoxGeometry(this.width, this.height, this.depth);
    }

    material = (spec?:any):Material => {
        let props = Tools.mixin({
            color: this.color, 
            wireframe: false 
        }, spec)
        return new MeshBasicMaterial(props);
    }

    protected _mesh: Mesh;
    get mesh(): Mesh {
        if (!this._mesh) {
            this._mesh = new Mesh(this.geometry(), this.material());
        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }


    protected _obj3D: Object3D;
    get obj3D(): Object3D {
        if (!this._obj3D) {
            this._obj3D = new Object3D();
            this._obj3D.name = this.myGuid;
            this._obj3D.add(this.mesh)
        }
        return this._obj3D;
    }
    set obj3D(value: Object3D) { this.obj3D = value; }


    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            z: this.z,
            depth: this.depth,
            angleX: this.angleX,
            angleY: this.angleY,
            angleZ: this.angleZ,
        });
    }

    addAsSubcomponent(parent: foNode, properties?: any) {
        let result = super.addAsSubcomponent(parent, properties);
        return result;
    }


    preRender3D = (screen: Screen3D) => {
        if ( !this._obj3D) {
            this.obj3D.position.set(this.x, this.y, this.z);
            this.obj3D.rotation.set(this.angleX, this.angleY, this.angleZ);
            screen.addToScene(this.obj3D);
        }
    }

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        let obj = this.obj3D;

        obj.position.set(this.x, this.y, this.z);
        obj.rotation.set(this.angleX, this.angleY, this.angleZ);
        //make changes that support animation here
         //let rot = this.mesh.rotation;
        // rot.x += 0.01;
        // rot.y += 0.02;
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preRender3D && this.preRender3D(screen)
        this.draw3D && this.draw3D(screen)
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        super.move(x,y,angle);
        this.obj3D.position.set(this.x, this.y, this.z);
        return this;
    }


}