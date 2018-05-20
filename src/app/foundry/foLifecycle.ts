import { Action } from './foInterface';
import { foObject } from './foObject.model';
import { Tools } from './foTools';

import { Observable ,  Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

let counter = 0;

export class foLifecycleEvent {
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

  get myClass() {
    return this.object['myClass'];
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
export class foLifecycleEventLock {
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

export let LifecycleLock: foLifecycleEventLock = new foLifecycleEventLock();
export let KnowcycleLock: foLifecycleEventLock = new foLifecycleEventLock();

export class foLifecycle {
  mute: boolean = false;

  public observable: Observable<foLifecycleEvent>;
  public emit: Subject<foLifecycleEvent>;

  private debounced: Subject<foLifecycleEvent>;

  constructor(debouce: number = 500) {
    this.emit = new Subject<foLifecycleEvent>();
    this.observable = this.emit.asObservable();

    this.debounced = new Subject<foLifecycleEvent>();

    this.debounced
      .asObservable()
      .pipe(debounceTime(debouce))
      .subscribe(event => {
        event.id = counter++;
        this.broadcast(event);
      });
  }

  broadcast(obj: foLifecycleEvent) {
    !this.mute && this.emit.next(obj);
    return this;
  }

  primitive(obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent('primitive', obj, counter++, value));
    return this;
  }

  defined(obj?: foObject) {
    this.broadcast(new foLifecycleEvent('defined', obj, counter++));
    return this;
  }

  event(eventName: string, obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent(eventName, obj, counter++, value));
    return this;
  }

  created(obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent('created', obj, counter++, value));
    return this;
  }

  destroyed(obj: foObject) {
    this.broadcast(new foLifecycleEvent('destroyed', obj, counter++));
    return this;
  }

  unparent(obj: foObject) {
    this.broadcast(new foLifecycleEvent('unparent', obj, counter++));
    return this;
  }

  reparent(obj: foObject) {
    this.broadcast(new foLifecycleEvent('reparent', obj, counter++));
    return this;
  }

  action(obj: foObject, action: string, params?: any) {
    this.broadcast(
      new foLifecycleEvent('run', obj, counter++, {
        action: action,
        params: params
      })
    );
    return this;
  }

  command(obj: foObject, method: string) {
    this.broadcast(new foLifecycleEvent('command', obj, counter++, method));
    return this;
  }

  selected(obj: foObject, value: any) {
    this.broadcast(new foLifecycleEvent('selected', obj, counter++, value));
    return this;
  }

  layout(obj: foObject, value: any) {
    this.broadcast(new foLifecycleEvent('layout', obj, counter++, value));
    return this;
  }

  changed(obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent('changed', obj, counter++, value));
    return this;
  }

  glued(obj: foObject, value: any) {
    this.broadcast(new foLifecycleEvent('glued', obj, counter++, value));
    return this;
  }

  unglued(obj: foObject, value: any) {
    this.broadcast(new foLifecycleEvent('unglued', obj, counter++, value));
    return this;
  }

  dropped(obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent('dropped', obj, counter++, value));
    return this;
  }

  handle(obj: foObject, value?: any) {
    this.debounced.next(new foLifecycleEvent('handle', obj, counter++, value));
    return this;
  }

  moved(obj: foObject, value?: any) {
    this.debounced.next(new foLifecycleEvent('moved', obj, counter++, value));
    return this;
  }

  easeTo(obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent('easeTo', obj, counter++, value));
    return this;
  }

  easeTween(obj: foObject, value?: any) {
    this.broadcast(new foLifecycleEvent('easeTween', obj, counter++, value));
    return this;
  }
}

export let Lifecycle: foLifecycle = new foLifecycle(300);
export let Knowcycle: foLifecycle = new foLifecycle();
