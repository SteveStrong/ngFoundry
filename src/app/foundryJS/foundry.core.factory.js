
var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};

(function (ns, tools, undefined) {

    //http://phrogz.net/JS/Classes/OOPinJS2.html
    Function.prototype.inheritsFrom = function (parentClassOrObject) {
        if (parentClassOrObject.constructor == Function) {
            //Normal Inheritance 
            this.prototype = new parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject.prototype;
        }
        else {
            //Pure Virtual Inheritance 
            this.prototype = parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject;
        }
        return this;
    }

    var _classDictionary = {};

    ns.defineClass = function (myType, baseClass) {

        var localProperties = {};

        if (!baseClass) {
            throw new Error('define class:' + myType + ' is missing a baseClass');
        }

        var newClass = function (properties, subcomponents, parent) {
            var newSpec = tools.union(localProperties, properties);
            return baseClass.call(this, newSpec, subcomponents, parent);
        }

        newClass.inheritsFrom(baseClass);

        _classDictionary[myType] = newClass;

        //Prototype defines functions using JSON syntax
        newClass.extendPrototype = function (methods) {
            if (!methods) return newClass;

            for (var key in methods) {
                var funct = methods[key];
                if (tools.isFunction(funct)) {
                    newClass.prototype[key] = funct;
                }
            }
            return newClass;
        }

        newClass.extendClass = function (methods) {
            if (!methods) return newClass;

            for (var key in methods) {
                var funct = methods[key];
                if (tools.isFunction(funct)) {
                    newClass[key] = funct;
                }
            }
            return newClass;
        }

        newClass.extendProperties = function (properties) {
            localProperties = tools.mixin(localProperties, properties);
            return newClass;
        }

        tools['isa' + myType] = function (obj) {
            return obj && obj.isInstanceOf(newClass);
        }

        newClass.make = function (properties, subcomponents, parent) {
            var result = new newClass(properties, subcomponents, parent);
            return result;
        }

        newClass.exportType = function (specId) {
            return tools.importType && tools.importType(specId, localProperties, newClass);
        }

        return newClass;
    };

    ns.classDictionary = function () {
        //return a copy
        return tools.extend({}, _classDictionary);
    }

}(Foundry, Foundry.tools));


