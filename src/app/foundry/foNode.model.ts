import { Tools, foNames } from './foTools';
import { iObject, iNode, WhereClause } from './foInterface';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';

export class foNode extends foObject implements iNode {
  private static _counter: number = 0;
  private _index: number = 0;
  private _childDepth: number = 0;

  protected _subcomponents: foCollection<foNode>;

  private _class: string;
  get myClass(): string {
    return this._class;
  }
  set myClass(value: string) {
    this._class = value;
  }

  get displayName() {
    if (this._displayName) {
      return this._displayName;
    }
    if (this._class) {
      return `${this.myName}:${this.myClass} - ${this.myType}`;
    }
    return `${this.myName} - ${this.myType}`;
  }
  set displayName(value: string) {
    this._displayName = value;
  }

  constructor(
    properties?: any,
    subcomponents?: Array<foNode>,
    parent?: foObject
  ) {
    super(properties, parent);

    this._subcomponents = new foCollection<foNode>();
    this._subcomponents.myName = 'Subparts';
    subcomponents &&
      subcomponents.forEach(item => this.captureSubcomponent(item));
    return this;
  }

  //get asJson() { return this.toJson() }
  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      myClass: this.myClass
    });
  }

  public pushTo(list) {
    list.push(this);
    return this;
  }

  //deep hook for syncing matrix2d with geometry
  public initialize(
    x: number = Number.NaN,
    y: number = Number.NaN,
    ang: number = Number.NaN
  ) {
    return this;
  }

  findParent(where: WhereClause<foNode>) {
    const parent = <foNode>this.myParent();
    // tslint:disable-next-line:curly
    if (!parent) return;

    if (where(parent)) {
      return parent;
    }
    return parent.findParent(where);
  }

  reParent(newParent: foNode) {
    const parent = this.myParent && this.myParent();
    if (parent !== newParent) {
      this.removeFromParent();
      newParent.addSubcomponent(this);
    }
    return this;
  }

  addAsSubcomponent(parent: foNode, properties?: any) {
    parent.addSubcomponent(this, properties);
    return this;
  }

  removeFromParent() {
    const parent: foNode = <foNode>(this.myParent && this.myParent());
    parent && parent.removeSubcomponent(this);
    this.myParent = undefined;
    return this;
  }

  //todo modify api to take both item and array
  addSubcomponent(obj: foNode, properties?: any) {
    if (!obj) { return; }
    const parent = obj.myParent && obj.myParent();
    if (!parent) {
      obj.myParent = () => {
        return this;
      };
      properties && obj.override(properties);
    }
    obj._index = this._subcomponents.length;
    obj._childDepth = this._childDepth + 1;
    this._subcomponents.addMember(obj);
    return obj;
  }

  removeSubcomponent(obj: foNode) {
    if (!obj) { return; }
    const parent = obj.myParent && obj.myParent();
    if (parent === this) {
      obj.myParent = undefined;
    }
    obj._index = -1;
    obj._childDepth = 0;
    this._subcomponents.removeMember(obj);
    return obj;
  }

  public incrementNameCounter() {
    foNode._counter += 1;
    return foNode._counter;
  }

  public generateName() {
    const counter = this.incrementNameCounter();
    const count = ('0000' + counter).slice(-4);
    this.myName = `${this.myType}_${count}`;
    return this;
  }

  public defaultName(name?: string) {
    if (name) {
      this.myName = name;
    } else if (Tools.matches(this.myName, foNames.UNKNOWN)) {
      this.generateName();
    }
    return this;
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
    const prev: number = this.index - 1;
    const parent = this.myParent && this.myParent();
    if (parent && prev > -1) {
      const found = parent.getChildAt(prev);
      return found;
    }
  }

  get nextChild() {
    const next: number = this.index + 1;
    const parent = this.myParent && this.myParent();
    if (parent && next < this._subcomponents.length) {
      const found = parent.getChildAt(next);
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
    const list = this.nodes;
    return list && list.hasMembers;
  }

  canCaptureSubcomponent(obj: foNode): boolean {
    if (!obj || !obj.isInstanceOf(foNode)) {
      return false;
    }
    //this should look up the complete chain to prevent cycles
    return this !== obj && this !== obj.myParent();
  }

  captureSubcomponent(obj: foNode, name?: string, join: boolean = false) {
    const newParent = this;
    const oldParent = obj.myParent() as foNode;
    if (newParent.canCaptureSubcomponent(obj)) {
      if (name) {
        obj.myName = name;
        if (join) {
          newParent[name] = obj;
        }
      }
      if (oldParent && oldParent !== newParent) {
        oldParent.removeSubcomponent(obj);
        if (join) {
          delete oldParent[name];
        }
      }
      newParent.addSubcomponent(obj);
      return oldParent;
    }
  }

  // insertSubcomponent(index:number, obj:foNode, name?:string) {
  //     if (ns.utils.isaComponent(obj)) {
  //         component.myParent = this;
  //         if (name) component.myName = name;
  //         this.Subcomponents.insertNoDupe(index, component);
  //         return obj;
  //     }
  // },

  // captureInsertSubcomponent:(index, component, name) {
  //     var newParent = this;
  //     var oldParent = component.myParent;
  //     if (newParent.canCaptureSubcomponent(component)) {
  //         ns.runWithUIRefreshLock(function () {
  //             if (name) component.myName = name;
  //             if (oldParent) oldParent.removeSubcomponent(component)
  //             newParent.insertSubcomponent(index, component);
  //         });
  //         return oldParent;
  //     }
  // }

  extractCopySpec(keys?: string[]) {
    let spec = this.asJson;
    delete spec.myGuid;
    spec = this.extract(keys, spec);
    return spec;
  }

  createCopy(keys?: string[]) {
    const data = this.extractCopySpec(keys);
    const { myType } = data;

    const type = RuntimeType.find(myType);
    if (type) {
      const copy = RuntimeType.create(type, data);
      return copy;
    }
  }

  public reHydrate(json: any) {
    this.override(json);
    return this;
  }

  public deHydrate(context?: any, deep: boolean = true) {
    const data = this.extractCopySpec();

    if (deep && this.nodes.count) {
      data.subcomponents = this.nodes.map(item => {
        const child = item.deHydrate(context, deep);
        return child;
      });
    }
    return data;
  }

  isInstanceOf(type) {
    return this instanceof type ? true : false;
  }

  isType(type) {
    if (type === this.myType) {
      return true;
    }
    if (!this.myType) {
      return false;
    }
    //remember a type may be preceeded with a namespace  knowtshare::note
    return type && Tools.matches(type, this.myType);
  }

  isOfType(type) {
    const found = this.isType(type);
    if (found) {
      return true;
    }
    //var myType = Tools.getType(this);
    return type && Tools.matches(type, this.myType);
  }
}

import { RuntimeType } from './foRuntimeType';
RuntimeType.define<foNode>(foNode);

Tools['isaNode'] = function(obj) {
  return obj && obj.isInstanceOf(foNode);
};
