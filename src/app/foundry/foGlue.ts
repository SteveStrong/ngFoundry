
import { Tools } from './foTools';
import { ModelRef, iPoint } from './foInterface'

import { foObject } from './foObject.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';
import { foHandle2D } from './foHandle2D';
import { Lifecycle } from './foLifecycle';

export interface iGlueSignature {
    sourceGuid: string,
    sourceName: string,
    targetGuid: string, 
    targetName: string
}


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue extends foNode {

    myTarget: ModelRef<foShape2D>;
    mySource: ModelRef<foShape2D>;

    protected _targetHandle: foHandle2D;
    get targetHandle(): foHandle2D { return this._targetHandle; }
    set targetHandle(value: foHandle2D) {
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

    glueTo(target: any, handleName: string) {
        this.myTarget = () => { return target; };
        this.mySource = () => { return <foShape2D>this.myParent(); };
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

    sourceMoved(loc: iPoint) {
        this.doSourceMoveProxy && this.doSourceMoveProxy(loc);
    }

    targetMoved(loc: iPoint) {  
        let pnt = this.targetHandle ? this.targetHandle.globalCenter() : loc;
        this.doTargetMoveProxy && this.doTargetMoveProxy(pnt);
    }


    protected toJson(): any {
        return Tools.mixin(super.toJson(), this.signature);
    }


}


