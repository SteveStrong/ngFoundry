
import { Tools } from './foTools'
import { iObject, iNode, Action } from './foInterface'

import { foObject } from './foObject.model'
import { foCollection } from './foCollection.model'


export class foNode extends foObject implements iNode {
    private _index: number = 0;
    private _childDepth: number = 0;


    protected _subcomponents: foCollection<foNode>;

    private _class: string;
    get myClass(): string {
        let comp: any = this.constructor;
        return this._class || comp.name;
    }
    set myClass(value: string) {
        this._class = value;
    }

    constructor(properties?: any, subcomponents?: Array<foNode>, parent?: foObject) {
        super(properties, parent);

        this._subcomponents = new foCollection<foNode>();
        this._subcomponents.myName = 'Subparts';
        subcomponents && subcomponents.forEach(item => this.addSubcomponent(item));
        return this;
    }

    //get asJson() { return this.toJson() }
    protected toJson(): any {
        return Tools.mixin(super.toJson(), {
            myClass: this.myClass
        });
    }

    //deep hook for syncing matrix2d with geometry 
    public initialize(x: number = Number.NaN, y: number = Number.NaN, ang: number = Number.NaN) {
        return this;
    }

    reParent(newParent: foNode) {
        let parent = this.myParent && this.myParent();
        if ( parent != newParent ){
            this.removeFromParent()
            newParent.addSubcomponent(this);
        }
        return this;
    }

    addAsSubcomponent(parent: foNode, properties?: any) {
        parent.addSubcomponent(this, properties);
        return this;
    }

    removeFromParent() {
        let parent: foNode = <foNode>(this.myParent && this.myParent());
        parent && parent.removeSubcomponent(this);
        this.myParent = undefined;
        return this;
    }

    //todo modify api to take both item and array
    addSubcomponent(obj: foNode, properties?: any) {
        if (!obj) return;
        let parent = obj.myParent && obj.myParent();
        if (!parent) {
            obj.myParent = () => { return this; };
            properties && obj.override(properties);
        }
        obj._index = this._subcomponents.length;
        obj._childDepth = this._childDepth + 1;
        this._subcomponents.addMember(obj);
        return obj;
    }

    removeSubcomponent(obj: foNode) {
        if (!obj) return;
        let parent = this.myParent && this.myParent();
        if (parent == this) {
            obj.myParent = undefined;
        }
        obj._index = -1;
        obj._childDepth = 0;
        this._subcomponents.removeMember(obj);
        return obj;
    }

    get index(): number {
        return this._index;
    }

    get childDepth(): number {
        return this._childDepth;
    }

    getChildAt(i: number): iObject {
        return this.hasSubcomponents && this._subcomponents.getMember(i);
    }

    get prevChild() {
        let prev: number = this.index - 1;
        let parent = this.myParent && this.myParent();
        if (parent && prev > -1) {
            let found = parent.getChildAt(prev);
            return found;
        }
    }

    get nextChild() {
        let next: number = this.index + 1;
        let parent = this.myParent && this.myParent();
        if (parent && next < this._subcomponents.length) {
            let found = parent.getChildAt(next);
            return found;
        }
    }

    get Subcomponents() {
        return this.nodes.members;
    }

    get nodes(): foCollection<foNode> {
        return this._subcomponents;
    }

    get hasSubcomponents(): boolean {
        let list = this.nodes;
        return list && list.hasMembers;
    }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define<foNode>(foNode);