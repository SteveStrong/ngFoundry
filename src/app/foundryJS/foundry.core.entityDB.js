var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};
Foundry.db = Foundry.db || {};
Foundry.listOps = Foundry.listOps || {};

(function (ns, db, tools, listOps, undefined) {

    //in prep for prototype pattern...
    var EntityDB = function (properties, subcomponents, parent) {
        //"use strict";

        this.base(properties, subcomponents, parent);
        this.myType = 'EntityDB';

        this._mySharedSource = undefined;
        this.sharedDB = function (source) {
            this._mySharedSource = this._mySharedSource || source;
            return this._mySharedSource ? this._mySharedSource : this;
        }

        this.idFunction = function (mixin, instance) {
            return mixin && (mixin.id || mixin.myGuid);
        }

        this.newInstance = function (mixin, subcomponents, parent, id) {
            var result = this.defaultType.newInstance(mixin, subcomponents, parent)
            var key = id || this.idFunction(mixin, result);
            key && this.setItem(key, result);
            return result;
        }

        this.newExactInstance = function (mixin, subcomponents, parent, id) {
            var result = this.defaultType.newExactInstance(mixin, subcomponents, parent)
            var key = id || this.idFunction(mixin, result);
            key && this.setItem(key, result);
            return result;
        }

        this.forceItemInsert = function (item, id) {
            var self = this.sharedDB();
            var key = id || this.idFunction(item);
            this.setItem(key, item);
            return item;
        }

        this.findInstance = function (id, onFound) {
            var found = this.lookup[id];
            found && onFound && onFound(found);
            return found;
        }

        function modifyOrCreateInstance(mixin, id, exact) {
            var key = id || this.idFunction(mixin);
            var found = this.getItem(key);
            if (!found) {
                var create = !exact ? this.defaultType.newInstance : this.defaultType.newExactInstance
                found = create.call(this.defaultType, mixin);
                key = key || found.asReference(); //force guid to be created
                this.setItem(key, found);
            } else {
                var funct = !exact ? tools.mixin : tools.mixExact
                funct.call(tools, found, mixin);
            }
            return found;
        }


        this.establishInstance = function (mixin, id, onCreate) {
            var result = modifyOrCreateInstance.call(this, mixin, id, false);
            onCreate && onCreate(result)
            return result;
        }

        this.establishExactInstance = function (mixin, id, onCreate) {
            var result = modifyOrCreateInstance.call(this, mixin, id, true);
            onCreate && onCreate(result)
            return result;
        }

        this.restoreInstance = function (obj, deep) {
            try {
                return db.restoreInstance(obj, deep);
            } catch (ex) {
                alert(ex);
            }
        }

        return this;
    }

    EntityDB.prototype = (function () {
        var anonymous = function () {
            this.constructor = EntityDB;
            this.base = ns.Component ? ns.Component : ns.Node;
        };
        anonymous.prototype = ns.Component ? ns.Component.prototype : ns.Node.prototype;
        return new anonymous();
    })();

    ns.EntityDB = EntityDB;
    ns.makeEntityDB = function (id, subcomponents, parent) {

        var dictionarySpec = {
            myName: id,
            namespace: function () {
                var list = this.myName.split('::');
                return list[0]
            },
            name: function () {
                var list = this.myName.toUpperCase().split('::');
                return list.length > 1 ? list[1] : list[0];
            },
            entries: {},
            keys: function () {
                return Object.keys(this.sharedDB().entries);
            },
            count: function () {
                return this.keys.length;
            },
            items: function () {
                var result = this.count ? this.sharedDB().asArray() : [];
                return result;
            },
            lookup: function () {
                var result = this.count ? this.sharedDB().entries : {};
                return result;
            },
            filter: '',
            filteredItems: function () {
                var result = listOps.applyFilter(this.items, this.filter);
                return result;
            },
            filteredCount: function () {
                return this.filteredItems.length;
            },
            meta: function () {
                return fo.meta && fo.meta.findMetadata(this.myName);
            },
            defaultType: function () {
                return fo.findType(this.myName) || fo.establishType(this.myName);
            },
        };

        return new ns.EntityDB(dictionarySpec, subcomponents, parent);
    };


    //Prototype defines functions using JSON syntax
    tools.mixin(EntityDB.prototype, {
        asArray: function (funct) {
            funct = funct ? funct : function (item) { return item; };
            var entries = this.sharedDB().entries;
            var list = tools.mapOverKeyValue(entries, function (key, value) {
                return funct(value);
            });

            return list;
        },
        purge: function (x) {
            this.sharedDB().smashProperty('keys');
        },
        getItem: function (id) {
            var entries = this.getEntries();
            return entries[id];
        },
        setItem: function (id, item) {
            this.sharedDB().smashProperty('keys');
            var entries = this.getEntries();
            entries[id] = item;
            return item;
        },
        getEntries: function () {
            var entries = this.sharedDB().entries;
            return entries;
        },
        getItems: function () {
            var result = this.sharedDB().items;
            return result;
        },
        removeItem: function (id) {
            this.sharedDB().smashProperty('keys');
            var entries = this.getEntries();
            var result = entries[id];
            entries[id] = undefined;
            return result;
        },

        forEachMember: function (funct) {
            this.getItems().forEach(funct);
        },

        forEachKeyValueMember: function (funct) {
            tools.forEachKeyValue(this.getEntries(), funct);
        },

        setDbSharedSource: function (source) {
            this.sharedDB(source || this);
        },
    });


}(Foundry, Foundry.db, Foundry.tools, Foundry.listOps));


