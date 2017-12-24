"use strict";

interface ISubscription {
    (...args: any[]): void;
}

interface IDictionary {
    [name: string]: ISubscription[];
}

class foPubSub {
    private registry: IDictionary = {}

    Pub = function (name: string, ...args: any[]) {
        if (!this.registry[name]) return;
        this.registry[name].forEach(x => {
            x.apply(null, args);
        });
    }

    Sub = function (name: string, fn: ISubscription) {
        if (!this.registry[name]) {
            this.registry[name] = [fn];
        } else {
            this.registry[name].push(fn);
        }
    }

    Unsub = function (name: string, fn: ISubscription) {
        if (this.registry[name]) {
            delete this.registry[name];
        }
    }
}

export let PubSub: foPubSub = new foPubSub();