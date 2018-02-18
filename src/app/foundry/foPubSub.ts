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

        /**
         * 
         * https://github.com/m-gagne/limit.js
        * debounce
        * @param {integer} milliseconds This param indicates the number of milliseconds
        *     to wait after the last call before calling the original function.
        * @param {object} What "this" refers to in the returned function.
        * @return {function} This returns a function that when called will wait the
        *     indicated number of milliseconds after the last call before
        *     calling the original function.
        */
    debounce(baseFunction, milliseconds, context) {
        var timer = null,
            wait = milliseconds;

        return function () {
            var self = context || this,
                args = arguments;

            function complete() {
                baseFunction.apply(self, args);
                timer = null;
            }

            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(complete, wait);
        };
    };

    /**
* throttle
* @param {integer} milliseconds This param indicates the number of milliseconds
*     to wait between calls before calling the original function.
* @param {object} What "this" refers to in the returned function.
* @return {function} This returns a function that when called will wait the
*     indicated number of milliseconds between calls before
*     calling the original function.
*/
    throttle(baseFunction, milliseconds, context) {
        var lastEventTimestamp = null,
            limit = milliseconds;

        return function () {
            var self = context || this,
                args = arguments,
                now = Date.now();

            if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
                lastEventTimestamp = now;
                baseFunction.apply(self, args);
            }
        };
    };
}

export let PubSub: foPubSub = new foPubSub();