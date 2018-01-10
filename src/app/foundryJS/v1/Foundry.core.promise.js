/*
    Foundry.core.Promise.js part of the FoundryJS project
    Copyright (C) 2012 Steve Strong  http://foundryjs.azurewebsites.net/

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var Foundry = Foundry || {};
var fo = Foundry;


(function (ns, q, undefined) {



    //this is designed to be obserervable
    var Promise = function (owner, name, onSuccess, onFailure) {
        var gComputeStack = owner.globalComputeStack();

        this.promisedToProperty = gComputeStack ? gComputeStack.peek() : this;
        this.value = undefined;
        this.owner = owner;
        this.myName = name;
        this.onSuccess = onSuccess;
        this.onFailure = onFailure ? onFailure : function () { return ns.trace.alert("missing OnFailure"); };

        this.futures = [];
        this.futureError = function () { return ns.trace.alert("Promise was broken"); };
        return this;
    }

    //http://blogs.msdn.com/b/ie/archive/2011/09/11/asynchronous-programming-in-javascript-with-promises.aspx

    Promise.prototype = {
        isWaiting: function () {
            if (ns.utils.isaProperty(this.promisedToProperty)) return true;
            return ns.utils.isArray(this.futures) && this.futures.length > 0;
        },
        whileWaiting: function (waitingCallback) {
            if (this.isWaiting() && this.value === undefined) {
                if (ns.utils.isFunction(waitingCallback)) waitingCallback();
            }
            return this;
        },
        continueWith: function (continueCallback) {  //execute this function as soon as you have a value
            var newValue = this.value;

            if (!this.isWaiting() && newValue !== undefined) {
                this.runFutures(newValue);
                if (ns.utils.isFunction(continueCallback)) {
                    continueCallback(newValue);
                }
                return this;
            }
            else if (ns.utils.isFunction(continueCallback)) {
                this.futures.push(continueCallback);
            }

            return this;
        },
        errorWith: function (errorCallback) {
            this.futureError = errorCallback;
            return this;
        },
        runFutures: function (newValue) {
            if (ns.utils.isArray(this.futures)) {

                for (var i = 0, len = this.futures.length >>> 0; i < len; i++) {
                    this.futures[i](newValue);
                }
                this.futures = undefined; //one then done,  just one shot...
                this.futureError = undefined;
            }

            //if ((this.promisedTo.owner.debug || this.promisedTo.debug) && ns.trace) {
            //    ns.trace.w("continueWith bindings: " + this.asReference() + " status: " + this.status + " Value =" + this.value);
            //}
        },
        fulfillPromised: function (newValue) {
            if (ns.utils.isaProperty(this.promisedToProperty)) {
                this.value = newValue;
                this.promisedToProperty.setValue(newValue);
                this.promisedToProperty = undefined;
                this.runFutures(newValue);
            }
        },
        breakPromised: function (error) {
            this.promisedToProperty = undefined;
            this.futures = undefined; //one then done,  just one shot...

            if (ns.utils.isFunction(this.onError)) this.onError(error)
            if (ns.utils.isFunction(this.futureError)) this.futureError(error)
        },

        onComplete: function (result) {
            var self = this;
            ns.runWithUIRefreshLock(function () {
                self.onSuccess(result);
            });
            //this.owner.updateUi();
        },
        onError: function () {
            var self = this;
            var args = this.arguments;
            ns.runWithUIRefreshLock(function () {
                self.onFailure(args); //do we need a 
            });
            //this.owner.updateUi();
        },
    }

    ns.Component.prototype.createAsyncToken = function (name, onSucess, onFailure) {
        return new Promise(this, name, onSucess, onFailure);
    },

    ns.Promise = Promise;

}(Foundry, Q));