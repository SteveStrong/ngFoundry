/*
    Foundry.rules.factory.js part of the FoundryJS project
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
Foundry.factory = Foundry.factory || {};
Foundry.meta = Foundry.meta || {};

//metadata
(function (ns, meta, utils, undefined) {


    var _metadata = {};
    var registerMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_metadata[id]) throw new Error("a metadata already exist for " + id);

        _metadata[id] = spec;
        return spec;
    }

    ns.metadataDictionaryKeys = function () {
        return Object.keys(_metadata);
    }

    ns.metadataDictionaryKeysWhere = function (func) {
        var result = [];
        utils.loopForEachValue(_metadata, function (key, value) {
            if (func && func(value)) {
                result.push(key);
            }
        });
        return result;
    }

    meta.registerMetadata = function (spec) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) return;
        return registerMetadata(id, spec);
    }


    meta.findMetadata = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;
        var definedSpec = _metadata[id];

        return definedSpec;
    }

    meta.defineMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        var completeSpec = utils.union(spec, { myType: id });
        var result = registerMetadata(id, completeSpec);
        return result;
    }

    meta.extendMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = utils.union(_metadata[id], spec);
        _metadata[id] = newSpec;
        return newSpec;
    }

    meta.establishMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        try {
            return meta.defineMetadata(id, spec);
        }
        catch (ex) {
            var completeSpec = utils.union(spec, { myType: id });
            return meta.extendMetadata(id, completeSpec);
        }
    }


    function createTypeDocs(id, fullSpec) {

        var typeId = id.split('::');
        var type = typeId[typeId.length-1];
        var namespace = typeId[0] != type ? typeId[0] : '';

        var type = {
            myName: id,
            namespace: namespace,
            type:  type,
            metaData: _metadata[id],
        }
        try {
            if (fullSpec) {
                //type.instance = ns.newInstance(id);
                //type.computedSpec = ns.computedSpec(type.instance);
                //type.spec = type.instance.getSpec();
            }
        } catch (ex) {
            type.ex = ex;
        }
        return type;
    }

    meta.getAllTypes = function (fullSpec) {
        //for sure you do not want to give users the array _metadata, they might destory it.
        var typelist = [];
        for (var key in _metadata) {
            var type = createTypeDocs(key, fullSpec);
            typelist.push(type);
        }
        return typelist;
    }


    meta.guessMetaData = function (record) {
        var result = {};
        utils.loopForEachValue(record, function (key, value) {
            var keyField = key;
            var stringValue = String(value);
            var metaData = {
                key: key,
                label: key,
                pluck: function (item) {
                    return item[keyField];
                },
                jsonType: typeof value,
                isPrivate: false,
                isNumber: !isNaN(value),
                isUrl: stringValue.startsWith('http'),
                isResource: stringValue.endsWith('.jpg') || stringValue.endsWith('.png'),
            };
            function computeDataType(item) {
                if (item.isUrl) return 'url';
                if (item.isResource) return 'resource';

                if (item.isNumber) return 'number';
                return 'text';
            }
            metaData.dataType = computeDataType(metaData);
            result[key] = metaData;
        });
        return result;
    }

    meta.getLinkProperties = function (metadataSpec) {
        var result = []
        utils.loopForEachValue(metadataSpec, function (key, value) {
            if (value && value.dataType == 'url') {
                result.push(value);
            }
        });
        return result;
    }

    meta.getPictureProperties = function (metadataSpec) {
        var result = []
        utils.loopForEachValue(metadataSpec, function (key, value) {
            if (value && value.dataType == 'resource') {
                result.push(value);
            }
        });
        return result;
    }

    meta.getDisplayProperties = function (metadataSpec) {
        var result = []
        utils.loopForEachValue(metadataSpec, function (key, value) {
            if (value && value.dataType == 'number' || value.dataType == 'text') {
                result.push(value);
            }
        });

        return result;
    }



}(Foundry, Foundry.meta, Foundry.utils));


(function (ns, fa, utils, undefined) {

    ns.getNamespaceKey = function (namespace, type) {
        if (namespace && type) {
            if (type.contains('::')) return type;
            var id = namespace + '::' + type;
            return id;
        }

        if (namespace.contains('::')) {
            return namespace;
        }
        throw new Error("getNamespaceKey invalid arguments")
    }

    ns.isValidNamespaceKey = function (id) {
        if (!id) throw new Error("valid NamespaceKey is missing")

        return true;
    }

    var _constructors = _constructors || {};
    var registerConstructor = function (id, constructor) {
        if (!ns.isValidNamespaceKey(id)) return;

        _constructors[id] = constructor;
        return constructor;
    }

    ns.construct = function (id, properties, subcomponents, parent, onComplete) {
        if (!ns.isValidNamespaceKey(id)) return;

        var constructorFn = _constructors[id];
        if (!constructorFn) {
            throw new Error("constructor does not exist for " + id);
        }

        var result = constructorFn && constructorFn.call(parent, properties || {}, subcomponents || {}, parent);
        onComplete && onComplete(result, parent);
        return result;
    }



    var _specs = {};
    var registerSpec = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_specs[id]) throw new Error("a spec already exist for " + id);
        if (_constructors[id]) throw new Error("a constructor already exist for " + id);

        _specs[id] = spec;
        _constructors[id] = constructorFn ? constructorFn : _constructors['Component'];
        return spec;
    }

    ns.typeDictionaryKeys = function () {
        return Object.keys(_specs);
    }

    ns.typeDictionaryKeysWhere = function (func) {
        var result = [];
        utils.loopForEachValue(_specs, function (key, value) {
            if (func && func(value)) {
                result.push(key);
            }
        });
        return result;
    }

    ns.registerSpec = function (spec, constructorFn) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) return;
        return registerSpec(id, spec, constructorFn);
    }

    ns.establishSpec = function (spec, constructorFn) {
        try{
            return ns.registerSpec(spec, constructorFn);
        }
        catch (ex) {
            var id = spec.myType;
            var newSpec = utils.union(_specs[id], spec);
            _specs[id] = newSpec;
            if (constructorFn) {
                _constructors[id] = constructorFn;
            }
        }
        return newSpec;
    }


 

    ns.findSpec = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;
        var definedSpec = _specs[id];

        return definedSpec;
    }

    ns.extendSpec = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = utils.union(_specs[id], spec);
        _specs[id] = newSpec;
        if (constructorFn) {
            _constructors[id] = constructorFn
        }
        return newSpec;
    }

    //this spec should be an honst way to recreate the component
    ns.instanceSpec = function (obj) {
        var spec = obj.getSpec();
        //do I need to code a reference to the parent?
        //if (this.myParent) spec.myParent = this.myName;

        obj.Properties.forEach(function (mp) {
            if (mp.formula) {
                spec[mp.myName] = "computed: " + ns.utils.cleanFormulaText(mp.formula)  //mp.formula.toString();
            }
        });
        return spec;
    }

    //http://wildlyinaccurate.com/understanding-javascript-inheritance-and-the-prototype-chain/

    //http://phrogz.net/JS/classes/OOPinJS2.html
    //Rather than writing 3 lines every time you want to inherit one class from another, it's convenient to extend the Function object to do it for you:

    Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
        if ( parentClassOrObject.constructor == Function ) 
        { 
            //Normal Inheritance 
            this.prototype = new parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject.prototype;
        } 
        else 
        { 
            //Pure Virtual Inheritance 
            this.prototype = parentClassOrObject;
            this.prototype.constructor = this;
            this.prototype.parent = parentClassOrObject;
        } 
        return this;
    } 




    var _classDev = {};
    ns.classConstructorFromSpec = function (specId) {

        var spec = _specs[specId]
        if (_classDev[specId]) return _classDev[specId];

        var keys = Object.keys(spec);
        var commonBase = {};
        var commonFuncs = {};


        keys.forEach(function (key) {
            var value = spec[key];
            commonBase[key] = value;
            if (ns.utils.isFunction(value)) {
                commonFuncs[key] = value;
            }
        })

        var maker = function (properties, subcomponents, parent) {

            var self = this;

            self.$methods = commonFuncs;

            Object.keys(commonFuncs).forEach(function (key) {

                Object.defineProperty(self, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        var computed = maker.prototype[key];
                        var result = computed.call(self, self);
                        return result;
                    }
                });

            });

            Object.keys(properties).forEach(function (key) {
                self[key] = properties[key];
            });

            return this;
        }

        maker.inheritsFrom(commonBase)



        _classDev[specId] = maker;
        return maker;
    }

    

    http://www.eslinstructor.net/jsonfn/

        function shortFormula(obj, max) {
            var results = ns.utils.cleanFormulaText(obj)
            return results.length > max ? results.substring(0, max) + '...' : results;
        }


    ns.computedSpec = function (obj) {
        var spec;
        obj.Properties.forEach(function (mp) {
            if (mp.formula) {
                spec = spec || {};
                spec[mp.myName] = "computed: " + shortFormula(mp.formula, 100)  //mp.formula.toString();
            }
        });
        return spec;
    }


    //this code will make dupe of spec and force myType to be type
    ns.defineType = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;
        var completeSpec = utils.union(spec, { myType: id });
        var result =  registerSpec(id, completeSpec, constructorFn);
        ns.exportType(id);
        return result;
    }

    ns.establishType = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;
        try {
            return ns.defineType(id, spec, constructorFn);
        }
        catch (ex) {
            var completeSpec = utils.union(spec, { myType: id });
            return ns.extendSpec(id, completeSpec, constructorFn);
        }
    }

 
    ns.extendSpec = function (id, spec, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = utils.union(_specs[id], spec);
        _specs[id] = newSpec;
        if (constructorFn) {
            _constructors[id] = constructorFn;
        }
        return newSpec;
    }

    ns.extendType = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = utils.union(_specs[id] || {}, spec);
        _specs[id] = newSpec;
        ns.exportType(id);
        return newSpec;
    }

    ns.establishSubType = function (id, specId) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = {};
        var specIdList = utils.isArray(specId) ? specId : [specId];
        specIdList.forEach(function (specId) {
            var base = utils.isString(specId) ? _specs[specId] : specId;
            newSpec = utils.union(newSpec, base);
        })

        var completeSpec = utils.union(newSpec, { myType: id });

        try {
            return ns.defineType(id, completeSpec);
        }
        catch (ex) {
            return ns.extendSpec(id, completeSpec);
        }
    }



    ns.createNewType = function (id, specId, constructorFn) {
        if (!ns.isValidNamespaceKey(id)) return;

        var newSpec = {};
        var specIdList = utils.isArray(specId) ? specId : [specId];
        specIdList.forEach(function (specId) {
            var base = utils.isString(specId) ? _specs[specId] : specId;
            newSpec = utils.union(newSpec, base);
        });

        var completeSpec = utils.union(newSpec, { myType: id });
        ns.establishType(id, completeSpec, constructorFn)
        return exportConstructor(id);
    }


    function createTypeDocs(id, fullSpec) {
        var typeId = id.split('::');
        var name = typeId[typeId.length - 1];
        var namespace = typeId[0] != type ? typeId[0] : '';

        var type = {
            myName: id,
            name: name,
            namespace: namespace,
            type: _specs[id],
            constructor: _constructors[id],
            meta: Foundry.meta.findMetadata(id),
        }
        try {
            if (fullSpec) {
                type.instance = ns.newInstance(id);
                type.spec = type.instance.getSpec();
                type.computedSpec = ns.computedSpec(type.instance);
            }
        } catch (ex) {
            type.ex = ex;
        }
        return type;
    }

    ns.getAllTypes = function (fullSpec) {
        //for sure you do not want to give then the array, they might destory it.
        var typelist = [];
        for (var key in _specs) {
            var type = createTypeDocs(key, fullSpec);
            typelist.push(type);
        }
        return typelist;
    }

    ns.newSuper = function (id, mixin, subcomponents, parent, onComplete) {
        if (!ns.isValidNamespaceKey(id)) return;

        var constructorFn = _constructors[id] || _constructors['Component'];
        var definedSpec = _specs[id];

        var completeSpec = definedSpec ? utils.union(definedSpec, mixin) : mixin;
        var result = constructorFn.call(parent, completeSpec, subcomponents, parent);
        onComplete && onComplete(result, parent);
        return result;
    }

    ns.new = function (spec, parent, onComplete) {
        var id = spec.myType ? spec.myType : 'Component';
        var constructorFn = _constructors[id] || _constructors['Component'];
        var result = constructorFn.call(parent, spec, [], parent);
        onComplete && onComplete(result, parent);
        return result;
    }



    ns.make = function (spec, parent, onComplete) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) return;

        var definedSpec = _specs[id];
        var completeSpec = definedSpec ? utils.union(definedSpec, spec) : spec;
        var result = ns.new(completeSpec, parent, onComplete);
        return result;
    }

    ns.makeInstance = function (spec, mixin, parent, onComplete) {
        var base = utils.isString(spec) ? _specs[spec] : spec;
        var completeSpec = utils.union(base, mixin);
        var result = ns.make(completeSpec, parent, onComplete);
        return result;
    }

    ns.newInstance = function (id, mixin, parent, onComplete) {
        if (!ns.isValidNamespaceKey(id)) return;

        var definedSpec = _specs[id];
        var result = ns.makeInstance(definedSpec, mixin, parent, onComplete);
        return result;
    }

    //create the intersection of these properties
    ns.extractSpec = function (id, data) {
        if (!ns.isValidNamespaceKey(id)) return;

        var definedSpec = _specs[id];
        var result = {};
        if ( data) {
            for (var key in definedSpec) {
                if (data[key]) {
                    result[key] = data[key];
                }
            }
            delete result.myType
        }

        return result;
    }

    ns.newInstanceExtract = function (id, mixin, parent, onComplete) {
        if (!ns.isValidNamespaceKey(id)) return;

        var extract = ns.extractSpec(id, mixin);

        var definedSpec = _specs[id];
        var result = ns.makeInstance(definedSpec, extract, parent, onComplete);
        return result;
    }


    //create constructors by namespace for each public type..
    function exportConstructor(specId) {
        var id = specId;
        return function (mixin, parent, onComplete) {
            var definedSpec = _specs[id];
            var result = ns.makeInstance(definedSpec, mixin, parent, onComplete);
            return result;
        }
    }

    function exportAdaptor(specId) {
        var id = specId;
        return function (mixin, parent, onComplete) {
            var definedSpec = _specs[id];
            var constructorFn = _constructors[id];
            _constructors[id] = ns.makeAdaptor;
            var result = ns.makeInstance(definedSpec, mixin, parent, onComplete);
            _constructors[id] = constructorFn;
            return result;
        }
    }

    function validateConstructor(specId) {
        var id = specId;
        return function (mixin, parent, onComplete) {
            var definedSpec = _specs[id];
            for (var key in mixin) {
                if (!definedSpec.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        }
    }

    function compareConstructor(specId) {
        var id = specId;
        return function (mixin, parent, onComplete) {
            var result = {
                match: {},
                missing: {}
            };
            var definedSpec = _specs[id];
            for (var key in mixin) {
                if (definedSpec.hasOwnProperty(key)) {
                    result.match[key] = key;
                } else {
                    result.missing[key] = key;
                }
            }
            return result;
        }
    }


    ns.newStructure = function (spec, subcomponents, parent, onComplete) {
        var id = spec.myType ? spec.myType : 'Component';
        var constructorFn = _constructors[id] || _constructors['Component'];
        var result = constructorFn.call(parent, spec, subcomponents, parent);
        onComplete && onComplete(result, parent);
        return result;
    }

    ns.makeStructure = function (spec, subcomponents, parent, onComplete) {
        var id = spec.myType;
        if (!ns.isValidNamespaceKey(id)) return;

        var definedSpec = _specs[id];
        var completeSpec = definedSpec ? utils.union(definedSpec, spec) : spec;
        var result = ns.newStructure(completeSpec, subcomponents, parent, onComplete);
        return result;
    }


    function exportMaker(specId) {
        var id = specId;
        return function (mixin, subcomponents, parent, onComplete) {
            var base = _specs[id];
            var completeSpec = utils.union(base, mixin);
            var result = ns.makeStructure(completeSpec, subcomponents, parent, onComplete);
            return result;
        }
    }

    //create constructors by namespace for each public type..
    function exportExtractConstructor(specId) {
        var id = specId;
        return function (mixin, parent, onComplete) {
            var definedSpec = _specs[id];
            var extract = ns.extractSpec(id, mixin);
            var result = ns.makeInstance(definedSpec, extract, parent, onComplete);
            return result;
        }
    }

    function newClassInstance(specId) {
        var id = specId;

        return function (mixin, subcomponents, parent, onComplete) {
            var constructorFn = ns.classConstructorFromSpec(id);
            var result = new constructorFn(mixin, subcomponents, parent);
            onComplete && onComplete(result);
            return result;
        }
    }


    ns.makeClassInstance = function (spec, mixin, parent, onComplete) {
        var base = utils.isString(spec) ? _specs[spec] : spec;
        var completeSpec = utils.union(base, mixin);

        var id = completeSpec.myType;
        if (!ns.isValidNamespaceKey(id)) return;
        var constructorFn = newClassInstance(id);

        var result = constructorFn(completeSpec, [], parent, onComplete);
        return result;
    }

    function exportEstablishClassInstance(specId, exact) {
        var id = specId;

        return function (mixin, idFunc, dictionary, parent, onComplete) {
            var definedSpec = _specs[id];
            var extract = exact ? ns.extractSpec(id, mixin) : utils.union(definedSpec, mixin);


            if (!idFunc) {
                var result = ns.makeClassInstance(definedSpec, extract, parent, onComplete);
                return result;
            }

            dictionary = dictionary ? dictionary : ns.getEntityDictionary(id);

            var myKey = fo.utils.isFunction(idFunc) ? idFunc(mixin) : idFunc;
            var found = dictionary.getItem(myKey);
            if (!found) {
                found = ns.makeClassInstance(definedSpec, extract, parent, onComplete);
                dictionary.setItem(myKey, found);
                found.myName = myKey;
            } else {
                found.extendWith(extract);
                onComplete && onComplete(found);
            }
            return found;
        }
    }

 
    function exportEstablishConstructor(specId, exact) {
        var id = specId;

        return function (mixin, idFunc, dictionary, parent, onComplete) {
            var definedSpec = _specs[id];
            var extract = exact ? ns.extractSpec(id, mixin) : utils.union(definedSpec, mixin);


            if (!idFunc) {
                var result = ns.makeInstance(definedSpec, extract, parent, onComplete);
                return result;
            }


            dictionary = dictionary ? dictionary : ns.getEntityDictionary(id);

            var myKey = fo.utils.isFunction(idFunc) ? idFunc(mixin) : idFunc;
            var found = dictionary.getItem(myKey);
            if (!found) {
                found = ns.makeInstance(definedSpec, extract, parent, onComplete);
                dictionary.setItem(myKey, found);
                found.myName = myKey;
            } else {
                found.extendWith(extract);
                onComplete && onComplete(found);
            }
            return found;
        }
    }



    var _namespaces = {};
    ns.exportType = function (specId, fullSpec) {
        if (!ns.isValidNamespaceKey(specId)) return;

        var typeId = specId.split('::');
        if (typeId.length < 2) return;

        var namespace = typeId[0];
        var type = typeId[1];

        var exported = _namespaces[namespace] = _namespaces[namespace] || {};
        ns[namespace] = exported;

        var name = ns.utils.capitaliseFirstLetter(type);
        exported['new' + name] = exportConstructor(specId);
        exported['new' + name + 'Extract'] = exportExtractConstructor(specId);
        exported['establish' + name] = exportEstablishConstructor(specId);
        exported['establish' + name + 'Extract'] = exportEstablishConstructor(specId, true);

        exported['validate' + name] = validateConstructor(specId);
        exported['compare' + name] = compareConstructor(specId);

        exported['newInstance' + name] = newClassInstance(specId);
        exported['establishInstance' + name] = exportEstablishClassInstance(specId);
        exported['make' + name] = exportMaker(specId);
        exported['adaptor' + name] = exportAdaptor(specId);



        if (fullSpec) {
            exported.docs = exported.docs || {};
            exported.docs[name] = createTypeDocs(specId, fullSpec);
        }

        return _namespaces;
    }


    ns.exportTypes = function (fullSpec) {

        for (var specId in _specs) {
            ns.exportType(specId, fullSpec);
        }
        return _namespaces;
    }

    ns.typeFactory = function (specId) {
        if (!ns.isValidNamespaceKey(specId)) return;

        var typeId = specId.split('::');
        if (typeId.length < 2) return;

        var namespace = typeId[0];
        var type = typeId[1];

        var exported = _namespaces[namespace] 
        var name = ns.utils.capitaliseFirstLetter(type);

        return {
            'new': exported['new' + name],
            'newExtract': exported['new' + name + 'Extract'],
            'establish': exported['establish' + name],
            'establishExtract': exported['establish' + name + 'Extract'],
            'newInstance': exported['newInstance' + name],
            'establishInstance': exported['establishInstance' + name],
            'make': exported['make' + name],
            'adaptor': exported['adaptor' + name],
        }
    }


}(Foundry, Foundry.factory, Foundry.utils));

//define relationsjips
(function (ns, fa, utils, undefined) {


    var _relationSpec = _relationSpec || {};
    var _relationBuild = _relationBuild || {};

    var relationshipBuilder = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;

        if (_relationBuild[id]) return _relationBuild[id];

        _relationBuild[id] = function (source, target, applyInverse) {
            var spec = _relationSpec[id];
            var linkerFn = spec.linkerFn ?  spec.linkerFn  : ns.makeRelation;
            var result = linkerFn && linkerFn.call(spec, source, target);
            if (applyInverse && spec.myInverse) {
                _relationBuild[spec.myInverse](target, source)
            }
            return result;
        }
        _relationBuild[id].unDo = function (source, target, applyInverse) {
            var spec = _relationSpec[id];
            var unlinkerFn = spec.unlinkerFn ? spec.unlinkerFn : ns.unMakeRelation;
            var result = unlinkerFn && unlinkerFn.call(spec, source, target);
            if (applyInverse && spec.myInverse) {
                _relationBuild[spec.myInverse].unDo(target, source)
            }
            return result;
        }
        return _relationBuild[id];
    }

    var registerRelation = function (id, spec, linker, unLinker) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_relationSpec[id]) throw new Error("a relationSpec already exist for " + id);
        if (_relationBuild[id]) throw new Error("a relationBuild already exist for " + id);

        var typeId = id.split('::');
        var namespace = typeId.length == 2 ?  typeId[0] : '';
        var name = typeId.length == 2 ?  typeId[1] : typeId[0];
        
        var extend = {
            myType: id,
            myInverse: spec && spec.inverse,
            myName: name,
            namespace: namespace,
            linkerFn: linker ? linker : _relationSpec['linksTo'].linkerFn,
            unlinkerFn: unLinker ? unLinker : _relationSpec['linksTo'].unlinkerFn,
        }
        var completeSpec = utils.union(extend, spec);
        _relationSpec[id] = completeSpec;
        return relationshipBuilder(id);
    }

    ns.establishRelation = function (id, spec, linker, unLinker) {
        if (!ns.isValidNamespaceKey(id)) return;

        try {
            return registerRelation(id, spec, linker, unLinker);
        }
        catch (ex) {
            return relationshipBuilder(id);
        }
    }

    ns.establishRelationship = function (id1, id2) {
        var relate = id1.split('|');
        if (relate.length == 2 && !id2) {
            id1 = relate[0];
            id2 = relate[1];
        }
        var r1 = ns.establishRelation(id1, { inverse: id2 });
        var r2 = ns.establishRelation(id2, { inverse: id1 });
        return r1;
    }


    function createRelationDocs(id, fullSpec) {
        var type = {
            myName: id,
            relation: _relationSpec[id],
            linker: _relationBuild[id],
        }
        try {
            if (fullSpec) {
                type.instance = type.relation;
                //type.computedSpec = ns.computedSpec(type.instance);
                type.spec = type.instance;
            }
        } catch (ex) {
            type.ex = ex;
        }
        return type;
    }

    ns.getAllRelations = function (fullSpec) {
        //for sure you do not want to give then the array, they might destory it.
        var relationlist = [];
        for (var key in _relationSpec) {
            var relation = createRelationDocs(key, fullSpec);
            relationlist.push(relation);
        }
        return relationlist;
    }

}(Foundry, Foundry.factory, Foundry.utils));


//current set of definitions
(function (ns, undefined) {
    if (!ns.establishType) return;

    ns.establishType('Component', {}, ns.makeComponent);

    if (!ns.establishRelation) return;

    ns.establishRelation('linksTo', {}, ns.makeRelation, ns.unmakeRelation)

}(Foundry));