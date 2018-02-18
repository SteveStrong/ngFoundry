"use strict";

interface ISubscription {
    (...args: any[]): void;
}

interface IDictionary {
    [name: string]: ISubscription[];
}




class foPubSub {
    private registry: IDictionary = {}

    Pub(name: string, ...args: any[]) {
        if (!this.registry[name]) return;
        this.registry[name].forEach(fn => {
            fn.apply(null, args);
        });
        return this;
    }

    Sub(name: string, fn: ISubscription) {
        if (!this.registry[name]) {
            this.registry[name] = [];
        }
        this.registry[name].push(fn);
        return this;
    }

    Unsub(name: string, fn: ISubscription) {
        if (this.registry[name]) {
            delete this.registry[name];
        }
        return this;
    }

    Clear() {
        this.registry = {};
        return this;
    }
}

export let PubSub: foPubSub = new foPubSub();