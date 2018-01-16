import { Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer } from 'three';

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

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    is2D() { return false; }
    is3D() { return true; }

    protected _mesh: Mesh;
    get mesh(): Mesh {
        if (!this._mesh) {
            let geometry: BoxGeometry = new BoxGeometry(this.width, this.height, this.depth);
            let material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x990033, wireframe: false });

            this._mesh = new Mesh(geometry, material);
        }
        return this._mesh;
    }
    set mesh(value: Mesh) { this._mesh = value; }

    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            z: this.z,
            depth: this.depth,
        });
    }

    addAsSubcomponent(parent: foNode, properties?: any) {
        let result = super.addAsSubcomponent(parent, properties);
        return result;
    }


    preRender3D = (screen: Screen3D) => {
        if ( this._mesh) {
            screen.addToScene(this);
        }
    }

    draw3D = (screen: Screen3D, deep: boolean = true) => {
        let rot = this.mesh.rotation;
        rot.x += 0.01;
        rot.y += 0.02;
    };

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preRender3D && this.preRender3D(screen)
        this.draw3D && this.draw3D(screen)
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }

}