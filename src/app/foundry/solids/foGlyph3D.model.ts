import { Matrix4, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';

import { Tools } from '../foTools'
import { cPoint3D } from './foGeometry3D';

import { foObject } from '../foObject.model'


import { foCollection } from '../foCollection.model'
import { foNode } from '../foNode.model'

import { foGlyph } from '../foGlyph.model'
import { foHandle3D } from './foHandle3D'
import { foPin3D } from './foPin3D'

import { Screen3D } from "./threeDriver";


import { Lifecycle } from '../foLifecycle';

export { GlyphDictionary } from '../foGlyph.model'

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

    protected _pin: foPin3D;
    get pin(): foPin3D {
        this._pin || this.createPin();
        return this._pin;
    }

    protected _x: number;
    protected _y: number;
    protected _z: number;
    protected _width: number;
    protected _height: number;
    protected _depth: number;

    get x(): number { return this._x || 0.0; }
    set x(value: number) {
        value != this._x && this.clearMesh();
        this._x = value;
    }
    get y(): number { return this._y || 0.0 }
    set y(value: number) {
        value != this._y && this.clearMesh();
        this._y = value;
    }

    get z(): number { return this._z || 0.0; }
    set z(value: number) {
        value != this._z && this.clearMesh();
        this._z = value;
    }

    get width(): number { return this._width || 0.0; }
    set width(value: number) {
        value != this._width && this.clearMesh();
        this._width = value;
    }

    get height(): number { return this._height || 0.0; }
    set height(value: number) {
        value != this._height && this.clearMesh();
        this._height = value;
    }

    get depth(): number { return this._depth || 0.0; }
    set depth(value: number) {
        value != this._depth && this.clearMesh();
        this._depth = value;
    }

    protected _angleX: number;
    get angleX(): number { return this._angleX || 0.0; }
    set angleX(value: number) {
        value != this._angleX && this.clearMesh();
        this._angleX = value;
    }

    protected _angleY: number;
    get angleY(): number { return this._angleY || 0.0; }
    set angleY(value: number) {
        value != this._angleY && this.clearMesh();
        this._angleY = value;
    }

    protected _angleZ: number;
    get angleZ(): number { return this._angleZ || 0.0; }
    set angleZ(value: number) {
        value != this._angleZ && this.clearMesh();
        this._angleZ = value;
    }

    public rotationX = (): number => { return this.angleX; }
    public rotationY = (): number => { return this.angleY; }
    public rotationZ = (): number => { return this.angleZ; }


    constructor(properties?: any, subcomponents?: Array<foGlyph3D>, parent?: foObject) {
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
            this.mesh.position.set(this.x, this.y, this.z)
            this.setupPreDraw();
            let point = this.getGlobalPosition();
            Lifecycle.dropped(this, point);
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

    nullGeometry() {
        this.geometry = (spec?: any): Geometry => {
            return new BoxGeometry(0, 0, 0);
        }
        this.clearMesh();
        return this;
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

    protected setMeshMatrix(obj: Mesh) {
        obj.position.set(this.x, this.y, this.z);
        obj.rotation.set(this.angleX, this.angleY, this.angleZ);
        return obj;
    }

    //children in the model map to children of a mesh
    //https://bl.ocks.org/mpmckenna8/e0e3a8f79c711b29c55f
    protected _mesh: Mesh;
    get mesh(): Mesh {
        if (!this._mesh) {
            let geom = this.geometry()
            let mat = this.material()
            let obj = (geom && mat) && new Mesh(geom, mat);
            if (obj) {
                this._mesh = this.setMeshMatrix(obj);
            }

        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }
    get hasMesh(): boolean {
        return this._mesh != undefined
    }
    removeMesh(deep: boolean = false) {
        if (!this._mesh) return;

        //also think about handles and connection points
        deep && this.nodes.forEach(child => {
            child.removeMesh(deep);
        })

        let parent = this.mesh.parent;
        if (parent) {
            parent.remove(this.mesh);
        }
        this._mesh = undefined;
    }
    clearMesh(deep: boolean = false) {
        if (!this._mesh) return;

        //also think about handles and connection points
        deep && this.nodes.forEach(child => {
            child.clearMesh(deep);
        })
        this.setupPreDraw();
    }

    removeSubcomponent(obj: foNode) {
        this.removeMesh();
        super.removeSubcomponent(obj);
        return obj;
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

    //http://www.codinglabs.net/article_world_view_projection_matrix.aspx
    //https://scottbyrns.atlassian.net/wiki/spaces/THREEJS/pages/27721809/Matrix4

    getGlobalMatrix(): Matrix4 {
        let mat = this.mesh.matrixWorld;
        return mat;
    };

    getGlobalInvMatrix(): Matrix4 {
        let mat = this.getGlobalMatrix();
        mat = mat.getInverse(mat);
        return mat;
    };

    getMatrix(): Matrix4 {
        return this.mesh.matrix;
    };

    getInvMatrix(): Matrix4 {
        let mat = this.getMatrix();
        mat = mat.getInverse(mat);
        return mat;
    };

    localToGlobal(pt: Vector3): Vector3 {
        let mat = this.getGlobalMatrix();
        let vec = mat.multiplyVector3(pt);
        return vec;
    };

    globalToLocal(pt: Vector3): Vector3 {
        let inv = this.getGlobalMatrix();
        let vec = inv.multiplyVector3(pt);
        return vec;
    };

    getGlobalPosition(pt?: Vector3): Vector3 {
        this.mesh.updateMatrix();
        let vec = this.mesh.getWorldPosition(pt);
        return vec;
    }

    setGlobalPosition(pt: Vector3): Vector3 {
        this.x = pt.x;
        this.y = pt.y;
        this.z = pt.z;
        return pt;
    }

    setGlobalRotation(pt: Vector3): Vector3 {
        this.angleX = pt.x;
        this.angleY = pt.y;
        this.angleZ = pt.z;
        return pt;
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            let mesh = this.mesh;
            if (mesh) {
                mesh.name = this.myGuid;
                let parent = this.myParent() as foGlyph3D;
                if (parent && parent.hasMesh) {
                    parent.mesh.add(mesh)
                } else {
                    screen.addToScene(mesh);
                }

                let self = this;
                mesh.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
                    self.afterMeshCreated && self.afterMeshCreated(renderer, scene, camera, geometry, material, group);
                    mesh.onBeforeRender = function () { };
                };

                mesh.onAfterRender = function (renderer, scene, camera, geometry, material, group) {
                    self.afterMeshRendered && self.afterMeshRendered(renderer, scene, camera, geometry, material, group);
                    mesh.onAfterRender = function () { };
                };

                this.preDraw3D = undefined;
            }
        }
        this.preDraw3D = preDraw;
    }

    afterMeshCreated: (...args) => void = () => { }
    afterMeshRendered: (...args) => void = () => { }

    preDraw3D: (screen: Screen3D) => void;

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        if (!this.hasMesh) return;
        this.setMeshMatrix(this.mesh);
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        this.draw3D && this.draw3D(screen);

        //this.drawHandles(screen);
        this.drawPin(screen);
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

    public drawHandles(screen: Screen3D) {
        this.handles.forEach(item => {
            item.render3D(screen);
        })
    }

    public drawPin(screen: Screen3D) {
        this.pin.render3D(screen);
    }

    public move(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN) {
        this.mesh.position.set(this.x, this.y, this.z);
        return this;
    }


    public createPin(): foPin3D {

        let pos = this.pinLocation();

        let type = RuntimeType.define(foPin3D);
        this._pin = new type({
            x: pos.x,
            y: pos.y,
            z: pos.z,
            myName: 'pin',
        }, undefined, this) as foPin3D;

        return this._pin;
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
