
import { Tools } from './foTools';


import { iName,  iFrame } from './foInterface';
import { cFrame } from './shapes/foGeometry2D';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foNode } from './foNode.model';

import { Lifecycle } from './foLifecycle';

export class foHandle extends foNode {
    doMoveProxy: (loc: any) => void;

    protected _size: number;
    protected _opacity: number;
    protected _color: string;

    get size(): number { return this._size || 10.0; }
    set size(value: number) { this._size = value; }

    get opacity(): number { return this._opacity || 1; }
    set opacity(value: number) { this._opacity = value; }

    get color(): string {
        return this._color || 'black';
    }
    set color(value: string) {
        this._color = value;
    }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    public pinLocation() {
        let loc = this.size / 2
        return {
            x: loc,
            y: loc
        }
    }

}

//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlyph extends foNode {

    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;

    protected _isSelected: boolean = false;
    get isSelected(): boolean { return this._isSelected; }
    set isSelected(value: boolean) {
        if (this._isSelected != value) {
            this._isSelected = value;
            Lifecycle.selected(this, value);
        };

    }


    protected _subcomponents: foCollection<foGlyph>;
    get nodes(): foCollection<foGlyph> {
        return this._subcomponents;
    }
    
    protected _opacity: number;
    protected _color: string;

    public context: any;


    get opacity(): number { return this._opacity || 1; }
    set opacity(value: number) { this._opacity = value; }

    get color(): string {
        return this._color || 'black';
    }
    set color(value: string) {
        this._color = value;
    }


    protected _handles: foCollection<foHandle>;
    get handles(): foCollection<foHandle> { return this._handles || this.createHandles(); }


    protected _layout: () => void;
    public setLayout(func: () => void) {
        this._layout = func;
        return this;
    };
    public doLayout(deep: boolean = true) {
        if (deep) {
            this.nodes.forEach(item => item.doLayout());
        }

        this._layout && this.wait(1000, this._layout);
        return this;
    };


    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    is2D() { return true; }
    is3D() { return true; }



    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            opacity: this.opacity,
            color: this.color,
        });
    }

    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        return this;
    }

    public LifecycleCreated() {
        Lifecycle.created(this)
        return this;
    }

    public LifecycleDestroyed() {
        Lifecycle.destroyed(this)
        return this;
    }

    public LifecycleCommand(method: string) {
        Lifecycle.command(this, method);
        return this;
    }

    public LifecycleAction(method: string, params?: any) {
        Lifecycle.action(this, method, params)
        return this;
    }

    public didLocationChange(x: number = Number.NaN, y: number = Number.NaN, angle: number = Number.NaN): boolean {
        return false;
    }

    destroyed(obj: foNode) {
        this.removeSubcomponent(obj);
        Lifecycle.destroyed(obj);
        return obj;
    }

    removeSubcomponent(obj: foNode) {
        super.removeSubcomponent(obj);
        Lifecycle.unparent(obj);
        return obj;
    }

    addSubcomponent(obj: foNode, properties?: any) {
        super.addSubcomponent(obj, properties);
        Lifecycle.reparent(obj);
        return obj;
    }



    public getLocation = () => {
        return {
            x: 0,
            y: 0,
        }
    }

    public pinLocation() {
        return {
            x: 0,
            y: 0,
        }
    }

    unSelect(deep: boolean = true, exclude: foGlyph = null) {
        this.isSelected = this == exclude ? this.isSelected : false;
        this._handles && this._handles.forEach(item => item.color = 'black')
        deep && this.Subcomponents.forEach(item => {
            (<foGlyph>item).unSelect(deep, exclude);
        })
    }





    protected generateHandles(spec?: Array<any>, proxy?: Array<any>): foCollection<foHandle> {

        let i = 0;
        if (!this._handles) {
            this._handles = new foCollection<foHandle>()
            spec && spec.forEach(item => {
                let type = item.myType ? item.myType : RuntimeType.define(foHandle)
                let handle = new type(item, undefined, this);
                handle.doMoveProxy = proxy && proxy[i]
                this._handles.addMember(handle);
                i++;
            });
        } else {
            spec && spec.forEach(item => {
                let handle = this._handles.getChildAt(i)
                handle.override(item);
                handle.doMoveProxy = proxy && proxy[i];
                i++;
            });
        }
        return this._handles;
    }

    public createHandles(): foCollection<foHandle> {

        let spec = [
        ];

        return this.generateHandles(spec);
    }

    getHandle(name: string): foHandle {
        if (!this._handles) return;
        return this._handles.findMember(name);
    }

    public findHandle(loc: any, e): foHandle {
        if (!this._handles) return;

        for (var i: number = 0; i < this.handles.length; i++) {
            let handle: foHandle = this.handles.getChildAt(i);
            if (handle['hitTest'](loc)) {
                return handle;
            }
        }
    }



    toggleSelected() {
        this.isSelected = !this.isSelected;
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foGlyph);