//define spec for object 'type'
(function (ns, tools, undefined) {


    var TypeSpecData = function (spec, constructionClass) {
        this.spec = {};     
        this.constructionClass = constructionClass || ns.Node; //check if createFn is a Class or a maker
        this.constructorFn = this.constructionClass.make;
        this.inheritsFrom = [];
        tools.mixin(this.spec, spec);
        //if (!this.constructorFn) {
        //    this.constructorFn = this.establishConstructor();
        //}
        return this;
    }

    tools.isaTypeDefinition = function (obj) {
        return obj && obj instanceof TypeSpecData;
    };


    var _classFn = {}

    TypeSpecData.prototype = {
        establishConstructor: function () {
            var id = this.myType;
            if (!_classFn[id]) {
                var constructorFn = function (spec) {
                    tools.mixin(this, spec);
                }
                _classFn[id] = function (spec) {
                    return new constructorFn(spec)
                };
                tools['isa' + id] = function (obj) {
                    return obj instanceof constructorFn ? true : false;
                }
            }
            return _classFn[this.myType];
        },

        getSpec: function () {
            return this.spec;
        },
        mergeSpec: function (spec) {
            var result = tools.union({}, this.getSpec());
            for (var name in spec) {
                var target = result[name];
                if (!target) {
                    result[name] = spec[name];
                }
                tools.mixin(result[name], spec[name]);
            }
            return result;
        },
        getComputedSpec: function () {
            var computed = {};
            tools.forEachKeyValue(this.getSpec(), function (key, value) {
                if (tools.isFunction(value)) {
                    computed[key] = value;
                }
            })
            return !tools.isEmpty(computed) && computed;
        },
        getCreate: function () {
            return this.constructorFn || (this.constructionClass || this.constructionClass.make);
        },
        getClass: function () {
            return this.constructionClass;
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
        getInheritedMeta: function () {
            var newMeta = {};
            this.inheritsFrom.forEach(function (spec) {
                var meta = spec.getMeta();
                newMeta = tools.union(newMeta, meta);
            });
            return newMeta;
        },

        extendSpec: function (obj, constructionClass) {
            var id = this.spec.myType;
            tools.mixin(this.spec, obj);
            this.spec.myType = id ? id : obj.myType;
            this.constructionClass = constructionClass ? constructionClass : this.constructionClass; //check if createFn is a Class or a maker
            this.constructorFn = this.constructionClass.make;
        },
        getMeta: function() {
            var id = this.spec.myType;
            return fo.meta && fo.meta.findMetadata(id);
        },
        getEntityDB: function () {
            var id = this.spec.myType;
            return fo.meta && fo.db.getEntityDB(id);
        },
        makeDefault: function (properties, subcomponents, parent, onComplete) {
            var defaultSpec = this.getSpec();
            var spec = properties || defaultSpec;
            var createFn = this.getCreate() || fo.makeNode;
            if (!createFn) {
                throw new Error('{0}: has NO default constructor class'.format(spec.myType));
            }
            var subcomponentsRule = !tools.isEmpty(subcomponents) ? subcomponents : this.subcomponentRule;
            var result = createFn.call(parent, spec, subcomponentsRule, parent);
            this.doCreationCompleted(result, spec, subcomponentsRule, parent);

            onComplete && onComplete(result, parent);
            return result;
        },
        newInstance: function (mixin, subcomponents, parent, onComplete) {
            //allow properties that will extend the spec.
            var defaultSpec = this.getSpec();
            var completeSpec = tools.union(defaultSpec, mixin);
            var result = this.makeDefault(completeSpec, subcomponents, parent, onComplete)
            return result;
        },
        newExactInstance: function (mixin, subcomponents, parent, onComplete) {
            //only allow properties that are part of the spec.
            var spec = this.getSpec();
            var completeSpec = tools.intersect(spec, mixin);
            var result = this.makeDefault(completeSpec, subcomponents, parent, onComplete)
            return result;
        },
        establishInstance: function (mixin, id, parent, onComplete) {
            //defer to DB class with tracks instances 
            //use myName as ID
            var entityDB = this.getEntityDB();
            var result = entityDB.establishInstance(mixin, id, function(obj) {
                parent.capture(obj);
                onComplete && onComplete(obj);
            });
            return result;
        },
        validateUsage: function (source, onComplete) {
            var extraSpec = tools.union({}, this.getSpec());
            var extraSource = tools.union({}, source);
            tools.mixout(extraSpec,source);
            tools.mixout(extraSource, this.getSpec());
            return {
                differenceCount: Object.keys(extraSpec).length + Object.keys(extraSource).length,
                extraSpec: extraSpec,
                extraSource: extraSource,
            }
        },
        create: function (config, onComplete) {
            var properties = config && config.properties ? tools.union(this.getSpec(), config.properties) : this.getSpec();
            var subcomponents = config && config.subcomponents || [];
            var parent = config && config.parent;
            var construct = config && config.construct || this.getCreate();

            var result = construct.call(parent, properties, subcomponents, parent);
            onComplete && onComplete(result, parent);
            return result;
        },
        metaInputs: function (config) {
            var properties = tools.union(this.getSpec(), config);
            var meta = tools.applyOverKeyValue(properties, function (key, value) {
                if (tools.isaTypeDefinition(value)) return;
                if (tools.isObject(value)) return;
                if (tools.isFunction(value)) {
                    return { userEdit: false, formula: value };
                }
                var type = isNaN(value) ? 'string' : 'number';
                return { userEdit: true, type: type }
            });

            fo.meta.establishMetadata(this.spec.myType, meta);
            return this;
        },
        useSubcomponentRule: function (rule) {
            this.subcomponentRule = rule;
            return this;
        },
        useConstructorClass: function (rule) {
            this.constructionClass = rule ? rule : this.constructionClass; //check if createFn is a Class or a maker
            this.constructorFn = this.constructionClass.make;
            return this;
        },
        useComponent: function (className, methods) {
            var cls = ns.Component;
            if (className) {
                cls = ns.defineClass(className, ns.Component);
                cls.extendPrototype(methods);  //still issues extendClass?
            }
            return this.useConstructorClass(cls);
        },

        methods: function (methods, doNotClone) {
            var cls = this.constructionClass;
            if (!doNotClone) {
                var className = this.getSpec().myType;
                cls = ns.defineClass(className, cls || ns.Component);              
            }
            cls.extendPrototype(methods);  //still issues extendClass?
            return this.useConstructorClass(cls);
        },
        onCreationCompleted: function (funct) {
            this.onCreation = funct;
            return this;
        },
        doCreationCompleted: function (result, properties, subcomponents, parent) {
            var funct = this.onCreation; // this should get this value from the prototype is not overidden
            funct && funct.call(result, properties, subcomponents, parent);
        },
        //inheritsFrom: function (specId, constructorFn) {
        //    var specIdList = tools.isArray(specId) ? specId : [specId];
        //    var parentsTypes = specIdList.map(function (specId) {
        //        var base = tools.isString(specId) ? _specs[specId] : specId;
        //        return base;
        //    })

        //    var newSpec = {};
        //    parentsTypes.reverse().forEach(function (base) {
        //        newSpec = base && tools.union(newSpec, base.getSpec());
        //    });

        //    var newConstructorFn = constructorFn;
        //    parentsTypes.forEach(function (base) {
        //        newConstructorFn = base && !newConstructorFn ? base.constructorFn : newConstructorFn;
        //    })
        //    this.inheritsFromType(parentsTypes);
        //    return this;
        //}
    }

    var _specs = {};


    tools.importType = function (id, spec, constructionClass) {
        if (!ns.isValidNamespaceKey(id)) return;
        _specs[id] = new TypeSpecData(spec, constructionClass);
        _specs[id].myType = id;
        return _specs[id];
    }

    function registerSpec(id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_specs[id]) throw new Error("a spec already exist for " + id);

        _specs[id] = new TypeSpecData(spec, constructorFn);
        _specs[id].myType = id;
        return _specs[id];
    }

    function unregisterSpec(id) {
        if (!ns.isValidNamespaceKey(id)) return;

        if (_specs[id]) {
            _specs[id] = undefined;
        }
        return true;
    }

    function registerTypeSpec(spec, constructorFn) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) throw new Error("a spec is required to have a myType property ");
        return registerSpec(id, spec, constructorFn);
    }

    function establishTypeSpec(spec, constructorFn) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) throw new Error("a spec is required to have a myType property ");
        try {
            return registerSpec(id, spec, constructorFn);
        }
        catch (ex) {
            _specs[id].extendSpec(spec, constructorFn);
        }
        return _specs[id];
    }

    function removeTypeSpec(spec) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) throw new Error("a spec is required to have a myType property ");
        return unregisterSpec(id);
    }

    //this code will make dupe of spec and force myType to be type
    ns.defineType = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;
        var typedSpec = tools.union(spec, { myType: id });
        var result = registerTypeSpec(typedSpec, constructorFn);
        return result;
    }

    ns.extendType = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id) || !_specs[id]) return;

        _specs[id].extendSpec(spec, constructorFn);
        return _specs[id];
    }

    ns.findType = function (id, search) {
        if (!ns.isValidNamespaceKey(id)) return;
        var found = _specs[id];
        if (found || !search) return found;

        var list = Object.keys(_specs).filter(function (key) {
            return key.matches(id);
        });
        if (list.length > 0) {
            found = _specs[list[0]];
        }

        return found;
    }


    ns.establishType = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;
        try {
            return ns.defineType(id, spec, constructorFn);
        }
        catch (ex) {
            var completeSpec = tools.union(spec, { myType: id });
            return ns.extendType(id, completeSpec, constructorFn);
        }
    }

    ns.removeType = function (id) {
        return unregisterSpec(id);
    }

    ns.typeDictionaryKeys = function () {
        return Object.keys(_specs);
    }

    ns.typeDictionaryWhere = function (func) {
        var result = tools.applyOverKeyValue(_specs, function (key, value) {
            if (!value) return undefined; //removed items are undefined
            return !func || func(key, value) ? value : undefined;
        });
        return result;
    }

    //other ways to create/define types
    ns.createNewType = function (id, specId, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = {};
        var specIdList = tools.isArray(specId) ? specId : [specId];
        specIdList.forEach(function (specId) {
            var base = tools.isString(specId) ? _specs[specId] : specId;
            var spec = base.getSpec();
            newSpec = tools.union(newSpec, spec);
        });

        var completeSpec = tools.union(newSpec, { myType: id });
        return ns.establishType(id, completeSpec, constructorFn)
    }

    ns.establishSubType = function (id, specId, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;


        var specIdList = tools.isArray(specId) ? specId : [specId];
        var parentsTypes = specIdList.map(function (specId) {
            var base = tools.isString(specId) ? _specs[specId] : specId;
            return base;
        })

        var newSpec = {};
        parentsTypes.reverse().forEach(function (base) {
            newSpec = base && tools.union(newSpec, base.getSpec());
        });

        var newConstructorFn = constructorFn;
        parentsTypes.forEach(function (base) {
            newConstructorFn = base && !newConstructorFn ? base.constructorFn : newConstructorFn;
        })

        var subtype = tools.isString(id) ? _specs[id] : id;
        newSpec = !subtype ? newSpec : tools.union(newSpec, subtype.getSpec());

        var completeSpec = tools.union(newSpec, { myType: id });
        var newType = ns.establishType(id, newSpec, newConstructorFn);
        newType.inheritsFromType(parentsTypes);

        return newType;
    }

    function shortFormula(obj, max) {
        var results = tools.cleanFormulaText(obj)
        return results.length > max ? results.substring(0, max) + '...' : results;
    }


    ns.computedSpec = function (obj, type) {
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


    ns.getAllTypes = function (allDetails) {
        //for sure you do not want to give then the array, they might destory it.
        var types = tools.mapOverKeyValue(_specs, function (key, type) {
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

    ////////////////////////////////////////////////

    ns.newInstance = function (id, mixin, subcomponents, parent, onComplete) {
        var spec = ns.findType(id);
        if (!spec) return;
        var result = spec.newInstance(mixin, subcomponents, parent, onComplete)
        return result;
    }

    ////////////////////////////////////////////////
    /// from time to time some helper tools emerge from building
    /// applications, the best functions are define here and attached to tool namespace
    ///  this is a great place for generators
    /// //https://vimeo.com/153770141  The Miracle of Generators - Bodil Stokke
    ////////////////////////////////////////////////
    function subcomponentBuilder(type, spec, count, parent) {
        var list = [];
        var typeFn = tools.isFunction(type) ? type : function (id) { return type; }
        var specFn = tools.isFunction(spec) ? spec : function (id) { return spec; }
        var length = count || 0;
        for (var i = 0; i < length; i++) {
            //if you do not pass undefiend you will override the rule
            var obj = typeFn(i).newInstance(specFn(i), undefined, parent).unique();//unique create a GUID 
            list.push(obj);
        }
        return list;
    }
    //simulate a ES6 generator
    function getNext(max, last) {
        if (!last) return { value: 0, done: 0 >= max };
        var value = last.value + 1;
        return { value: value, done: value >= max };
    }
    function subcomponentArrayReference(typeFn, specFn, id, parent) {

        //if you do not pass undefiend you will override the rule
        var obj = typeFn(id).newInstance(specFn(id), undefined, parent).unique();//unique create a GUID 
        parent && parent.addSubcomponent(obj);
        return obj;
    };


    function subcomponentArrayBuilder(type, spec, vector, parent) {
        var list = [];
        var typeFn = tools.isFunction(type) ? type : function (id) { return type; }
        var specFn = tools.isFunction(spec) ? spec : function (id) { return spec; }

        var i = getNext(vector[0]);
        var j = getNext(vector[1]);
        var k = getNext(vector[2]);
        do {
            do {              
                do {
                    var id = [i.value, j.value, k.value]
                    //if you do not pass undefiend you will override the rule
                    var obj = subcomponentArrayReference(typeFn, specFn, id, parent);

                    list.push(obj);
                    k = getNext(vector[2], k);
                } while (!k.done);
                k = getNext(vector[2]);
                j = getNext(vector[1], j);
            } while (!j.done);
            j = getNext(vector[1]);
            i = getNext(vector[0], i);
        } while(!i.done)
        return list;
    }


    tools.subcomponentBuilder = subcomponentBuilder;
    tools.subcomponentArrayReference = subcomponentArrayReference;
    tools.subcomponentArrayBuilder = subcomponentArrayBuilder;

    //assume that this obj has properties that should be managed objects, but are not
    //use the information stored in myType to recreate them from the spec
    ns.restoreInstance = function (obj, deep) {
        tools.forEachKeyValue(obj, function (key, spec) {
            if (!spec) return;

            if (deep && tools.isTyped(spec)) {
                ns.restoreInstance(spec, deep);
            }
            else if (spec.myType) {
                var result = ns.newInstance(spec.myType, spec);
                obj[key] = result;
                deep && ns.restoreInstance(result, deep);
            }                 
        });
        return obj;
    }

}(Foundry, Foundry.tools));
