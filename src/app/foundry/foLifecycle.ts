
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

let counter = 0;

export class foLifecycleEvent {
    id: number = 0;
    cmd: string = '';
    object: foObject;

    get myGuid() {
        return this.object.myGuid;
    }
    get myType() {
        return this.object.myType;
    }

    constructor(cmd: string, obj: foObject, count: number = 0) {
        this.id = count;
        this.cmd = cmd;
        this.object = obj;
    }
}

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

    glued(obj: foObject) {
        this.emit.next(new foLifecycleEvent('glued', obj, counter++))
        return this;
    }

    unglued(obj: foObject) {
        this.emit.next(new foLifecycleEvent('unglued', obj, counter++))
        return this;
    }

    moved(obj: foObject) {
        this.debounced.next(new foLifecycleEvent('moved', obj))
        return this;
    }
}

export let Lifecycle: foLifecycle = new foLifecycle(300);
export let Knowcycle: foLifecycle = new foLifecycle();


