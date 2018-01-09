
var Foundry = Foundry || {};
var fo = Foundry;

(function (ns,undefined) {
//in prep for prototype pattern...
    var Adaptor = function (properties, subcomponents, parent) {
        //"use strict";

        this.myName = undefined;
        this.myParent = parent;
        this.myType = 'Adaptor';

        this.createParameters(properties);
        return this;
    }

    //Prototype defines functions using JSON syntax
    Adaptor.prototype = {
        makeComputedValue: function (obj, key, init) {
            var initValueComputed = ns.utils.isFunction(init);
            if (initValueComputed) {
                var initValue = init;
                Object.defineProperty(obj, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        if (!initValueComputed) return initValue;
                        result = initValue.call(obj, obj);
                        return result;
                    },
                    set: function (newInit) {
                        initValueComputed = ns.utils.isFunction(newInit);
                        initValue = newInit;
                    }
                });
            }
            else {
                obj[key] = init;
            }
            return obj;
        },
        createProperty: function (name, init) {
            var obj = this.makeComputedValue(this, name, init);
            return obj;
        },
        createParameters: function (obj) {
            if (obj !== undefined) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        var init = obj[key];
                        this.createProperty.call(this, key, init);
                    }
                }
            }
        },
        subscribeToCommands: function (regexPattern) {
            //subscribe to any do* of goto* messages...
              var self = this;
            var keys = Object.keys(self);
            keys.forEach(function (key) {
                if (key.startsWith('do') || key.startsWith('goto')) {
                    fo.subscribe(key, function () {
                        self[key];
                    });
                }
            });
        },
    }

    ns.Adaptor = Adaptor;

    ns.makeAdaptor = function (properties, subcomponents, parent) {
        return new ns.Adaptor(properties, subcomponents, parent);
    };

    ns.Component.prototype.createAdaptor = function (properties, dependencies) {
        var component = new ns.Adaptor(properties, undefined, this);
        this.Subcomponents.push(component);

        return component;
    };



}(Foundry));

(function (ns, undefined) {

    //a cool way to attach the managed properties from a component
    function attachProperty(obj, key, source) {
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                var result = source[key];
                return result
            },
            set: function (newInit) {
                source[key] = newInit;
            }
        });
    }

    ns.attachComponent = function (self, source) {
        if (source !== undefined) {
            for (var key in source) {
                if (key.startsWith('_')) {
                    var prop = source[key];
                    var name = prop.myName;
                    attachProperty(self, name, source);
                }
            }
        }

        return self;
    };

}(Foundry));