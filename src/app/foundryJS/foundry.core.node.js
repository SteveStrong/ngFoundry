
var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};

(function (ns, tools, undefined) {

    //in prep for prototype pattern...
    var Node = function (properties, subcomponents, parent) {
        //"use strict";

        this.myName = properties && properties.myName || undefined;
        this.myParent = tools.isFunction(parent) ? parent() : parent;
        this.myType = 'Node';

        if (this.myName) {
            delete properties.myName;
        }

        if (tools.isFunction(properties)) {
            var list = properties.call(this, this);
            this.mergeProperties(list);
        }
        else if (properties) {
            this.mergeProperties(properties);
        }


        if (tools.isFunction(subcomponents)) {
            var list = subcomponents.call(this, this);
            this.establishSubcomponents(list);
        }
        else if (subcomponents && subcomponents.length) {
            this.establishSubcomponents(subcomponents);
        }

        return this;
    }

    Node.prototype = (function () {
        var anonymous = function () { this.constructor = Node; };
        anonymous.prototype = ns.DTO && ns.DTO.prototype;
        return new anonymous();
    })();

    ns.Node = Node;
    ns.Node.capture = function (parent, name, value) {
        value.myName = value.myName || name;
        value.myParent = parent;

        parent[name] = value;
        return parent;
    };

    Node.make = function (properties, subcomponents, parent) {
        return new ns.Node(properties, subcomponents, parent);
    }

    ns.makeNode = Node.make

    tools.isaNode = function (obj) {
        return obj && obj.isInstanceOf(Node);
    };

    ns.fromParent = function (propertyName) {
        //var result = this.resolvePropertyReference(propertyName + '@');
        var parent = this.myParent;
        if (!parent) throw new Error("the property " + propertyName + " does not have a parent");

        var result;
        if (parent && parent.resolveSuperior) {
            result = parent.resolveSuperior(propertyName);
        }
        else if (parent && parent.hasOwnProperty(propertyName)) {
            result = parent[propertyName];
            return result;
        }

        if (result === undefined) {
            if (!parent.hasOwnProperty(propertyName)) {
                throw new Error("the property " + propertyName + " does not exist on the parent");
            }
        }
        return result;
    }



    //Prototype defines functions using JSON syntax
    tools.mixin(Node.prototype, {
        /**
         * 
         */
        asReference: function () {
            if (!this.myGuid) {
                this.myGuid = tools.generateUUID();
            }
            return this.myGuid;
        },
        unique: function (onComplete) {
            this.asReference();
            onComplete && onComplete(this);
            return this;
        },
        /**
         * 
         */
        toString: function () {
            var name = this.myName ? this.myName : "";
            var type = this.myType ? this.myType : "";
            var text = "{0};{1}".format(name, type)
            return text;
        },
        toJSON: function () {
            return this;
        },
        /**
         * 
         */
        isInstanceOf: function (type) {
            return this instanceof type ? true : false;
        },
        /**
         * 
         */
        isType: function (type) {
            if (type === this.myType) return true;
            if (!this.myType) return false;
            //remember a type may be preceeded with a namespace  knowtshare::note
            return type && type.matches(this.myType);
        },
        /**
         * 
         */
        isOfType: function (type) {
            var found = this.isType(type);
            if (found) return true;
            var myType = tools.getType(this);
            return type && type.matches(myType);
        },
        /**
         * 
         */
        setMyName: function (name, owner) {
            this.myName = name;
            if (owner) {
                owner[name] = this;
            }
            return this;
        },
        /**
         * 
         */
        mergeProperties: function (spec) {
            for (var key in spec) {
                var value = spec[key];
                if (tools.isFunction(value)) {
                    var name = tools.getFunctionName(value);
                    if (name === key) {
                        this.makeComputeOnceValue(key, value);
                    } else {
                        this.makeComputedValue(key, value);
                    }
                } else {
                    this[key] = value;
                }
            };
            return this;
        },
        resolveSuperior: function (reference, meta) {
            var obj = this;
            if (tools.isSelf(reference)) return obj;

            var result = this.getManagedProperty && this.getManagedProperty(reference)
            if (result) return result.getValue(meta);

            //if no result was found look for a simple unmanaged property
            result = this[reference];

            if (!result && this.myParent) {
                return this.myParent.resolveSuperior(reference, meta);
            }
            //the search for a value has failed
            return result;
        },

        metaData: function () {
            return fo.meta ? fo.meta.findMetadata(this.myType) : {};
        },

        userInputs: function (key) {
            var inputs = fo.meta ? fo.meta.findUserInputs(this.myType, key) : [];
            return inputs;
        },

        getInputSpec: function (ignoreDependencies) {
            var spec = {};
            var self = this;
            var funct = self.getManagedProperty;
            var oDependentValue = fo.currentComputingProperty();
            self.userInputs().map(function (input) {
                var mp = funct && funct.call(self, input.myName)
                if (!ignoreDependencies && oDependentValue) { oDependentValue.addDependency(mp) };
                if (mp) {
                    spec[input.myName] = mp.value;
                }
            });
            return spec;
        },

        getInputProperties: function () {
            return {};
        },

        smashProperty: function (name) {
            try {
            } catch (ex) {
            }
        },
        /**
         * 
         */
        //mergeLinks: function (links) {
        //    var self = this;
        //    self.myLinks = self.myLinks || [];
        //    links && links.forEach(function (item) {
        //        if (self.myLinks.indexOf(item) >= 0) {
        //            return;
        //        };
        //        self.myLinks.push(item);
        //    })
        //    return self;
        //},

        /**
         * 
         */
        mergeMethods: function (spec) {
            for (var key in spec) {
                this[key] = spec[key];
            };
            return this;
        },
        /**
         * 
         */
        makeComputedValue: function (key, init) {
            var self = this;
            var isFunct = tools.isFunction(init);
            var funct = isFunct ? init : function () { return init; };
            Object.defineProperty(self, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    var result = funct.call(self, self);
                    return result;
                },
                set: function (newValue) {
                    var isFunct = tools.isFunction(newValue);
                    funct = isFunct ? newValue : function () { return newValue };
                }
            });
            return self;
        },

        /**
         * 
         */
        makeComputeOnceValue: function (key, init) {
            var self = this;
            var result = init;
            var initValueComputed = tools.isFunction(init);
            Object.defineProperty(self, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    if (initValueComputed) {
                        initValueComputed = false;
                        result = init.call(self, self);
                    }
                    return result;
                },
            });
            return self;
        },

        syncronizeManagedProperty: function (prop, onComplete) {
            if (!prop || !fo.makeProperty) return;

           
            var sync = fo.makeProperty(this, prop.myName + 'Sync', '');
            sync.addDependency(prop);
            prop.onValueDetermined = function (newValue, formula, owner) {
                sync.onValueDetermined && sync.onValueDetermined(newValue, formula, owner)
            }
            onComplete && onComplete(sync, prop)
            return sync;
        },

        capture: function (component, name, join) {
            var oldParent = this.captureSubcomponent(component, name, join);
            return oldParent;
        },
        removeFromModel: function () {
            var obj = this;
            obj.myParent && obj.myParent.removeSubcomponent(obj);
            obj.myParent = undefined;
            //obj.purgeBindings(true);
            return obj;
        },

        deleteAndPurge: function () {
            var obj = this;
            obj.removeFromModel();
            //add extra code to destroy this object and the memory it holds
        },
        canCaptureSubcomponent: function (component) {
            if (!tools.isaNode(component)) return false;
            //this should look up the complete chain to prevent cycles
            return this !== component && this !== component.myParent;
        },

        captureSubcomponent: function (component, name, join) {
            var newParent = this;
            var oldParent = component.myParent;
            if (newParent.canCaptureSubcomponent(component)) {
                if (name) {
                    component.myName = name;
                    if (join) newParent[name] = component;
                }
                if (oldParent && oldParent != newParent) {
                    oldParent.removeSubcomponent(component);
                    if (join) delete oldParent[name];
                }
                newParent.addSubcomponent(component);
                return oldParent;
            }
        },
        establishSubcomponents: function (list, clear) {
            var self = this;
            if (clear && this.subcomponents) {
                this.subcomponents.forEach(function (item) {
                    if (item.myParent == self) {
                        item.myParent = undefined;
                    }
                })
                this.subcomponents = undefined;
            }
            list.forEach(function (item) {
                self.addSubcomponent(item);
            });
        },
        addSubcomponent: function (subNode) {
            if (!this.subcomponents) {
                this.subcomponents = [];
            }
            subNode.myParent = this;
            this.subcomponents.push(subNode);
        },

        removeSubcomponent: function (subNode) {
            this.subcomponents && this.subcomponents.remove(subNode);
        },

        getSubcomponent: function (name, deep) {
            if (!this.subcomponents || !name) return;

            var found = this.subcomponents.filter(function (item) {
                return name.matches(item.myName);
            }).itemByIndex(0);
            if (found || !deep || !name) return found;

            if (name.matches(this.myName)) return this;

            this.subcomponents.forEach(function (item) {
                if (!found) {
                    found = item.getSubcomponent(name, deep);
                }
            });
            return found;
        },

        mySubcomponents: function () {
            return this.subcomponents ? this.subcomponents : [];
        },

        getLink: function (name) {
            return this[name] ? this[name] : [];
        },

        getSnap: function (name) {
            return this[name] ? this[name] : {};
        },

        evaluate: function (copy) {
            var copy = copy || { };
            tools.forEachKeyValue(this, function (key, value) {
                copy[key]= value;
            });
            return this;
        },
        tracePropertyLifecycle: function (name, search) {
            var prop = this.getManagedProperty(name)

            if (prop) {
                prop.onValueDetermined = function (value, formula, owner) {
                    fo.publish('info', [prop.asLocalReference(), ' onValueDetermined:' + owner.myName + '  value=' + value]);
                }
                prop.onValueSmash = function (value, formula, owner) {
                    fo.publish('error', [prop.asLocalReference(), ' onValueSmash:' + owner.myName]);
                }
                prop.onValueSet = function (value, formula, owner) {
                    fo.publish('warning', [prop.asLocalReference(), ' onValueSet:' + owner.myName + '  value=' + value]);
                }
                return true;
            }
        }
    });

}(Foundry, Foundry.tools));
