import { Vector3 } from 'three';

import { Tools } from '../foTools';
import { ModelRef, iPoint3D, iGlueSignature } from '../foInterface'

import { foObject } from '../foObject.model';
import { foNode } from '../foNode.model';
import { foShape3D } from './foShape3D.model';
import { foHandle3D } from './foHandle3D';
import { Lifecycle } from '../foLifecycle';




//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue3D extends foNode {

    myTarget: ModelRef<foShape3D>;
    mySource: ModelRef<foShape3D>;

    protected _targetHandle: foHandle3D;
    get targetHandle(): foHandle3D { return this._targetHandle; }
    set targetHandle(value: foHandle3D) {
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

    public doSourceMoveProxy: (loc: Vector3) => void;
    public doTargetMoveProxy: (loc: Vector3) => void;

    constructor(properties?: any, parent?: foObject) {
        super(properties, undefined, parent);
    }

    get signature(): iGlueSignature {
        return {
            sourceGuid: this.mySource && this.mySource() && this.mySource().myGuid,
            sourceName: this.sourceName,
            targetGuid: this.myTarget && this.myTarget() && this.myTarget().myGuid,
            targetName: this.targetName
        }
    }

    is2D() { return this.mySource && this.mySource() && this.mySource().is2D(); }
    is3D() { return this.mySource && this.mySource() && this.mySource().is3D(); }

    glueTo(target: foShape3D, handleName: string) {
        this.myTarget = () => { return target; };
        this.mySource = () => { return <foShape3D>this.myParent(); };
        this.targetName = handleName;
        this.targetHandle = target.getConnectionPoint(handleName);
        target.addGlue(this);

        Lifecycle.glued(this, this.signature);
        return this;
    }

    unglue() {
        Lifecycle.unglued(this, this.signature);
        this.myTarget().removeGlue(this);

        this.myTarget = undefined;
        this.mySource = undefined;
        this.doSourceMoveProxy = undefined;
        this.doTargetMoveProxy = undefined;
        return this;
    }

    sourceMoved(loc: Vector3) {
        this.doSourceMoveProxy && this.doSourceMoveProxy(loc);
    }

    targetMoved(loc: Vector3) {
        let pnt = this.targetHandle ? this.targetHandle.getGlobalPosition() : loc;
        this.doTargetMoveProxy && this.doTargetMoveProxy(pnt);
    }


    protected toJson(): any {
        return Tools.mixin(super.toJson(), this.signature);
    }


}


