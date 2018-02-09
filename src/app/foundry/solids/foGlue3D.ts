import { Vector3 } from 'three';

import { Tools } from '../foTools';
import { ModelRef, iGlueSignature } from '../foInterface'

import { foObject } from '../foObject.model';
import { foNode } from '../foNode.model';
import { foShape3D } from './foShape3D.model';
import { foHandle3D } from './foHandle3D';
import { Lifecycle } from '../foLifecycle';




//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue3D extends foNode {

    myTarget: ModelRef<foShape3D>;
    mySource: ModelRef<foShape3D>;



    get sourceName(): string { return this.myName; }
    set sourceName(value: string) {
        this.myName = value;
    }

    protected _sourceHandle: foHandle3D;
    get sourceHandle(): foHandle3D { return this._sourceHandle; }
    set sourceHandle(value: foHandle3D) {
        this._sourceHandle = value;
    }

    protected _targetName: string;
    get targetName(): string { return this._targetName; }
    set targetName(value: string) {
        this._targetName = value;
    }

    protected _targetHandle: foHandle3D;
    get targetHandle(): foHandle3D { return this._targetHandle; }
    set targetHandle(value: foHandle3D) {
        this._targetHandle = value;
    }

    public doSourceMoveProxy: (glue:foGlue3D) => void;
    public doTargetMoveProxy: (glue:foGlue3D) => void;

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
 
        //my name is the source name
        this.sourceHandle = target.getConnectionPoint(this.sourceName);
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

    sourceMovedSyncGlue() {
        this.doSourceMoveProxy && this.doSourceMoveProxy(this);
    }

    targetMovedSyncGlue() {
        this.doTargetMoveProxy && this.doTargetMoveProxy(this);
    }


    protected toJson(): any {
        return Tools.mixin(super.toJson(), this.signature);
    }

    enforceAlignTo() {
        let glue = this;
        let target = glue.targetHandle ? glue.targetHandle : glue.myTarget().getConnectionPoint();
        let source = glue.sourceHandle ? glue.sourceHandle : glue.mySource().getConnectionPoint();
        target && source &&  source.alignTo(target)
    }

}


