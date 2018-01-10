var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};


(function (undefined) {

    if (!Array.prototype.peek) {
        Array.prototype.peek = function () {
            if (this.length > 0) {
                var i = this.length - 1;
                return this[i];
            }
        }
    };


})();

(function (ns, tools, undefined) {

    var suspendDependencyLock = 0;
    var globalDependencyLock = function (cnt) {
        suspendDependencyLock = suspendDependencyLock + cnt;
        if (suspendDependencyLock == 0) {
            fo.publish('info', ['globalDependencyLock', suspendDependencyLock]);
            return suspendDependencyLock;
        }
        fo.publish('info', ['globalDependencyLock', suspendDependencyLock]);
        return suspendDependencyLock;
    };

    ns.suspendDependencies = function (callback, target) {
        globalDependencyLock(1);
        var result = callback && callback(target);
        globalDependencyLock(-1);
        return result;
    }

    var _rootComputestack = new Array();
    //code to support dependency tracking
    ns.globalComputeStack = function () {
        return _rootComputestack;
    };

    ns.globalComputeStackPush = function (obj) {
        _rootComputestack && _rootComputestack.push(obj);
        return obj;
    };

    ns.globalComputeStackPop = function (objIfEmpty) {
        var obj = _rootComputestack && _rootComputestack.pop();
        return obj ? obj : objIfEmpty;
    };

     ns.currentComputingProperty = function () {
         return _rootComputestack && _rootComputestack.peek();
     };


     function getManager(parent) {
         var managed = parent._managed;
         if (!managed) throw new Error("managed property does not exist " + name);

         return managed;
     }

    function getProperty(parent, name) {
        var managed = parent._managed;
        if (!managed) throw new Error("managed property does not exist " + name);
        
        return managed[name];
    }

    function setProperty(parent, name, value) {
        var managed = parent._managed;
        if (!managed) {
            managed = parent._managed = {};
        }
        var slot = managed[name];
        if (slot && slot != value) {
            throw new Error("cannot replace managed property " + name);
        }

        return managed[name] = value;
    }

    function findProperty(parent, name) {
        var managed = parent._managed;
        return managed && managed[name];
    }

    var Property = function (owner, name, init) {
        //"use strict";
        if (init == null) { //very special case that makes smash to unselected very easy
            init = function () { return null; };
        }

        var initValueComputed = tools.isFunction(init);
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
        this.onValueSet = undefined;
        this.onValueDetermined = undefined;
        this.onValueSmash = undefined;

        ////you may be to create Components from this collection Spec
        //if (tools.isaCollectionSpec(this.value)) {
        //    var collection = this.value.createCollection(owner); //necessary to maintain observablilty
        //    collection.myName = name;
        //    this.value = collection;
        //}
        //    


        Object.defineProperty(owner, name, {
            enumerable: true,
            configurable: true,

            set: function (init) {
                var p = getProperty(owner, name);
                var oldValue = p.value;

                var initValueComputed = tools.isFunction(init);
                var newValue = !initValueComputed ? init : undefined;
                var noChange = oldValue == newValue;

                //should anything be done?  
                if (p.status && noChange && !initValueComputed) return;

                if (p.guard) {
                    p.smash();
                    return;
                }


                //if (owner.withDependencies) {
                    p.smash();
                    p.removeSmashTrigger();
                //}
                //else if (init === undefined && p.formula !== undefined) {
                //    newValue = p.formula.call(p.owner);
                //}

                p.value = newValue;
                p.formula = initValueComputed ? init : p.formula;
                p.status = !initValueComputed ? "given" : undefined;


                fo.publishNoLock && fo.publishNoLock('setValue', [p, newValue]);

                //when the value is set directly, it can notify the UI right away
                if (!initValueComputed) {
                    //ns.markForRefresh(p);  //the should run right away if no lock
                    if (p.onValueSet) {
                        p.onValueSet.call(p, newValue, p.formula, p.owner);
                    }
                    if (p.formula) {
                        if (p.validate) p.validate.call(p, newValue, p.owner);
                    }
                }

            },

            get: function () {
                var p = getProperty(owner, name);
                var result;

                var mustCompute = p.status === undefined;

                //if (!owner.withDependencies) {
                //    if (mustCompute && p.formula !== undefined) {
                //        result = p.formula.call(p.owner);
                //        fo.publishNoLock('setValueTo', [p, result]);
                //        p.value = result;
                //    }
                //    return p.value;
                //}

                var oDependentValue = ns.currentComputingProperty();
                if (!mustCompute) {
                    if (oDependentValue === undefined) return p.value;

                    oDependentValue.addDependency(p);
                    fo.publishNoLock && fo.publishNoLock('getValue', [p, p.value]);
                    return p.value;
                }
                else if (oDependentValue === p) {
                    fo.publishNoLock && fo.publishNoLock('getValue', [p, p.value]);
                    return p.value;
                }

                    //fully implemented formula dependency tracking 
                else if (mustCompute) {
                    fo.publishNoLock && fo.publishNoLock('mustCompute', [p]);

                    if (p.formula !== undefined) {
                        ns.globalComputeStackPush(p);
                        result = p.formula.call(p.owner, p);

                        //undefined results implies that this formula will always recompute when asked..
                        //if you require it to cashe the value return the REAL value to be chashed 

                        p.status = result === undefined ? undefined : 'calculated';
                        var top = ns.globalComputeStackPop(p);
                        if (top != p) {
                            fo.publishNoLock && fo.publishNoLock('error', [p.asLocalReference(), ' during compute: Something is not working:' + owner.myName]);

                            ns.trace && ns.trace.alert("during compute: Something is not working");
                        }
                    }
                    else {
                        //should we be looking for a default value other that undefined?
                        result = p.defaultValue;
                        if (result === undefined && tools.isFunction(p.defaultFormula)) {
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
                    //if (tools.isaCollection(result) && result.owner === undefined) {
                    //    result.owner = owner; //necessary to maintain observablilty
                    //    result.myName = name;
                    //}
                    fo.publishNoLock && fo.publishNoLock('setValueTo', [p, result]);

                    var oldValue = p.value;
                    p.value = result;

                    if (p.onValueDetermined) {
                        p.onValueDetermined.call(p, result, p.formula, p.owner, oldValue);
                    }
                }
                return result;
            },

        });

        setProperty(owner, name, this);
        return this;
    }


    Property.prototype = {

        //toJSON: function(meta) {
        //    return 'xxx';
        //},

        toString: function() {
            return this.myName;
        },

        redefine: function (init, guard) {
            this.smash();
            var initValueComputed = tools.isFunction(init);
            this.formula = initValueComputed ? init : undefined;
            this.status = !initValueComputed ? "given" : undefined;
            this.value = !initValueComputed ? init : undefined;
            if (guard) this.guard = guard;
        },

        asLocalReference: function () {
            try {
                //you need to peek at these values so you get no dependencies

                if (!this.owner.myName) {
                    return this.myName + "@" + this.owner.myType + '::' + this.owner.myName;
                }
                else if (this.owner.myName && this.status) {
                    return this.myName + "@" + this.owner.myType + '::' + this.owner.myName;
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
            return this.myName + this.asOwnerReference();
        },

        asOwnerReference: function () {
            
            return this.owner ? '@' + this.owner.asReference(): '@'
        },


        asDisplayValue: function () {
            if (tools.isManaged(this.value)) return '=> ' + this.value.myName;
            return this.value;
        },

        resolveReference: function (reference) {
            if (this.myName.match(reference) || tools.isSelf(reference)) return this;
            var result = this.owner.resolveReference(reference);
            return result;
        },

        resolveSuperior: function (reference) {
            if (this.myName.match(reference) || tools.isSelf(reference)) return this;
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

        addDependency: function (prop, force) {
            
            //prevent adding a dependency to yourself
            if (this === prop || (suspendDependencyLock && !force)) {
                return this;
            }


            if (this.thisValueDependsOn === undefined) {
                this.thisValueDependsOn = [];
            }

            if (this.thisValueDependsOn.addNoDupe(prop)) {
                fo.publishNoLock && fo.publishNoLock('nowDependsOn', [this, prop]);
            }


            if (prop.thisInformsTheseValues === undefined) {
                prop.thisInformsTheseValues = [];
            }

            if (prop.thisInformsTheseValues.addNoDupe(this)) {
                fo.publishNoLock && fo.publishNoLock('nowInforms', [prop, this]);
            }

            return this;
        },

        removeDependency: function (prop) {
            if (this.thisValueDependsOn) {
                this.thisValueDependsOn.removeItem(prop);
            }
            else {
                fo.publishNoLock && fo.publishNoLock('dependsOnNotRemoved', [this, prop]);
            }


            if (prop.thisInformsTheseValues) {
                prop.thisInformsTheseValues.removeItem(this);
            }
            else {
                fo.publishNoLock && fo.publishNoLock('informsNotRemoved', [prop, this]);
            }

            fo.publishNoLock && fo.publishNoLock('noLongerDependsOn', [this, prop]);
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

        //isolateFromSmash: function () {
        //    if (this.thisValueDependsOn && this.thisValueDependsOn.length > 0) {
        //        this.removeSmashTrigger();
        //        this.thisValueDependsOn = [];
        //    }
        //    this.status = 'isolated';
        //    fo.publishNoLock('isolated', [this]);//" is now isolated, it should not smash ever again")
        //},

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

                fo.publishNoLock && fo.publishNoLock('smash', [this, this.value]);

                var that = this;
                that.smashAndRemove = function (prop) {
                    prop.removeDependency(that);
                    if (prop.status) {
                        fo.publishNoLock && fo.publishNoLock('smashed', [that]);
                        if (prop.status) {
                            fo.publishNoLock && fo.publishNoLock('thenSmashes', [prop]);
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


        doCommand: function (context, meta, form) {

            if (this.status) return this.value;

            var command = this.formula;

            if (meta !== undefined && tools.isFunction(this[meta])) {
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
        isValueUnknown: function () {
            return this.status === undefined;
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
            if (tools.isaPromise(result)) return result;

            var promise = new ns.Promise(this.owner, meta);
            promise.value = result;
            return promise;
        },

        //used in binding an get and set the value from the owner
        setValue: function (init) {
            this.owner[this.myName] = init;
        },

        //refreshValue: function (init) {
        //    var prop = this;
        //    ns.runWithUIRefreshLock(function () {
        //        prop.setValue(init)
        //    });
        //},

        extendWith: function (list) {
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    this[key] = list[key];
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
    ns.Property.capture = setProperty;

    ns.Property.getManager = getManager;
    ns.Property.find = findProperty;
    ns.makeProperty = function (owner, name, init) {
        return new ns.Property(owner, name, init);
    };

    //since this does not inherit from DTO a custom version that uses instanceOf is used
    tools.isaProperty = function (obj) {
        return obj && obj instanceof Property;
    };



}(Foundry, Foundry.tools));


(function (ns, tools, undefined) {

    var LinkCounter = function (owner, name) {
        this.base = ns.Property;
        this.base(owner, name || 'count', function () { return owner.myMembers ? owner.myMembers.length : 0; });
        return this;
    };

    LinkCounter.prototype = (function () {
        var anonymous = function () { this.constructor = LinkCounter; };
        anonymous.prototype = ns.Property.prototype;
        return new anonymous();
    })();

    LinkCounter.prototype.smash = function () {
        var result = this.base.prototype.smash.call(this);
        return result;
    };

    LinkCounter.prototype.addDependency = function (prop) {
        var result = this.base.prototype.smash.addDependency(this, prop);
        return result;
    };

    LinkCounter.prototype.removeDependency = function (prop) {
        var result = this.base.prototype.smash.removeDependency(this, prop);
        return result;
    };

    LinkCounter.prototype.asLocalReference = function () {
        var result = this.myName + "@" + this.owner.myName;
        if (this.owner.owner) result += "." + this.owner.owner.myName;
        return result;
    };

    ns.LinkCounter = LinkCounter;

}(Foundry, Foundry.tools));


(function (ns, tools, undefined) {

    var Counter = function (owner, name) {
        this.base(owner, name || 'count', function () { return owner.elements.length; });
        return this;
    };

    Counter.prototype = (function () {
        var anonymous = function () {
            this.constructor = Counter;
            this.base = ns.Property;
        };
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

}(Foundry, Foundry.tools));
