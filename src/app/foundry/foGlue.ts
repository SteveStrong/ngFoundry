
import { Tools } from './foTools';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';



//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlue extends foNode {

    protected target: foNode;
    protected handle: string;


    constructor(properties?: any, parent?: foObject) {
        super(properties, undefined, parent);
    }

    glueTo(target:foNode, handle:string){
        this.target = target;
        this.handle = handle;
        return this;
    }

}


