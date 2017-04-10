import { Tools } from './foTools'



export interface iObject {
    myType: string;
    myName: string;
    myParent: iObject;
    asReference();
}

export class foObject implements iObject {
    myType: string = 'foObject';
    myName: string = 'unknown';
    myParent: iObject = undefined;

    constructor() {

    }

    asReference() {
        if (this.myParent === undefined) {
            return "\'root\'";
        }
        return this.myName + "." + this.myParent.asReference();
    }

    get hasParent() {
        return this.myParent ? true : false;
    }

    get debug() {
        return Tools.stringify(this);
        //return JSON.stringify(this,undefined,3);
    }

}


