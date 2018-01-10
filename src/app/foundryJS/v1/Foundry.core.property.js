/*
    Foundry.modelManager.core.js part of the FoundryJS project
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


(function (ns, undefined) {

    var suspendDependencyLock = 0;
    var globalDependencyLock = function (cnt) {
        suspendDependencyLock = suspendDependencyLock + cnt;
        if (suspendDependencyLock == 0) {
            return suspendDependencyLock;
        }
        return suspendDependencyLock;
    };

    ns.suspendDependencies = function (callback, target) {
        globalDependencyLock(1);
        callback && callback(target);
        globalDependencyLock(-1);
    }


    var Property = function (owner, name, init) {
        //"use strict";
        // Add an accessor property to the object.
        var namePrivate = "_" + name;
        if (init == null) { //very special case that makes smash to unselected very easy
            init = function () { return null; };
        }

        var initValueComputed = ns.utils.isFunction(init);
        if (init === fo.fromParent) {
            init = function () {
                return fo.fromParent.call(owner, name);
            }
        }

        this.myName = name;
        this.owner = owner;


        //if this value is init as undefined, the status is also undefined and normal value
        //resolution should take place...
        this.formula = initValueComputed ? init : undefined;
        this.status = !initValueComputed && init !== undefined ? "init" : undefined;
        this.value = !initValueComputed ? init : undefined;

        this.thisValueDependsOn = undefined;
        this.thisInformsTheseValues = undefined;
        this.uiBindings = undefined;
        this.onRefreshUi = undefined;
        this.onValueSet = undefined;
        this.onValueDetermined = undefined;
        this.onValueSmash = undefined;

        //you may be to create Components from this collection Spec
        if (ns.utils.isaCollectionSpec(this.value)) {
            var collection = this.value.createCollection(owner); //necessary to maintain observablilty
            collection.myName = name;
            this.value = collection;
        }
            //you may be to clone and reattach this collection 
        else if (ns.utils.isaCollection(this.value) && this.value.owner === undefined) {
            var collection = ns.makeCollection(this.value.elements, owner); //necessary to maintain observablilty
            collection.myName = name;
            this.value = collection;
        }


        Object.defineProperty(owner, name, {
            enumerable: true,
            configurable: true,

            set: function (init) {
                var p = owner[namePrivate];
                var oldValue = p.value;

                var initValueComputed = ns.utils.isFunction(init);
                var newValue = !initValueComputed ? init : undefined;
                var noChange = oldValue == newValue;

                //should anything be done?  
                if (p.status && noChange && !initValueComputed) return;

                if (p.guard) {
                    p.smash();
                    return;
                }


                if (owner.withDependencies) {
                    p.smash();
                    p.removeSmashTrigger();
                }
                else if (init === undefined && p.formula !== undefined) {
                    newValue = p.formula.call(p.owner);
                }

                p.value = newValue;
                p.formula = initValueComputed ? init : p.formula;
                p.status = !initValueComputed ? "given" : undefined;


                fo.publishNoLock('setValue', [p, newValue]);

                //when the value is set directly, it can notify the UI right away
                if (!initValueComputed) {
                    ns.markForRefresh(p);  //the should run right away if no lock
                    if (p.onValueSet) {
                        p.onValueSet.call(p, newValue, p.formula, p.owner);
                    }
                    if (p.formula) {
                        if (p.validate) p.validate.call(p, newValue, p.owner);
                    }
                }

            },

            get: function () {
                var p = owner[namePrivate];
                var result;

                var mustCompute = p.status === undefined;

                if (!owner.withDependencies) {
                    if (mustCompute && p.formula !== undefined) {
                        result = p.formula.call(p.owner);
                        fo.publishNoLock('setValueTo', [p, result]);
                        p.value = result;
                    }
                    return p.value;
                }

                var gComputeStack = owner.globalComputeStack();

                var oDependentValue = gComputeStack ? gComputeStack.peek() : undefined;
                if (!mustCompute) {
                    if (oDependentValue === undefined) return p.value;

                    oDependentValue.addDependency(p);
                    fo.publishNoLock('getValue', [p, p.value]);
                    return p.value;
                }
                else if (oDependentValue === p) {
                    fo.publishNoLock('getValue', [p, p.value]);
                    return p.value;
                }

                    //fully implemented formula dependency tracking 
                else if (mustCompute) {
                    fo.publishNoLock('mustCompute', [p]);

                    if (p.formula !== undefined) {
                        gComputeStack && gComputeStack.push(p);
                        result = p.formula.call(p.owner, p);

                        //undefined results implies that this formula will always recompute when asked..
                        //if you require it to cashe the value return the REAL value to be chashed 

                        p.status = result === undefined ? undefined : 'calculated';
                        var top = gComputeStack ? gComputeStack.pop() : p;
                        if (top != p) {
                            ns.trace && ns.trace.alert("during compute: Something is not working");
                        }
                    }
                    else {
                        //should we be looking for a default value other that undefined?
                        result = p.defaultValue;
                        if (result === undefined && ns.utils.isFunction(p.defaultFormula)) {
                            result = p.defaultFormula.call(p.owner, p);
                        }
                        p.status = result === undefined ? undefined : 'default';

                        //ns.trace.alert(p.asReference + " missing formula");
                    }

                    if (oDependentValue) {
                        oDependentValue.addDependency(p);
                    }

                    //we found a new collection set is up so we can observe it...
                    //list a filtered list
                    if (ns.utils.isaCollection(result) && result.owner === undefined) {
                        result.owner = owner; //necessary to maintain observablilty
                        result.myName = name;
                    }
                    fo.publishNoLock('setValueTo', [p, result]);

                    var oldValue = p.value;
                    p.value = result;

                    if (p.onValueDetermined) {
                        p.onValueDetermined.call(p, result, p.formula, p.owner, oldValue);
                    }
                }
                return result;
            },

        });

        owner[namePrivate] = this;
        return this;
    }

    Property.prototype = {

        getID: function () {
            if (this.guid) return this.guid;
            this.guid = ns.utils.createID(this.myName);
            return this.guid;
        },



        redefine: function (init, guard) {
            this.smash();
            var initValueComputed = ns.utils.isFunction(init);
            this.formula = initValueComputed ? init : undefined;
            this.status = !initValueComputed ? "given" : undefined;
            this.value = !initValueComputed ? init : undefined;
            if (guard) this.guard = guard;
        },

        asLocalReference: function () {
            try {
                if (!this.owner._name) {
                    return this.myName + "@" + this.owner.myName;

                }
                else if (this.owner._name && this.owner._name.status) {
                    return this.myName + "@" + this.owner.myName;
                }
                else {
                    return this.myName + "@OWNER_NAME_NOT_COMPUTED";
                }
            }
            catch (ex) {
                return this.myName + "@???";
            }
        },

        asReference: function () {
            return this.myName + "@" + this.owner.asReference();
        },

        asDisplayValue: function () {
            if (fo.utils.isManaged(this.value)) return '=> ' + this.value.myName;
            return this.value;
        },

        resolveReference: function (reference) {
            if (this.myName.match(reference) || ns.utils.isSelf(reference)) return this;
            var result = this.owner.resolveReference(reference);
            return result;
        },

        resolveSuperior: function (reference) {
            if (this.myName.match(reference) || ns.utils.isSelf(reference)) return this;
            var result = this.owner.resolveSuperior(reference);
            return result;
        },

        resolveProperty: function (reference) {
            var result = {};

            result.property = this;
            result.meta = reference && '@'.matches(reference) ? undefined : reference;

            return result;
        },

        getProperty: function (name, search) {
            if (name.matches(this.myName)) return this;
            return search && this.owner ? this.owner.getProperty(name, search) : undefined;
        },

        smashProperty: function (name, search) {
            var property = this.getProperty(name, search);
            if (property && property.status) {
                property.smash();
            }
            return property;
        },

        smashPropertyTree: function (name) {
            var property = this.smashProperties(name);
            var parent = this.myParent;
            return parent ? parent.smashPropertyTree(name) : property;
        },

        smashPropertyBranch: function (name) {
            this.smashProperties(name);
            this.Subcomponents.forEach(function (item) {
                item.smashPropertyBranch(name);
            });
        },

        addDependency: function (prop) {
            //prevent adding a dependency to yourself
            if (this === prop) return this;
            if (suspendDependencyLock) {
                return this;
            }

            if (this.thisValueDependsOn === undefined) {
                this.thisValueDependsOn = [];
            }

            if (this.thisValueDependsOn.addNoDupe(prop)) {
                fo.publishNoLock('nowDependsOn', [this, prop]);
            }


            if (prop.thisInformsTheseValues === undefined) {
                prop.thisInformsTheseValues = [];
            }

            if (prop.thisInformsTheseValues.addNoDupe(this)) {
                fo.publishNoLock('nowInforms', [prop, this]);
            }

            return this;
        },

        removeDependency: function (prop) {
            if (this.thisValueDependsOn) {
                this.thisValueDependsOn.removeItem(prop);
            }
            else {
                fo.publishNoLock('dependsOnNotRemoved', [this, prop]);
            }


            if (prop.thisInformsTheseValues) {
                prop.thisInformsTheseValues.removeItem(this);
            }
            else {
                fo.publishNoLock('informsNotRemoved', [prop, this]);
            }

            fo.publishNoLock('noLongerDependsOn', [this, prop]);


            return this;
        },

        valueDependsOnCount: function () {
            return this.thisValueDependsOn ? this.thisValueDependsOn.length : 0;
        },

        informsTheseValuesCount: function () {
            return this.thisInformsTheseValues ? this.thisInformsTheseValues.length : 0;
        },

        removeSmashTrigger: function () {
            //this part is new and is needed to set/lock values overriden by user...
            //typically this happens through UI because status and value are not SET through
            //Setter function during the calculation
            //now tell values that I previously dependend on that this value is independent
            var that = this;

            //notify values that depend on me..
            if (this.valueDependsOnCount() > 0) {
                //make a copy so the graps is not changed out during this operation
                if (this.thisValueDependsOn.length == 1) {
                    this.removeDependency(this.thisValueDependsOn[0]);
                }
                else {
                    this.thisValueDependsOn.duplicate().forEach(function (prop) {
                        that.removeDependency(prop)
                    });
                }
            }
        },

        isolateFromSmash: function () {
            if (this.thisValueDependsOn && this.thisValueDependsOn.length > 0) {
                this.removeSmashTrigger();
                this.thisValueDependsOn = [];
            }
            this.status = 'isolated';
            fo.publishNoLock('isolated', [this]);//" is now isolated, it should not smash ever again")
        },

        smash: function () {
            if (this.status) {

                if (this.onValueSmash) {
                    this.onValueSmash.call(this, this.value, this.formula, this.owner);
                }

                if (this.formula) {
                    this.status = undefined;
                }
                else if (this.status != 'init') {
                    this.status = undefined;
                }

                fo.publishNoLock('smash', [this, this.value]);

                var that = this;
                that.smashAndRemove = function (prop) {
                    prop.removeDependency(that);
                    if (prop.status) {
                        fo.publishNoLock('smashed', [that]);
                        if (prop.status) {
                            fo.publishNoLock('thenSmashes', [prop]);
                        }
                    }
                    prop.smash();
                }

                //notify values that depend on me..
                if (this.informsTheseValuesCount() > 0) {
                    //make a copy so the graps is not changed out during this operation
                    if (this.thisInformsTheseValues.length == 1) {
                        that.smashAndRemove(this.thisInformsTheseValues[0]);
                    }
                    else {
                        var list = this.thisInformsTheseValues.duplicate();
                        this.thisInformsTheseValues = [];
                        list.forEach(that.smashAndRemove);
                    }
                }

                //this should push for delay is binding to UI
                //also mark if anyone is interested on Refresh
                if (this.uiBindings || this.onRefreshUi) {
                    ns.markForRefresh(this);
                }

                //if (ns.digestLockCount > 0) {
                //    ns.markForDigest(this);
                //}
            }
            return this;
        },


        addBinding: function (binding, queueForRefresh) {
            this.uiBindings = this.uiBindings === undefined ? [] : this.uiBindings;

            if (ns.utils.isFunction(binding)) {
                this.uiBindings.push(binding);
                //put new bindings on the refresh Queue...
                //maybe we a pub sub in the future
                if (queueForRefresh !== false) {
                    ns.markForRefresh(this);
                }

            }
            else {
                ns.trace.alert("Binding must be a formula");
            }

            //if ((this.debug || this.owner.debug) && ns.trace) {
            //    ns.trace.w(this.asReference() + " binding added " + binding.toString());
            //}
            return this;
        },

        clearBinding: function () {
            if (this.uiBindings === undefined) {
                return;
            }
            this.uiBindings = undefined;
            //if ((this.debug || this.owner.debug) && ns.trace) {
            //    ns.trace.w(this.asReference() + " clear bindings ");
            //}
            return this;
        },

        purgeBindings: function (deep) {
            var result = this.uiBindings !== undefined
            if (this.uiBindings && this.uiBindings.length) {
                this.uiBindings.forEach(function (item) {
                    delete item;
                });
            }
            this.uiBindings = undefined;
            return result;
        },

        updateBindings: function () {
            if (this.uiBindings !== undefined) {
                var list = this.uiBindings.duplicate();
                try {
                    for (i = 0; i < list.length; i++) {
                        var func = list[i];
                        func.call(this, this, this.owner);
                    }
                }
                catch (err) {
                    ns.trace && ns.trace.alert(err);
                }

                //if ((this.owner.debug || this.debug) && ns.trace) {
                //    ns.trace.w("update bindings: " + this.asReference() + " status: " + this.status + " Value =" + this.value);
                //}
            }
            return this;
        },

        stringify: function (that) {
            var target = that || this;
            //http://stackoverflow.com/questions/6754919/json-stringify-function

            function ResolveCircular(key, value) {
                //if (target.hasOwnProperty(key)) {
                //    return undefined;
                //}
                switch (key) {
                    case 'owner':
                        //obsolite case 'dataContext':
                    case 'myParent':
                        return value ? value.asReference() : value;
                    case 'formula':
                        return ns.utils.isFunction(value) ? ns.utils.cleanFormulaText(value) : value;
                    case 'thisValueDependsOn':
                    case 'thisInformsTheseValues':
                    case 'uiBindings':
                    case 'onRefreshUi':
                        return undefined;
                }

                if (ns.utils.isaPromise(value)) return "Promise";
                return value;
            }

            return JSON.stringify(target, ResolveCircular, 3);
        },



        refreshUi: function () {
            this.updateBindings();
            if (this.onRefreshUi) {
                this.getValue();  //force this to be resolved before caling
                this.onRefreshUi.call(this, this, this.owner);
            }
            return this;
        },

        doCommand: function (context, meta, form) {

            if (this.status) return this.value;

            var command = this.formula;

            if (meta !== undefined && ns.utils.isFunction(this[meta])) {
                command = this[meta];  //you might want to call a local function like SMASH or refreshUI
                //maybe should return value of extra here if not a function
                return command.call(this, context);
            }
            else if (command !== undefined) {
                //do not track dependencies only because it conflicts
                //with normal execution
                var result = command.call(this.owner, context, meta, form);
                //you might be able to determine how many arg the function has
                this.status = result === undefined ? undefined : 'calculated';
                this.value = result;

                return result;
            }
            else if (command === undefined) {
                return this.getValue(meta);
            }

        },
        isValueKnown: function () {
            return this.status ? true : false;
        },
        //used in binding an get and set the value from the owner
        getValue: function (meta) {
            if (meta === undefined) {
                return this.owner[this.myName];
            };
            var item = this.getMetaData(meta);
            return item;
        },

        getValueAsync: function (meta) {
            //simulate a promise so you can use the then method to process value consistantly
            var result = this.getValue(meta);
            if (ns.utils.isaPromise(result)) return result;

            var promise = new ns.Promise(this.owner, meta);
            promise.value = result;
            return promise;
        },

        //used in binding an get and set the value from the owner
        setValue: function (init) {
            this.owner[this.myName] = init;
        },

        refreshValue: function (init) {
            var prop = this;
            ns.runWithUIRefreshLock(function () {
                prop.setValue(init)
            });
        },

        //there are additional 'meta' slots that contain Meta or Reference data on property objects
        getMetaData: function (meta, metaDefault) {
            if (meta === undefined || this[meta] === undefined) {
                return metaDefault;
            }

            var result = metaDefault;
            var slot = this[meta];

            if (ns.utils.isFunction(slot)) {
                result = slot.call(this);
            }
            else if (slot !== undefined) {
                result = slot;
            }

            //but you must return in the future to resolve this...
            if (ns.utils.isaPromise(result) && metaDefault !== undefined) {
                return metaDefault;
            }
            return result;
        },

        getMetaDataAsync: function (meta, metaInit) {
            //simulate a promise so you can use the then method to process value consistantly
            var result = this.getMetaData(meta, metaInit);
            if (ns.utils.isaPromise(result)) return result;

            result = result ? result : this.status ? this.value : undefined;
            var promise = new ns.Promise(this.owner, meta);
            promise.value = result;
            return promise;
        },

        setMetaData: function (meta, metaInit) {
            if (meta !== undefined) {
                this[meta] = metaInit;
            }
            return this;
        },

        extendWith: function (list) {
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    this[key] = list[key];
                }
            }
            return this;
        },

        createView: function (view, id) {
            var target = view && this[view] ? this[view] : this;
            var result = target.makeUi ? target.makeUi.call(this, id) : "";
            return result;
        },

        extendUi: function (list, view) {
            var target = this;
            //if (view && this[view] === undefined) {
            //    target = this[view] = { dataContext: this };
            //} else {
            //    this.dataContext = this;
            //}

            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    target[key] = list[key];
                }
            }
            return this;
        },

        reCompute: function () {
            if (this.formula) {
                this.smash();
                return this.compute();
            }
        },

        compute: function () {
            return this.getValue();
        },
    }

    ns.Property = Property;

    var Counter = function (owner) {
        this.base = ns.Property;
        this.base(owner, 'count', function () { return this.elements.length; });
        return this;
    };

    Counter.prototype = (function () {
        var anonymous = function () { this.constructor = Counter; };
        anonymous.prototype = ns.Property.prototype;
        return new anonymous();
    })();

    Counter.prototype.smash = function () {
        var result = this.base.prototype.smash.call(this);
        return result;
    };

    Counter.prototype.addDependency = function (prop) {
        var result = this.base.prototype.smash.addDependency(this, prop);
        return result;
    };

    Counter.prototype.removeDependency = function (prop) {
        var result = this.base.prototype.smash.removeDependency(this, prop);
        return result;
    };

    Counter.prototype.asLocalReference = function () {
        var result = this.myName + "@" + this.owner.myName;
        if (this.owner.owner) result += "." + this.owner.owner.myName;
        return result;
    };

    ns.Counter = Counter;

}(Foundry));