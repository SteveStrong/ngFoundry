import { Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh, WebGLRenderer } from 'three';

import { Tools } from '../foundry/foTools'
import { cPoint } from '../foundry/foGeometry2D';
import { iPoint, iFrame } from '../foundry/foInterface'

import { foObject } from '../foundry/foObject.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foGlue } from '../foundry/foGlue'
import { foConnectionPoint } from '../foundry/foConnectionPoint'
import { foCollection } from '../foundry/foCollection.model'
import { foNode } from '../foundry/foNode.model'

import { foGlyph } from '../foundry/foGlyph2D.model'

import { Lifecycle } from './foLifecycle';

//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foGlyph3D extends foGlyph {

    protected _z: number;
    protected _depth: number;


    get z(): number { return this._z || 0.0; }
    set z(value: number) {
        this.smash();
        this._z = value;
    }

    get depth(): number { return this._depth || 0.0; }
    set depth(value: number) { this._depth = value; }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }
}