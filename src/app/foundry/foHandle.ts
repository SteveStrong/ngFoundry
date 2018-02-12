
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

    constructor(properties?: any, subcomponents?: Array<foHandle>, parent?: foObject) {
        super(properties, subcomponents, parent);
    }

    public pinLocation() {
        let loc = this.size / 2
        return {
            x: loc,
            y: loc,
            z: loc,
        }
    }

}



import { RuntimeType } from './foRuntimeType';
RuntimeType.define(foHandle);




