
import { Tools } from './foTools';
import { iObject, Action, ModelRef } from './foInterface'

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounce, debounceTime, } from 'rxjs/operators';
import { StringifyOptions } from 'querystring';

let counter = 0;

export class foLifecycleEvent {
    id: number = 0;
    cmd: string = '';
    object: foObject;
    value: any;

    get guid() {
        return this.object.myGuid;
    }
    get myGuid() {
        return this.object.myGuid;
    }
    get myType() {
        return this.object.myType;
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
        this.addLock(guid)
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

    public observable: Observable<foLifecycleEvent>;
    public emit: Subject<foLifecycleEvent>;

    private debounced: Subject<foLifecycleEvent>;

    constructor(debouce: number = 500) {
        this.emit = new Subject<foLifecycleEvent>();
        this.observable = this.emit.asObservable();

        this.debounced = new Subject<foLifecycleEvent>();

        this.debounced.asObservable().pipe(debounceTime(debouce)).subscribe(event => {
            event.id = counter++;
            this.emit.next(event);
        });
    }

    primitive(name?: string) {
        this.emit.next(new foLifecycleEvent('primitive', undefined, counter++, name))
        return this;
    }

    defined(obj?: foObject) {
        this.emit.next(new foLifecycleEvent('defined', obj, counter++))
        return this;
    }

    created(obj: foObject) {
        this.emit.next(new foLifecycleEvent('created', obj, counter++))
        return this;
    }

    destroyed(obj: foObject) {
        this.emit.next(new foLifecycleEvent('destroyed', obj, counter++))
        return this;
    }

    unparent(obj: foObject) {
        this.emit.next(new foLifecycleEvent('unparent', obj, counter++))
        return this;
    }

    reparent(obj: foObject) {
        this.emit.next(new foLifecycleEvent('reparent', obj, counter++))
        return this;
    }

    selected(obj: foObject, value: any) {
        this.emit.next(new foLifecycleEvent('selected', obj, counter++, value))
        return this;
    }

    glued(obj: foObject) {
        this.emit.next(new foLifecycleEvent('glued', obj, counter++))
        return this;
    }

    unglued(obj: foObject) {
        this.emit.next(new foLifecycleEvent('unglued', obj, counter++))
        return this;
    }

    moved(obj: foObject) {
        this.debounced.next(new foLifecycleEvent('moved', obj, counter++))
        return this;
    }

    easeTo(obj: foObject) {
        this.emit.next(new foLifecycleEvent('easeTo', obj, counter++))
        return this;
    }

    easeTween(obj: foObject, value?: any) {
        this.emit.next(new foLifecycleEvent('easeTween', obj, counter++, value))
        return this;
    }
}

export let Lifecycle: foLifecycle = new foLifecycle(300);
export let Knowcycle: foLifecycle = new foLifecycle();


