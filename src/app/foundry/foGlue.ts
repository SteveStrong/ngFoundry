
import { Tools } from './foTools';
import { iObject, Action, ModelRef } from './foInterface'

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';


//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue extends foNode {

    myTarget: ModelRef<foShape2D>;
    mySource: ModelRef<foShape2D>;

    protected _handleTo: string;
    get handleTo(): string { return this.handleTo; }
    set handleTo(value: string) {
        this._handleTo = value;
    }

    get handleFrom(): string { return this.myName; }
    set handleFrom(value: string) {
        this.myName = value;
    }


    constructor(properties?: any, parent?: foObject) {
        super(properties, undefined, parent);
    }

    glueTo(target: foShape2D, handleTo: string) {
        this.myTarget = () => { return target };
        this.mySource = () => { return <foShape2D>this.myParent() };
        this.handleTo = handleTo;
        return this;
    }

    protected toJson():any {
        return {
            guid: this.myGuid,
            myType: this.myType,
            sourceGuid: this.mySource().myGuid,
            targetGuid: this.myTarget().myGuid,
            handleTo: this.handleTo,
            handleFrom: this.handleFrom,
        }
    }


}


