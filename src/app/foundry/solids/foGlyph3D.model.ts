import { Object3D, Matrix3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { Tools } from '../foTools'
import { cPoint3D } from './foGeometry3D';
import { any } from '../foInterface'

import { foObject } from '../foObject.model'


import { foCollection } from '../foCollection.model'
import { foNode } from '../foNode.model'

import { foGlyph } from '../foGlyph.model'
import { Screen3D } from "./threeDriver";


import { Lifecycle } from '../foLifecycle';

// export class foBody3D {
//     protected _opacity: number;
//     protected _color: string;

//     get opacity(): number { return this._opacity || 1; }
//     set opacity(value: number) { this._opacity = value; }

//     get color(): string {
//         return this._color || 'black';
//     }
//     set color(value: string) {
//         this._color = value;
//     }

//     geometry = (spec?: any): Geometry => {
//         return new BoxGeometry(1, 1, 1);
//     }

//     material = (spec?: any): Material => {
//         let props = Tools.mixin({
//             color: this.color,
//             opacity: this.opacity,
//             transparent: this.opacity < 1 ? true : false,
//             wireframe: false
//         }, spec)
//         return new MeshBasicMaterial(props);
//     }

//     protected _mesh: Mesh;
//     get mesh(): Mesh {
//         if (!this._mesh) {
//             let geom = this.geometry()
//             let mat = this.material()
//             this._mesh = (geom && mat) && new Mesh(geom, this.material());
//         }
//         return this._mesh;
//     }
//     set mesh(value: Mesh) { this._mesh = value; }


//     protected _obj3D: Object3D;
//     get obj3D(): Object3D {
//         if (!this._obj3D && this.mesh) {
//             this._obj3D = new Object3D();
//             this._obj3D.name = this.myGuid;
//             this._obj3D.add(this.mesh)
//         }
//         return this._obj3D;
//     }
//     set obj3D(value: Object3D) { this.obj3D = value; }

// }

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foGlyph3D extends foGlyph {

    protected _subcomponents: foCollection<foGlyph3D>;
    get nodes(): foCollection<foGlyph3D> {
        return this._subcomponents;
    }

    protected _x: number;
    protected _y: number;
    protected _z: number;
    protected _width: number;
    protected _height: number;
    protected _depth: number;

    get x(): number { return this._x || 0.0; }
    set x(value: number) {
        this.smash();
        this._x = value;
    }
    get y(): number { return this._y || 0.0 }
    set y(value: number) {
        this.smash();
        this._y = value;
    }

    get z(): number { return this._z || 0.0; }
    set z(value: number) {
        this.smash();
        this._z = value;
    }

    get width(): number { return this._width || 0.0; }
    set width(value: number) { this._width = value; }

    get height(): number { return this._height || 0.0; }
    set height(value: number) { this._height = value; }



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


    protected _matrix: Matrix3;
    protected _invMatrix: Matrix3;
    smash() {
        //console.log('smash matrix')
        this._matrix = undefined;
        this._invMatrix = undefined;

        this.setupPreDraw();
    }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);

        this.setupPreDraw();
    }

    is3D() { return true; }

    public getLocation = (): any => {
        let x = this.x;
        let y = this.y;
        let z = this.z;
        return new cPoint3D(x, y, z);
    }



    geometry = (spec?: any): Geometry => {
        return new BoxGeometry(this.width, this.height, this.depth);
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
            this._mesh = (geom && mat) && new Mesh(geom, this.material());
        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }


    protected _obj3D: Object3D;
    get obj3D(): Object3D {
        if (!this._obj3D && this.mesh) {
            this._obj3D = new Object3D();
            this._obj3D.name = this.myGuid;
            this._obj3D.add(this.mesh)
        }
        return this._obj3D;
    }
    set obj3D(value: Object3D) { this.obj3D = value; }


    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            x: this.x,
            y: this.y,
            z: this.z,
            width: this.width,
            height: this.height,
            depth: this.depth,
            angleX: this.angleX,
            angleY: this.angleY,
            angleZ: this.angleZ,
        });
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            if (this._obj3D) {
                this._obj3D.remove(this._mesh)
                screen.removeFromScene(this._obj3D);

                this._obj3D = this._mesh = undefined;
            }
            let obj3D = this.obj3D;
            if (obj3D) {
                obj3D.position.set(this.x, this.y, this.z);
                obj3D.rotation.set(this.angleX, this.angleY, this.angleZ);
                screen.addToScene(obj3D);
                this.preDraw3D = undefined;
            }

        }

        this.preDraw3D = preDraw;
    }

    preDraw3D: (screen: Screen3D) => void;

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        let obj = this.obj3D;
        if (!obj) return;
        obj.position.set(this.x, this.y, this.z);
        obj.rotation.set(this.angleX, this.angleY, this.angleZ);
        //make changes that support animation here
        //let rot = this.mesh.rotation;
        // rot.x += 0.01;
        // rot.y += 0.02;
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen)
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        this.obj3D.position.set(this.x, this.y, this.z);
        return this;
    }


}

//https://www.typescriptlang.org/docs/handbook/mixins.html

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foGlyph3D);

//RuntimeType.applyMixins(foGlyph3D, [foGlyph2D, foBody3D]);
