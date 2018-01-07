
import { Tools } from './foTools';
import { ModelRef, iPoint } from './foInterface'

import { foObject } from './foObject.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';
import { foHandle } from './foHandle';
import { Lifecycle } from './foLifecycle';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue extends foNode {

    myTarget: ModelRef<foShape2D>;
    mySource: ModelRef<foShape2D>;

    protected _targetHandle: foHandle;
    get targetHandle(): foHandle { return this._targetHandle; }
    set targetHandle(value: foHandle) {
        this._targetHandle = value;
    }

    get sourceName(): string { return this.myName; }
    set sourceName(value: string) {
        this.myName = value;
    }

    protected _targetName: string;
    get targetName(): string { return this._targetName; }
    set targetName(value: string) {
        this._targetName = value;
    }

    public doSourceMoveProxy: (loc: iPoint) => void;
    public doTargetMoveProxy: (loc: iPoint) => void;

    constructor(properties?: any, parent?: foObject) {
        super(properties, undefined, parent);
    }

    glueTo(target: foShape2D, handleName: string) {
        this.myTarget = () => { return target; };
        this.mySource = () => { return <foShape2D>this.myParent(); };
        this.targetName = handleName;
        this.targetHandle = target.getConnectionPoint(handleName);
        target.addGlue(this);

        let targetGuid = target.myGuid.slice(-8);
        Lifecycle.glued(this, {target: targetGuid, handle: this.targetName});
        return this;
    }

    unglue() {
        this.myTarget().removeGlue(this);
        Lifecycle.unglued(this);
        this.myTarget = undefined;
        this.mySource = undefined;
        this.doSourceMoveProxy = undefined;
        this.doTargetMoveProxy = undefined;

        return this;
    }

    sourceMoved(loc: iPoint) {
        this.doSourceMoveProxy && this.doSourceMoveProxy(loc);
    }

    targetMoved(loc: iPoint) {
        this.doTargetMoveProxy && this.doTargetMoveProxy(loc);
    }


    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            guid: this.myGuid,
            myType: this.myType,
            sourceGuid: this.mySource && this.mySource() && this.mySource().myGuid,
            sourceName: this.sourceName,
            targetGuid: this.myTarget && this.myTarget() && this.myTarget().myGuid,
            targetName: this.targetName
        });
    }


}


