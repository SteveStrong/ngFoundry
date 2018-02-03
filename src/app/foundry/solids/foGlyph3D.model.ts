import { Object3D, Matrix3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { Tools } from '../foTools'
import { cPoint3D } from './foGeometry3D';

import { foObject } from '../foObject.model'


import { foCollection } from '../foCollection.model'
import { foNode } from '../foNode.model'

import { foGlyph } from '../foGlyph.model'
import { foHandle3D } from './foHandle3D'

import { Screen3D } from "./threeDriver";


import { Lifecycle } from '../foLifecycle';



//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foGlyph3D extends foGlyph {

    protected _subcomponents: foCollection<foGlyph3D>;
    get nodes(): foCollection<foGlyph3D> {
        return this._subcomponents;
    }
    protected _handles: foCollection<foHandle3D>;
    get handles(): foCollection<foHandle3D> {
        this._handles || this.createHandles();
        return this._handles;
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


    public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN): boolean {
        let changed = false;
        if (!Number.isNaN(x) && this.x != x) {
            changed = true;
            this.x = x;
        };

        if (!Number.isNaN(y) && this.y != y) {
            changed = true;
            this.y = y;
        };

        if (!Number.isNaN(z) && this.z != z) {
            changed = true;
            this.z = z;
        };

        return changed;
    }

    public dropAt(x: number = Number.NaN, y: number = Number.NaN, z: number = Number.NaN) {
        if (this.didLocationChange(x, y, z)) {
            this.obj3D.position.set(this.x, this.y, this.z)
            Lifecycle.dropped(this, this.getLocation());
        }
        return this;
    }

    is3D() { return true; }

    public getLocation = (): any => {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
        }
    }

    public pinLocation(): any {
        return {
            x: 0,
            y: 0,
            z: 0,
        }
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
            this._obj3D.add(this.mesh);
            this._obj3D.position.set(this.x, this.y, this.z);

            let myParent = this.myParent() as foGlyph3D;
            let parentObj3D = myParent && myParent.obj3D;
            parentObj3D && parentObj3D.add(this._obj3D);
        }
        return this._obj3D;
    }
    set obj3D(value: Object3D) { this.obj3D = value; }
    hasObj3D(): boolean {
        return this._obj3D != undefined
    }


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
            angleZ: this.angleZ
        });
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            let parent = this.myParent() as foGlyph3D;
            if (this._obj3D) {
                this._obj3D.remove(this._mesh);
                parent.hasObj3D() && parent.obj3D.remove(this._obj3D);

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
        this.draw3D && this.draw3D(screen);

        //this.drawHandles(screen);
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

    public drawHandles(screen: Screen3D) {
        this.handles.forEach(item => {
            item.render3D(screen);
        })
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        this.obj3D.position.set(this.x, this.y, this.z);
        return this;
    }

    protected generateHandles(spec: Array<any>, proxy?: Array<any>): foCollection<foHandle3D> {

        let i = 0;
        if (!this._handles) {
            this._handles = new foCollection<foHandle3D>()
            spec.forEach(item => {
                let type = item.myType ? item.myType : RuntimeType.define(foHandle3D)
                let handle = new type(item, undefined, this);
                handle.doMoveProxy = proxy && proxy[i]
                this._handles.addMember(handle);
                i++;
            });
        } else {
            spec.forEach(item => {
                let handle = this._handles.getChildAt(i)
                handle.override(item);
                handle.doMoveProxy = proxy && proxy[i];
                i++;
            });
        }
        return this._handles;
    }

    public createHandles(): foCollection<foHandle3D> {

        let w = this.width / 2;
        let h = this.height / 2;
        let d = this.depth / 2;

        let spec = [
            { x: -w, y: -h, z: -d, myName: "0:0:0", myType: RuntimeType.define(foHandle3D) },
            { x: w, y: -h, z: -d, myName: "W:0:0" },
            { x: w, y: h, z: -d, myName: "W:H:0" },
            { x: -w, y: h, z: -d, myName: "0:H:0" },

            { x: -w, y: -h, z: d, myName: "0:0:D", myType: RuntimeType.define(foHandle3D) },
            { x: w, y: -h, z: d, myName: "W:0:D" },
            { x: w, y: h, z: d, myName: "W:H:D" },
            { x: -w, y: h, z: d, myName: "0:H:D" },
        ];

        return this.generateHandles(spec);
    }

    public getHandle(name: string): foHandle3D {
        if (!this._handles) return;
        return this._handles.findMember(name);
    }

    public findHandle(loc: cPoint3D, e): foHandle3D {
        if (!this._handles) return;

        for (var i: number = 0; i < this.handles.length; i++) {
            let handle: foHandle3D = this.handles.getChildAt(i);
            if (handle.hitTest(loc)) {
                return handle;
            }
        }
    }


}

//https://www.typescriptlang.org/docs/handbook/mixins.html

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foGlyph3D);

//RuntimeType.applyMixins(foGlyph3D, [foGlyph2D, foBody3D]);
