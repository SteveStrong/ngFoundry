
import { Tools } from './foTools';
import { iObject, Action, ModelRef } from './foInterface'

import { foObject } from './foObject.model';
import { foCollection } from './foCollection.model';
import { foDictionary } from './foDictionary.model';
import { foNode } from './foNode.model';
import { foShape2D } from './foShape2D.model';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { foLibrary } from 'app/foundry/foLibrary.model';

export class foLifecycleEvent {
    cmd: string = '';
    object: foObject;
    get myGuid() {
        return this.object.myGuid;
    }
    get myType() {
        return this.object.myType;
    }

    constructor(cmd:string, obj:foObject) {
        this.cmd = cmd;
        this.object = obj;
    }
}

export class foLifecycle {

    public observable: Observable<foLifecycleEvent>;
    public subject: Subject<foLifecycleEvent>;

    constructor() {
        this.subject = new Subject<foLifecycleEvent>()
        this.observable = this.subject.asObservable()
    }

    created(obj: foObject) {
        this.subject.next(new foLifecycleEvent('created', obj))
        return this;
    }

    destroyed(obj: foObject) {
        this.subject.next(new foLifecycleEvent('destroyed', obj))
        return this;
    }

    unparent(obj: foObject) {
        this.subject.next(new foLifecycleEvent('unparent', obj))
        return this;
    }

    reparent(obj: foObject) {
        this.subject.next(new foLifecycleEvent('reparent', obj))
        return this;
    }

    glued(obj: foObject) {
        this.subject.next(new foLifecycleEvent('glued', obj))
        return this;
    }

    unglued(obj: foObject) {
        this.subject.next(new foLifecycleEvent('unglued', obj))
        return this;
    }

    dropped(obj: foObject) {
        this.subject.next(new foLifecycleEvent('dropped', obj))
        return this;
    }
}

export let Lifecycle: foLifecycle = new foLifecycle();


