import { Tools } from './foTools';
import { foObject } from './foObject.model';
import { iObject, Action, Func } from './foInterface';

//we want foCollection to be observable

export class foCollection<T extends iObject> extends foObject {
  protected _members: Array<T>;

  isHidden: boolean = false;
  isSelectable: boolean = true;
  constructor(list: Array<T> = undefined) {
    super();

    this._members = new Array<T>();
    list && list.forEach(item => this.addMember(item));
  }

  getChildAt(i: number): T {
    return this._members[i];
  }

  isEmpty(): boolean {
    return this._members.length === 0;
  }

  clearAll() {
    this._members = [];
  }

  get length() {
    return this._members.length;
  }

  get count() {
    return this._members.length;
  }

  get hasMembers(): boolean {
    return this.length > 0;
  }

  map(funct) {
    return this._members.map(funct);
  }

  forEach(funct: Action<T>) {
    this._members.forEach(funct);
  }

  first() {
    return this._members[0];
  }

  last() {
    return this._members[this._members.length - 1];
  }

  filter(funct: Func<T, boolean>) {
    return this._members.filter(funct);
  }

  find(funct: Func<T, boolean>) {
    return this._members.find(funct);
  }

  findMember(name: string): T {
    const found = this._members.find(item => {
      return item.myName === name || item.myGuid === name;
    });
    return found;
  }

  getMember(id): T {
    return this._members[id];
  }

  copyMembers(list: foCollection<T>): foCollection<T> {
    list.members.forEach(item => {
      this.addMember(item);
    });
    return this;
  }

  isMember(item: T) {
    const loc = this._members.indexOf(item);
    return loc !== -1;
  }

  push(obj: any) {
    this._members.push(obj);
  }
  shift(): any {
    return this._members.shift();
  }

  addMember(obj: T): T {
    this._members.push(obj);
    return obj;
  }

  removeMembers(list: foCollection<T>): foCollection<T> {
    list.members.forEach(item => {
      this.removeMember(item);
    });
    return this;
  }

  removeMember(obj: T): T {
    const index = this._members.indexOf(obj);
    if (index > -1) {
      this._members.splice(index, 1);
    }
    return obj;
  }

  get members() {
    return this._members;
  }

  get publicMembers() {
    return this.members.filter(item => item.isPublic);
  }

  moveToTop(item: T) {
    const loc = this._members.indexOf(item);
    if (loc !== -1) {
      this._members.splice(loc, 1);
      this._members.push(item);
    }
    return this._members;
  }

  protected toJson(): any {
    const list = !this.hasMembers ? [] : this._members.map(item => item.asJson);
    return Tools.mixin(super.toJson(), list);
  }

  public isEqualTo(obj: foCollection<T>, deep: boolean = true) {
    const result = true;
    return result;
  }
}
