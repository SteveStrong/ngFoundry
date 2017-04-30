
import { Tools } from './foTools'

import { foObject, iObject } from './foObject.model'
import { foCollection } from './foCollection.model'

export class foNode extends foObject {
    private _index: number = 0;
    private _myGuid: string;

    _subcomponents: foCollection<foNode>;

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super();
        this.myType = 'foNode';
        this.init(properties, subcomponents, parent)
    }

    init(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        var self = this;

        properties && Tools.forEachKeyValue(properties, function (key, value) {
            if (Tools.isFunction(value)) {
                Tools.defineCalculatedProperty(self, key, value);
            } else {
                self[key] = value;
            }
        });

        this._subcomponents = new foCollection<foNode>();
        subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));
        return this;
    }

    get myGuid() {
        if (!this._myGuid) {
            this._myGuid = Tools.generateUUID();
        }
        return this._myGuid;
    }

    //todo modify api to take bote item and array
    addSubcomponent(obj: foNode) {
        if (!obj) return;
        if (!obj.myParent) {
            obj.myParent = this;
            obj._index = this._subcomponents.length;
        }
        this._subcomponents.addMember(obj);
        return obj;
    }

    removeSubcomponent(obj: foNode) {
        if (!obj) return;
        if (obj.myParent == this) {
            obj.myParent = undefined;
            obj._index = 0;
        }
        this._subcomponents.removeMember(obj);
    }

    get index(): number {
        return this._index;
    }

    getChildAt(i:number):iObject {
        if ( this.hasSubcomponents ){
            return this._subcomponents.getMember(i);
        } 
    }

    get prevChild() {
        let prev: number = this.index - 1;
        if (this.myParent && prev > -1 ) {
            let found = this.myParent.getChildAt(prev);
            return found;
        }
    }

    get nextChild() {
        let next: number = this.index + 1;
        if (this.myParent && next < this._subcomponents.length) {
            let found = this.myParent.getChildAt(next);
            return found;
        }
    }

    get Subcomponents() {
        return this._subcomponents.members;
    }

    get nodes(): foCollection<foNode> {
        return this._subcomponents;
    }

    get hasSubcomponents(): boolean {
        return this._subcomponents && this._subcomponents.hasMembers;
    }

}