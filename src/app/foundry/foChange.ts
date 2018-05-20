import { Action } from './foInterface';
import { Tools } from './foTools';

import { foObject } from './foObject.model';
import { Observable ,  Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

let counter = 0;

export class foChangeEvent {
  id: number = 0;
  cmd: string = '';
  object: foObject;
  value: any;

  get guid() {
    return this.object.myGuid;
  }
  get simpleGuid() {
    return this.object.myGuid.slice(-8);
  }
  get myGuid() {
    return this.object.myGuid;
  }
  get myType() {
    return this.object.myType;
  }

  get myName() {
    return this.object.myName;
  }

  isNamed(name: string) {
    return Tools.matches(name, this.myName);
  }

  isCmd(cmd: string) {
    return Tools.matches(cmd, this.cmd);
  }

  constructor(cmd: string, obj: foObject, count: number = 0, value?: any) {
    this.id = count;
    this.cmd = cmd;
    this.object = obj;
    this.value = value;
  }
}

//this is needed to prevent circular communiation
// create => create => create across browsers
export class foChangeEventLock {
  private _processLock = {};

  isLocked(guid: string) {
    return this._processLock[guid] ? true : false;
  }

  addLock(guid: string) {
    if (!this.isLocked(guid)) {
      this._processLock[guid] = 0;
    }
    this._processLock[guid] += 1;
  }

  unLock(guid: string) {
    if (this.isLocked(guid)) {
      this._processLock[guid] -= 1;
      if (this._processLock[guid] <= 0) {
        delete this._processLock[guid];
      }
    }
  }

  protected(guid: string, context: any, func: Action<any>) {
    this.addLock(guid);
    try {
      func(context);
    } catch (ex) {
      console.error('protected', ex);
    }
    this.unLock(guid);
  }

  whenUnprotected(guid: string, context: any, func: Action<any>) {
    if (!this.isLocked(guid)) {
      try {
        func(context);
      } catch (ex) {
        console.error('whenUnprotected ', ex);
      }
    }
  }
}

export let ChangeLock: foChangeEventLock = new foChangeEventLock();

export class foChange {
  public observable: Observable<foChangeEvent>;
  public emit: Subject<foChangeEvent>;

  private debounced: Subject<foChangeEvent>;

  constructor(debouce: number = 500) {
    this.emit = new Subject<foChangeEvent>();
    this.observable = this.emit.asObservable();

    this.debounced = new Subject<foChangeEvent>();

    this.debounced
      .asObservable()
      .pipe(debounceTime(debouce))
      .subscribe(event => {
        event.id = counter++;
        this.emit.next(event);
      });
  }

  dropped(obj: foObject, value?: any) {
    this.emit.next(new foChangeEvent('dropped', obj, counter++, value));
    return this;
  }

  moved(obj: foObject, value?: any) {
    this.debounced.next(new foChangeEvent('moved', obj, counter++, value));
    return this;
  }

  changed(name: string, obj: foObject, value?: any) {
    this.emit.next(new foChangeEvent(name, obj, counter++, value));
    return this;
  }
}

export let BroadcastChange: foChange = new foChange(300);
