import { Tools } from './foTools';

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foInstance } from './foInstance.model';
import { foHandle } from './foHandle';
import { Lifecycle } from './foLifecycle';

export class GlyphDictionary extends foDictionary<foNode> {
  public establish = (name: string): foNode => {
    this.findItem(name, () => {
      this.addItem(name, new foGlyph({ myName: name }));
    });
    return this.getItem(name);
  }

  constructor(properties?: any, parent?: foObject) {
    super(properties, parent);
  }

  selectGlyph(
    where: WhereClause<foGlyph>,
    list?: foCollection<foGlyph>,
    deep: boolean = true
  ): foCollection<foGlyph> {
    const result = list ? list : new foCollection<foGlyph>();

    this.forEachKeyValue((key, value) => {
      if (where(value)) { result.addMember(value); }
      deep && value.selectGlyph(where, result, deep);
    });

    return result;
  }
}

//a Glyph is a graphic designed to draw on a canvas in absolute coordinates
export class foGlyph extends foInstance {
  static DEG_TO_RAD = Math.PI / 180;
  static RAD_TO_DEG = 180 / Math.PI;

  protected _subcomponents: foCollection<foGlyph>;
  get nodes(): foCollection<foGlyph> {
    return this._subcomponents;
  }
  protected _handles: foCollection<foHandle>;
  get handles(): foCollection<foHandle> {
    this._handles || this.createHandles();
    return this._handles;
  }

  protected _isSelected: boolean = false;
  protected _opacity: number;
  protected _color: string;

  public context: any;

  get opacity(): number {
    return this._opacity || 1;
  }
  set opacity(value: number) {
    this._opacity = value;
  }

  get color(): string {
    return this._color || 'black';
  }
  set color(value: string) {
    this._color = value;
  }

  get isSelected(): boolean {
    return this._isSelected;
  }
  set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      Lifecycle.selected(this, value);
    }
  }

  protected _layout: () => void;
  public setLayout(func: () => void) {
    this._layout = func;
    return this;
  }
  public doLayout(deep: boolean = true) {
    if (deep) {
      this.nodes.forEach(item => item.doLayout());
    }

    this._layout && this.wait(1000, this._layout);
    return this;
  }

  constructor(
    properties?: any,
    subcomponents?: Array<foGlyph>,
    parent?: foObject
  ) {
    super(properties, subcomponents, parent);
  }

  is2D() {
    return false;
  }
  is3D() {
    return false;
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      opacity: this.opacity,
      color: this.color
    });
  }

  public initialize(
    x: number = Number.NaN,
    y: number = Number.NaN,
    ang: number = Number.NaN
  ) {
    return this;
  }

  public LifecycleCreated() {
    Lifecycle.created(this);
    return this;
  }

  public LifecycleDestroyed() {
    Lifecycle.destroyed(this);
    return this;
  }

  public LifecycleCommand(method: string) {
    Lifecycle.command(this, method);
    return this;
  }

  public LifecycleAction(method: string, params?: any) {
    Lifecycle.action(this, method, params);
    return this;
  }

  public didLocationChange(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ): boolean {
    return false;
  }

  destroyed(obj: foNode) {
    this.removeSubcomponent(obj);
    Lifecycle.destroyed(obj);
    return obj;
  }

  removeSubcomponent(obj: foNode) {
    super.removeSubcomponent(obj);
    Lifecycle.unparent(obj);
    return obj;
  }

  addSubcomponent(obj: foNode, properties?: any) {
    super.addSubcomponent(obj, properties);
    Lifecycle.reparent(obj);
    return obj;
  }

  public getLocation = (): any => {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }

  public pinLocation(): any {
    return {
      x: 0,
      y: 0,
      z: 0
    };
  }

  public dropAt(
    x: number = Number.NaN,
    y: number = Number.NaN,
    angle: number = Number.NaN
  ) {
    if (this.didLocationChange(x, y, angle)) {
      Lifecycle.dropped(this, this.getLocation());
    }
    return this;
  }

  unSelect(deep: boolean = true, exclude: foGlyph = null) {
    this.isSelected = this === exclude ? this.isSelected : false;
    this._handles && this._handles.forEach(item => (item.color = 'black'));
    deep &&
      this.Subcomponents.forEach(item => {
        (<foGlyph>item).unSelect(deep, exclude);
      });
  }

  selectGlyph(
    where: WhereClause<foGlyph>,
    list?: foCollection<foGlyph>,
    deep: boolean = true
  ): foCollection<foGlyph> {
    const result = list ? list : new foCollection<foGlyph>();

    this.nodes.forEach(value => {
      if (where(value)) { result.addMember(value); }
      deep && value.selectGlyph(where, result, deep);
    });

    return result;
  }

  protected generateHandles(
    spec?: Array<any>,
    proxy?: Array<any>
  ): foCollection<foHandle> {
    let i = 0;
    if (!this._handles) {
      this._handles = new foCollection<foHandle>();
      spec &&
        spec.forEach(item => {
          const type = item.myType ? item.myType : RuntimeType.define(foHandle);
          const handle = new type(item, undefined, this);
          handle.doMoveProxy = proxy && proxy[i];
          this._handles.addMember(handle);
          i++;
        });
    } else {
      spec &&
        spec.forEach(item => {
          const handle = this._handles.getChildAt(i);
          handle.override(item);
          handle.doMoveProxy = proxy && proxy[i];
          i++;
        });
    }
    return this._handles;
  }

  public createHandles(): foCollection<foHandle> {
    const spec = [];

    return this.generateHandles(spec);
  }

  public getHandle(name: string): foHandle {
    if (!this._handles) { return; }
    return this._handles.findMember(name);
  }

  toggleSelected() {
    this.isSelected = !this.isSelected;
  }
}

import { RuntimeType } from './foRuntimeType';
import { WhereClause } from './foInterface';
RuntimeType.define(foGlyph);
