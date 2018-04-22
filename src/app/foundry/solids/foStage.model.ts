
import { Object3D, Matrix3, Material, Geometry, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

import { iPoint3D, Action } from '../foInterface'
import { Screen3D } from "./threeDriver";

import { foObject } from '../foObject.model'
import { foCollection } from '../foCollection.model'
import { foGlyph } from "../foGlyph.model";
import { WhereClause } from "../foInterface";

import { foNode } from '../foNode.model'

import { foComponent } from '../foComponent.model'

import { foGlyph3D, GlyphDictionary } from './foGlyph3D.model'
import { Lifecycle } from '../foLifecycle';


//a Shape is a graphic designed to behave like a visio shape
//and have all the same properties
export class foStage extends foGlyph3D {

    gridSizeX: number = 50;
    gridSizeY: number = 50;
    gridSizeZ: number = 50;
    showBoundry: boolean = false;

    protected _marginX: number;
    get marginX(): number { return this._marginX || 0.0; }
    set marginX(value: number) {
        value != this._marginX && this.clearMesh();
        this._marginX = value;
    }

    protected _marginY: number;
    get marginY(): number { return this._marginY || 0.0; }
    set marginY(value: number) {
        value != this._marginY && this.clearMesh();
        this._marginY = value;
    }

    protected _marginZ: number;
    get marginZ(): number { return this._marginZ || 0.0; }
    set marginZ(value: number) {
        value != this._marginZ && this.clearMesh();
        this._marginZ = value;
    }

    protected _scaleX: number;
    get scaleX(): number { return this._scaleX || 1.0; }
    set scaleX(value: number) {
        value != this._scaleX && this.clearMesh();
        this._scaleX = value;
    }

    protected _scaleY: number;
    get scaleY(): number { return this._scaleY || 1.0; }
    set scaleY(value: number) {
        value != this._scaleY && this.clearMesh();
        this._scaleY = value;
    }

    protected _scaleZ: number;
    get scaleZ(): number { return this._scaleZ || 1.0; }
    set scaleZ(value: number) {
        value != this._scaleZ && this.clearMesh();
        this._scaleZ = value;
    }

    public pinX = (): number => { return 0 * this.width; }
    public pinY = (): number => { return 0 * this.height; }
    public pinZ = (): number => { return 0 * this.depth; }



    _dictionary: GlyphDictionary = new GlyphDictionary();
    selectGlyph(where: WhereClause<foGlyph>, list?: foCollection<foGlyph>, deep: boolean = true): foCollection<foGlyph> {
        return this._dictionary.selectGlyph(where,list,deep);
    }

    constructor(properties?: any, subcomponents?: Array<foGlyph3D>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.setupPreDraw();
    }

    get mesh(): Mesh {
        if (!this._mesh) {
            this._mesh = new Mesh()
            this._mesh.name = this.myGuid;
        }
        return this._mesh;
    }

    setupPreDraw() {

        let preDraw = (screen: Screen3D) => {
            let mesh = this.mesh;
            screen.addToScene(mesh);

            mesh.position.set(this.x, this.y, this.z);
            mesh.rotation.set(this.angleX, this.angleY, this.angleZ);

            this.preDraw3D = undefined;
        }

        this.preDraw3D = preDraw;
    }

    //this is used to drop shapes
    get centerX(): number { return 0; }
    get centerY(): number { return 0; }
    get centerZ(): number { return 0; }

    findItem<T extends foGlyph3D>(key: string, onMissing?: Action<T>, onFound?: Action<T>): T {
        return this._dictionary.findItem(key, onMissing, onFound) as T;
    }

    found<T extends foGlyph3D>(key: string, onFound?: Action<T>, onMissing?: Action<T>): T {
        return this._dictionary.found(key, onFound, onMissing) as T;
    }

    establishInDictionary(obj: foNode) {
        let guid = obj.myGuid;
        this._dictionary.findItem(guid, () => {
            this._dictionary.addItem(guid, obj);
        });
        return obj;
    }

    removeFromDictionary(obj: foNode) {
        let guid = obj.myGuid;
        this._dictionary.found(guid, () => {
            this._dictionary.removeItem(guid);
        });
        return obj;
    }

    addSubcomponent(obj: foNode, properties?: any) {
        let guid = obj.myGuid;
        this._dictionary.findItem(guid, () => {
            this._dictionary.addItem(guid, obj);
            super.addSubcomponent(obj, properties);
        }, child => {
            super.addSubcomponent(obj, properties)
        });
        return obj;
    }


    removeSubcomponent(obj: foNode) {
        let guid = obj.myGuid;
        this._dictionary.found(guid, () => {
            (<foGlyph3D>obj).isSelected = false;
            this._dictionary.removeItem(guid);
            super.removeSubcomponent(obj);
        });
        return obj;
    }


    clearStage() {
        //simulate delete lifecycle in bulk via events
        this.nodes.forEach(item => {
            Lifecycle.unparent(item);
            Lifecycle.destroyed(item);
        })
        this.removeMesh(true);
        this._subcomponents.clearAll();
        this._dictionary.clearAll();
    }

    deleteSelected(onComplete?: Action<foGlyph3D>) {
        let found = this._subcomponents.filter(item => { return item.isSelected; })[0];
        if (found) {
            this.destroyed(found);
            onComplete && onComplete(found);
        }
    }

    zoomBy(zoom: number) {
        this.scaleX *= zoom;
        this.scaleY *= zoom;
        this.scaleZ *= zoom;
    }

    render3D = (screen: Screen3D, deep: boolean = true) => {
        this.preDraw3D && this.preDraw3D(screen)
        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }
}

import { RuntimeType } from '../foRuntimeType';
RuntimeType.define(foStage);