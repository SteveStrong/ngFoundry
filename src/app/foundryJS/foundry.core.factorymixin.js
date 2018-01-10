
var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};
Foundry.mixin = Foundry.mixin || {};



//define spec for object 'type'
(function (ns, mix, tools, undefined) {

    var MixinSpecData = function (spec) {
        this.spec = {};
        this.inheritsFrom = [];
        tools.mixin(this.spec, spec);
        return this;
    }

    tools.isaTypeDefinition = function (obj) {
        return obj && obj instanceof MixinSpecData;
    };


    MixinSpecData.prototype = {
        getSpec: function () {
            return this.spec;
        },
        inheritsFromType: function (type) {
            var types = tools.isArray(type) ? type : [type];
            var self = this;
            types.forEach(function (spec) {
                self.inheritsFrom.push(spec);
            })
            return this;
        },
        getInheritedSpec: function () {
            var newSpec = {};
            this.inheritsFrom.forEach(function (spec) {
                newSpec = tools.union(newSpec, spec);
            });
            return newSpec;
        },
        getMeta: function() {
            var id = this.spec.myType;
            return fo.meta && fo.meta.findMetadata(id);
        },
        extendMixin: function (obj) {
            var id = this.spec.myType;
            tools.mixin(this.spec, obj);
            this.spec.myType = id ? id : obj.myType;
        },
    }

    var _mixins = {};

    function registerMixin(id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_mixins[id]) throw new Error("a mixin already exist for " + id);

        _mixins[id] = new MixinSpecData(spec);
        _mixins[id].myType = id;
        return _mixins[id];
    }

    function unregisterMixin(id) {
        if (!ns.isValidNamespaceKey(id)) return;

        if (_mixins[id]) {
            _mixins[id] = undefined;
        }
        return true;
    }

    function registerTypeMixin(spec) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) throw new Error("a Mixin is required to have a myType property ");
        return registerMixin(id, spec);
    }

    function establishTypeMixin(spec) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) throw new Error("a Mixin is required to have a myType property ");
        try {
            return registerMixin(id, spec);
        }
        catch (ex) {
            _mixins[id].extendMixin(spec);
        }
        return _mixins[id];
    }

    function removeTypeMixin(spec) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) throw new Error("a Mixin is required to have a myType property ");
        return unregisterMixin(id);
    }

    //this code will make dupe of spec and force myType to be type
    mix.defineMixin = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        var typedSpec = tools.union(spec, { myType: id });
        var result = registerTypeMixin(typedSpec);
        return result;
    }

    mix.extendMixin = function (id, spec) {
        if (!ns.isValidNamespaceKey(id) || !_mixins[id]) return;

        _mixins[id].extendMixin(spec);
        return _mixins[id];
    }

    mix.findMixin = function (id, search) {
        if (!ns.isValidNamespaceKey(id)) return;
        var found = _mixins[id];
        if (found || !search) return found;

        var list = Object.keys(_mixins).filter(function (key) {
            return key.matches(id);
        });
        if (list.length > 0) {
            found = _mixins[list[0]];
        }

        return found;
    }


    mix.establishMixin = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        try {
            return mix.defineMixin(id, spec);
        }
        catch (ex) {
            var completeSpec = tools.union(spec, { myType: id });
            return mix.extendMixin(id, completeSpec);
        }
    }

    mix.removeMixin = function (id) {
        return unregisterMixin(id);
    }

    mix.mixinDictionaryKeys = function () {
        return Object.keys(_mixins);
    }

    mix.mixinDictionaryWhere = function (func) {
        var result = tools.applyOverKeyValue(_mixins, function (key, value) {
            if (!value) return undefined; //removed items are undefined
            return !func || func(key, value) ? value : undefined;
        });
        return result;
    }

    //other ways to create/define types
    mix.createNewMixin = function (id, specId) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = {};
        var specIdList = tools.isArray(specId) ? specId : [specId];
        specIdList.forEach(function (specId) {
            var base = tools.isString(specId) ? _mixins[specId] : specId;
            var spec = base.getSpec();
            newSpec = tools.union(newSpec, spec);
        });

        var completeSpec = tools.union(newSpec, { myType: id });
        return mix.establishMixin(id, completeSpec)
    }

    mix.establishSubType = function (id, specId) {
        if (!ns.isValidNamespaceKey(id)) return;


        var specIdList = tools.isArray(specId) ? specId : [specId];
        var parentsTypes = specIdList.map(function (specId) {
            var base = tools.isString(specId) ? _mixins[specId] : specId;
            return base;
        })

        var newSpec = {};
        parentsTypes.reverse().forEach(function (base) {
            newSpec = base && tools.union(newSpec, base.getSpec());
        });


        var subtype = tools.isString(id) ? _mixins[id] : id;
        newSpec = !subtype ? newSpec : tools.union(newSpec, subtype.getSpec());

        var completeSpec = tools.union(newSpec, { myType: id });
        var newType = mix.establishMixin(id, newSpec);
        newType.inheritsFromType(parentsTypes);

        return newType;
    }

    function shortFormula(obj, max) {
        var results = tools.cleanFormulaText(obj)
        return results.length > max ? results.substring(0, max) + '...' : results;
    }


    ns.computedMixin = function (obj, type) {
        var spec = {};
        if (obj.propertyManager) {
            var properties = tools.asArray(obj.propertyManager());
            properties.forEach(function (mp) {
                if (mp.formula) {
                    spec[mp.myName] = "formula: " + shortFormula(mp.formula, 150)  //mp.formula.toString();
                }
            });
        }
        else {
            tools.forEachKeyValue(type.getComputedSpec(), function (key, value) {
                spec[key] = "computes: " + shortFormula(value, 150)  //mp.formula.toString();
            });
        }
 
        return !tools.isEmpty(spec) && spec;
    }


    ns.getAllMixins = function (allDetails) {
        //for sure you do not want to give then the array, they might destory it.
        var types = tools.mapOverKeyValue(_mixins, function (key, type) {
            if (!type) return;

            var result = {
                myName: key,
                myType: key,
                namespace: tools.getNamespace(type),
                name: tools.getType(type),
                specData: type,
                spec: type.getSpec(),
                computedSpec: type.getComputedSpec(),
                constructor: type.getCreate(),
                meta: type.getMeta(),
                inherits: type.inheritsFrom.map(function (item) { return item.myType; }),
                creates: shortFormula(type.getCreate(), 200),
            };

            try {
                if (allDetails) {
                    var obj = type.newInstance();
                    result.instance = obj;
                    result.isManaged = tools.isaComponent && tools.isaComponent(obj);
                    result.isTyped = tools.isTyped(obj)
                    result.instanceSpec = obj.getSpec && obj.getSpec();
                    result.instanceComputedSpec = ns.computedSpec(obj, type);
                }
            } catch (ex) {
                result.ex = ex;
            }
            return result;
        });

        return types;
    }

 
}(Foundry, Foundry.mixin, Foundry.tools));
