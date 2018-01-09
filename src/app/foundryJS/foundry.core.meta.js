var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};
Foundry.meta = Foundry.meta || {};


//metadata
(function (ns, meta, tools, undefined) {

    function metaInput(key, order, spec) {
        var input = {
          
            myName: key,
            sortOrder: spec.sortOrder ? spec.sortOrder : order,
            format: 'MM/dd/yyyy @ h:mma',
        };

        tools.mixin(input, spec);

        input.isType = function (type) {
            var result = this.type && this.type.matches(type);
            return result;
        }
        input.toggleIsOpen = function () {
            input.isOpen = !input.isOpen;
        }
        input.toggleIsCollapsed = function () {
            input.isCollapsed = !input.isCollapsed;
        }
        input.toggleIsVisible = function () {
            input.isVisible = !input.isVisible;
        }

        return input;
    }

    var MetaData = function (spec) {
        tools.mixin(this, spec);
        return this;
    }

    MetaData.prototype = {
        extendSpec: function (spec) {
            delete this._userInputs;
            var target = this;
            for (var name in spec) {
                if (!target[name]) {
                    target[name] = spec[name];
                }
                tools.mixin(target[name], spec[name]);
            }
            return this;
        },
        addServiceUrl: function (key, value) {
            if (!this._serviceUrl) {
                this._serviceUrl = {};
            }
            if (!value) {
                value = key;
                key = 'defaultUrl';
            };
            this._serviceUrl[key] = value;
            return this;
        },
        getServiceUrl: function (key) {
            if (!this._serviceUrl) return;
            if (!key) {
                key = 'defaultUrl';
            }
            return this._serviceUrl[key];
        },
        userInputs: function (key) {
            if (this._userInputs) {
                return key ? [this._userInputs[key]] : this._userInputs; //always return an array
            }

            var order = 1;
            var list = tools.mapOverKeyValue(this, function (key, value) {
                if (!value.userEdit) return;
                return metaInput(key, order++, value);
            });

            //sort in order of display
            list = list.sort(function (a, b) { return a.sortOrder - b.sortOrder; });

            //modify array to also use keys 
            list.forEach(function (item) {
                if (!list[item.myName]) {
                    list[item.myName] = item;
                }
            })

            this._userInputs = list;
            return key ? [this._userInputs[key]] : this._userInputs; //always return an array
        },
        userInputsAsQueryString: function (obj) {
            var spec = {};

            this.userInputs().forEach(function (input) {
                var value = obj[input.myName];
                if (value) {
                    spec[input.myName] = value;
                }
            });

            var params = tools.makeQueryParams(spec);
            var query = '?' + tools.mapOverKeyValue(params, function (key, value) {
                return '{0}={1}'.format(key, value);
            }).join('&')

            return query;
        },
        queryStringToUserInputs: function (qs, obj) {
            var spec = {};
            var params = tools.getQueryParams(qs);
            this.userInputs().forEach(function (input) {
                var value = params[input.myName];
                if (value) {
                    spec[input.myName] = value;
                    if (obj) { obj[input.myName] = value; }              
                }
            });

            return spec;
        }
    };


    var _metadata = {};
    function registerMetadata(id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_metadata[id]) throw new Error("a metadata already exist for " + id);

        var result = new MetaData(spec);
        _metadata[id] = result;
        return result;
    }

    function unregisterMetadata(id) {
        if (!ns.isValidNamespaceKey(id)) return;

        if (_metadata[id]) {
            _metadata[id] = undefined;
        }
        return true;
    }

    meta.metadataDictionaryKeys = function () {
        return Object.keys(_metadata);
    }

    meta.metadataDictionaryWhere = function (func) {
        if (!func) return {};
        var result = tools.applyOverKeyValue(_metadata, function (key, value) {
            if (!value) return undefined; //removed items are undefined
            return !func || func(key, value) ? value : undefined;
        });
        return result;
    }

    meta.metadataDictionaryClear = function (copy) {
        //this will return a copy and clear the original
        var result = {};
        if (copy) {
            result = tools.applyOverKeyValue(_metadata, function (key, value) {
                return value;
            });
        }
         _metadata = {}; //this clears the original
        return result;
    }


    meta.findMetadata = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;
        var definedSpec = _metadata[id];

        return definedSpec;
    }

    meta.defineMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        var completeSpec = tools.union(spec, { myType: id });
        var result = registerMetadata(id, completeSpec);
        return result;
    }

    meta.extendMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id) || !_metadata[id]) return;

        //for meta data I want to mix and extend,  so add properties that do not 
        //exist, and if they do then mix in there values

        var meta = _metadata[id];
        if (meta) {
            meta.extendSpec(spec);
        }

        return meta;
    }

    meta.establishMetadata = function (id, spec) {
        if (!ns.isValidNamespaceKey(id)) return;
        try {
            return meta.defineMetadata(id, spec);
        }
        catch (ex) {
            var completeSpec = tools.union(spec, { myType: id });
            return meta.extendMetadata(id, completeSpec);
        }
    }

    meta.removeMetadata = function (id) {
        return unregisterMetadata(id);
    }


    meta.getAllTypes = function () {
        //for sure you do not want to give then the array, they might destory it.
        var types = tools.mapOverKeyValue(_metadata, function (key, value) {
            if (!value) return;
            return {
                myName: key,
                myType: key,
                namespace: tools.getNamespace(value),
                name: tools.getType(value),
                spec: value,
            }
        })
        return types;
    }


    meta.guessMetaData = function (record) {
        var result = {};
        tools.forEachKeyValue(record, function (key, value) {
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
        var result = tools.mapOverKeyValue(metadataSpec, function (key, value) {
            return value && value.dataType == 'url' ? value : undefined;
        });
        return result;
    }

    meta.getPictureProperties = function (metadataSpec) {
        var result = tools.mapOverKeyValue(metadataSpec, function (key, value) {
            return value && value.dataType == 'resource' ? value : undefined;
        });
        return result;     
    }

    meta.getDisplayProperties = function (metadataSpec) {
        var result = tools.mapOverKeyValue(metadataSpec, function (key, value) {
            return value && (value.dataType == 'number' || value.dataType == 'text') ? value : undefined;
        });
        return result;
    }


    meta.findUserInputs = function (id, key) {
        var definedSpec = meta.findMetadata(id);
        if (!definedSpec) return [];

        return definedSpec.userInputs(key);
    }



}(Foundry, Foundry.meta, Foundry.tools));
