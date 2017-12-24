
import { Tools } from './foTools';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue extends foNode {

    protected _target: foShape2D;
    get target(): foShape2D { return this._target; }
    set target(value: foShape2D) {
        this._target = value;
    }

    protected _handleTo: string;
    get handleTo(): string { return this.handleTo; }
    set handleTo(value: string) {
        this._handleTo = value;
    }

    get source(): foShape2D { return <foShape2D>(this.myParent()); }
    set source(value: foShape2D) {
        this.myParent = () => { return value };
    }

    get handleFrom(): string { return this.myName; }
    set handleFrom(value: string) {
        this.myName = value;
    }


    constructor(properties?: any, parent?: foObject) {
        super(properties, undefined, parent);
    }

    glueTo(target: foShape2D, handleTo: string) {
        this.target = target;
        this.handleTo = handleTo;
        return this;
    }

    notifyTarget(name: string, ...args: any[]) {
        this.target.notify(name, args);
        return this;
    }

    notifySource(name: string, ...args: any[]) {
        this.source.notify(name, args);
        return this;
    }

}


