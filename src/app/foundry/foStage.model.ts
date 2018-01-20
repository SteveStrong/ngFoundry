
import { PubSub } from "../foundry/foPubSub";
import { cPoint2D, cFrame } from '../foundry/foGeometry2D';
import { iPoint2D, Action } from '../foundry/foInterface'
import { Screen3D } from "../foundryDrivers/threeDriver";

import { foObject } from '../foundry/foObject.model'
import { foCollection } from '../foundry/foCollection.model'
import { foDictionary } from "../foundry/foDictionary.model";

import { foNode } from '../foundry/foNode.model'
import { Matrix2D } from '../foundry/foMatrix2D'
import { foComponent } from '../foundry/foComponent.model'

import { foGlyph3D } from '../foundry/foGlyph3D.model'
import { foHandle2D } from 'app/foundry/foHandle2D';
import { Lifecycle } from 'app/foundry/foLifecycle';


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
        this.smash();
        this._marginX = value;
    }

    protected _marginY: number;
    get marginY(): number { return this._marginY || 0.0; }
    set marginY(value: number) {
        this.smash();
        this._marginY = value;
    }

    protected _marginZ: number;
    get marginZ(): number { return this._marginZ || 0.0; }
    set marginZ(value: number) {
        this.smash();
        this._marginY = value;
    }

    protected _scaleX: number;
    get scaleX(): number { return this._scaleX || 1.0; }
    set scaleX(value: number) {
        this.smash();
        this._scaleX = value;
    }

    protected _scaleY: number;
    get scaleY(): number { return this._scaleY || 1.0; }
    set scaleY(value: number) {
        this.smash();
        this._scaleY = value;
    }

    protected _scaleZ: number;
    get scaleZ(): number { return this._scaleZ || 1.0; }
    set scaleZ(value: number) {
        this.smash();
        this._scaleZ = value;
    }

    public pinX = (): number => { return 0 * this.width; }
    public pinY = (): number => { return 0 * this.height; }
    public pinZ = (): number => { return 0 * this.depth; }




    _dictionary: foDictionary<foNode> = new foDictionary<foNode>();


    constructor(properties?: any, subcomponents?: Array<foComponent>, parent?: foObject) {
        super(properties, subcomponents, parent);
        this.color = 'Linen';

    }

    //this is used to drop shapes
    get centerX(): number { return this.width / 2; }
    get centerY(): number { return this.height / 2; }
    get centerZ(): number { return this.depth / 2; }

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

    render3D = (screen:Screen3D, deep: boolean = true) => {

        deep && this._subcomponents.forEach(item => {
            item.render3D(screen, deep);
        });
    }


}