(function (ns, db, tools, undefined) {

    // Feature detect + local reference
    var storage = (function () {
        var uid = new Date;
        var result;
        try {
            localStorage.setItem(uid, uid);
            result = localStorage.getItem(uid) == uid;
            localStorage.removeItem(uid);
            return result && localStorage;
        } catch (exception) { }
    }());


    var _dictionaries = {};
    function establishDictionary(specId) {
        var found = _dictionaries[specId];
        if (!found) {
            _dictionaries[specId] = ns.makeEntityDB(specId);
            found = _dictionaries[specId];
        }
        return found;
    }

    function findDictionary(specId) {
        var found = _dictionaries[specId];
        return found;
    }

    db.getEntityDB = function (specId) {
        if (!ns.isValidNamespaceKey(specId)) return;
        return establishDictionary(specId)
    }

    db.getEntityDBAsArray = function (specId) {
        var dict = db.getEntityDB(specId);
        return dict.items;
    }

    db.getEntityDBLookup = function (specId) {
        var dict = db.getEntityDB(specId);
        return dict.lookup;
    }

    db.getEntityDBMeta = function (specId) {
        var dict = db.getEntityDB(specId);
        return dict.meta;
    }

    db.getEntityDBKeys = function (specId) {
        var dict = db.getEntityDB(specId);
        return Object.keys(dict.lookup);
    }


    db.entityDBKeys = function () {
        return Object.keys(_dictionaries);
    }

    db.entityDBWhere = function (func) {
        var result = tools.applyOverKeyValue(_dictionaries, function (key, value) {
            return !func || func(key, value) ? value : undefined;
        });
        return result;
    }

    db.getAllEntityDBs = function () {
        var found = db.entityDBWhere(function (key, value) { return true; });
        return tools.mapOverKeyValue(found, function (key, value) { return value; });
    }


    //assume that this obj has properties that should be managed objects, but are not
    //use the information stored in myType to recreate them from the spec
    db.restoreInstance = function (obj, deep) {
        tools.forEachKeyValue(obj, function (key, spec) {
            if (!spec) return;

            if (deep && tools.isTyped(spec)) {
                db.restoreInstance(spec, deep);
            }
            else if (spec.myType) {
                var result;
                var store = findDictionary(spec.myType);
                //if this does not have an ID then create a new instance 
                //idFunction
                if (!store) {
                    result = fo.newInstance(spec.myType, spec);
                } else if (store.idFunction && store.idFunction(spec)) {
                    result = store.establishExactInstance(spec);
                } else {
                    result = store.newExactInstance(spec);
                }
                obj[key] = result;
                deep && db.restoreInstance(result, deep);
            }
        });
        return obj;
    }

    db.saveAllEntityDB = function (specId, storageKey, dehydrate) {
        try {
            if (!storage) {
                return false;
            }
            var lookup = db.getEntityDBLookup(specId);

            if (storage) {
                dehydrate = dehydrate ? dehydrate : function (item) {
                    return item.getSpec ? item.getSpec() : item;
                };

                var objects = ns.tools.mapOverKeyValue(lookup, function (key, value) {
                    if (value) {
                        var result = dehydrate(value);
                        return result;
                    }
                });

                var payload = tools.stringify(objects); //JSON.stringify(objects);
                storage.setItem(storageKey || specId, payload);
                return true;
            }

       } catch (e) {
            return false;
       }
    }

    db.restoreAllEntityDB = function (specId, storageKey, hydrate) {
        if (!ns.isValidNamespaceKey(specId)) return;
        try {
            if (!storage) {
                return false;
            }
            if (storage) {
                var entityDB = db.getEntityDB(specId);
                hydrate = hydrate ? hydrate : function (item) {
                    return entityDB.establishInstance(item);
                };

                var payload = storage.getItem(storageKey || specId) || '[]';

                var objects = JSON.parse(payload);
                objects.forEach(hydrate);

                return true;
            }
        }
        catch (e) {
            return false;
        }

    }

    db.deleteEntityDB = function (specId) {
        if (!ns.isValidNamespaceKey(specId)) return;

        var found = _dictionaries[specId];
        if (found) {  //drop references to help GC
            found.purge();
        }

        delete _dictionaries[specId];
    }

    db.unloadEntityDB = function (specId, idList) {
        if (!ns.isValidNamespaceKey(specId)) return;
        var results = [];
        var found = _dictionaries[specId];
        if (!found) return results;

        idList = idList || [];
        idList.forEach(function (id) {
            results.push(found.removeItem(id));
        });

        found.reset()
        return results;
    }




}(Foundry, Foundry.db, Foundry.tools));