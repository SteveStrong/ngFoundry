
import { Tools } from './foTools';
import { ModelRef } from './foInterface'

import { foObject } from './foObject.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';
import { Lifecycle } from './foLifecycle';

//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue extends foNode {

    myTarget: ModelRef<foShape2D>;
    mySource: ModelRef<foShape2D>;

    protected _targetHandle: string;
    get targetHandle(): string { return this._targetHandle; }
    set targetHandle(value: string) {
        this._targetHandle = value;
    }

    get sourceHandle(): string { return this.myName; }
    set sourceHandle(value: string) {
        this.myName = value;
    }


    constructor(properties?: any, parent?: foObject) {
        super(properties, undefined, parent);
    }

    glueTo(target: foShape2D, handleName: string) {
        this.myTarget = () => { return target; };
        this.mySource = () => { return <foShape2D>this.myParent(); };
        this.targetHandle = handleName; // Tools.isString(handle) ? target.getConnectionPoint(<string>handle) :  handle;
        target.addGlue(this);
        Lifecycle.glued(this);
        return this;
    }

    protected toJson():any {
        return Tools.mixin(super.toJson(), {
            guid: this.myGuid,
            myType: this.myType,
            sourceGuid: this.mySource() && this.mySource().myGuid,
            sourceHandle: this.sourceHandle,
            targetGuid: this.myTarget() && this.myTarget().myGuid,
            targetHandle: this.targetHandle
        });
    }


}


