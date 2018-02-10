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


    protected _sourceName: string;
    get sourceName(): string { return this._sourceName; }
    set sourceName(value: string) {
        this._sourceName = value;
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

    glueTo(sourceName: string, target: foShape3D, targetName: string) {
        this.myTarget = () => { return target; };
        this.mySource = () => { return <foShape3D>this.myParent(); };
        this.targetName = targetName;
        this.targetHandle = this.myTarget().getConnectionPoint(targetName);
 
        //my name is the source name
        this.sourceName = sourceName;
        this.sourceHandle = this.mySource().getConnectionPoint(this.sourceName);

        this.myTarget().addGlue(this);
        Lifecycle.glued(this, this.signature);
        return this;
    }

    unglue() {
        Lifecycle.unglued(this, this.signature);
        let target = this.myTarget();

        this.myTarget = undefined;
        this.mySource = undefined;
        this.doSourceMoveProxy = undefined;
        this.doTargetMoveProxy = undefined;

        target.removeGlue(this);
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
        let target = this.targetHandle ? this.targetHandle : this.myTarget().getConnectionPoint();
        let source = this.sourceHandle ? this.sourceHandle : this.mySource().getConnectionPoint();
        target && source &&  source.alignTo(target)
    }

}


