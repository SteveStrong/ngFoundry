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



    //this is designed to be obserervable
    //http://www.klauskomenda.com/code/javascript-inheritance-by-example/
    var EntityDictionary = function (properties, subcomponents, parent) {

        var dictionarySpec = {
            myName: 'unknown',
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
                return Object.keys(this.entries);
            },
            count: function () {
                return this.keys.length;
            },
            items: function () {
                this.count;
                var result = this.asArray();
                return result;
            },
            lookup: function () {
                this.count;
                var result = this.entries;
                return result;
            },
            filter: '',
            filteredItems: function () {
                var result = fo.filtering.applyFilter(this.items, this.filter);
                return result;
            },
            filteredCount: function () {
                return this.filteredItems.length;
            },
            meta: function () {
                return fo.meta.findMetadata(this.myName);
            },
            isActive: false,
            isOpen: true,
            toggleIsOpen: function () {
                this.isOpen = !this.isOpen;
            },
            title: function () {
                return this.name;
            },
        };

        this.base = ns.Component;
        this.base(ns.utils.union(dictionarySpec, properties), subcomponents, parent);
        this.myType = (properties && properties.myType) || 'EntityDictionary';

        return this;
    }

    //http://trephine.org/t/index.php?title=JavaScript_prototype_inheritance
    EntityDictionary.prototype = (function () {
        var Anonymous = function () { this.constructor = EntityDictionary; };
        Anonymous.prototype = ns.Component.prototype;
        return new Anonymous();
    })();


    ns.EntityDictionary = EntityDictionary;
    ns.utils.isaEntityDictionary = function (obj) {
        return obj instanceof EntityDictionary ? true : false;
    };



    EntityDictionary.prototype.reset = function (newEntries) {
        this.smashProperty('keys');
        var entries = newEntries ? newEntries : this.entries;

        var dict = {};
        ns.utils.loopForEachValue(entries, function (key, value) {
            if (value) {
                dict[key] = value;
            }
        });

        this.entries = dict;
        return this;
    };

    EntityDictionary.prototype.purge = function () {
        this.smashProperty('keys');
        if (this.entries) {  //drop references to help GC
            var keys = Object.keys(this.entries);
            for (var key in keys) {
                this.entries[key] = undefined;
            }
        }
        this.entries = {};
    };


    EntityDictionary.prototype.asArray = function (funct) {
        var objects = [];

        funct = funct ? funct : function (item) { return item; }
        ns.utils.loopForEachValue(this.entries, function (key, value) {
            if (value) {
                var result = funct(value);
                objects.push(result);
            }
        });

        return objects
    };


    ns.makeEntityDictionary = function (specId) {
        var obj = new EntityDictionary({
            myName: specId,
        });

        obj.getItem = function (id) {
            return obj.entries[id];
        };

        obj.setItem = function (id, item) {
            //if (item.myType != obj.myName) {
            //    alert('problems');
            //}
            this.smashProperty('keys');
            obj.entries[id] = item;
            return item;
        };

        obj.removeItem = function (id) {
            this.smashProperty('keys');
            var result = obj.entries[id];
            obj.entries[id] = undefined;
            return result;
        };

        return obj;
    };


 

 


    var _dictionaries = {};
    function establishDictionary(id) {
        var found = _dictionaries[id];
        if (!found) {
            _dictionaries[id] = ns.makeEntityDictionary(id);
            found = _dictionaries[id];
        }
        return found;
    }


    ns.getEntityDictionary = function (specId) {
        if (!ns.isValidNamespaceKey(specId)) return;
        return establishDictionary(specId)
    }

    ns.getEntityDictionaryAsArray = function (specId) {
        var dict = ns.getEntityDictionary(specId);
        return dict.items;
    }

    ns.getEntityDictionaryLookup = function (specId) {
        var dict = ns.getEntityDictionary(specId);
        return dict.lookup;
    }

    ns.getEntityDictionaryMeta = function (specId) {
        var dict = ns.getEntityDictionary(specId);
        return dict.meta;
    }

    ns.getEntityDictionaryKeys = function (specId) {
        var dict = ns.getEntityDictionary(specId);
        return Object.keys( dict.lookup );
    }


    ns.entityDictionaries = function () {
        var dictionaries = [];

        ns.utils.loopForEachValue(_dictionaries, function (key, value) {
            dictionaries.push(value);
        });
        return dictionaries;
    }

    ns.entityDictionariesKeys = function () {
        return Object.keys(_dictionaries);
    }

 

    ns.saveDictionary = function (specId, storageKey, dehydrate) {
        if (!ns.isValidNamespaceKey(specId)) return;
        var dictionary = establishDictionary(specId);

        if (localStorage) {
            var objects = [];
            dehydrate = dehydrate ? dehydrate : function (item) { return item.getSpec(); };
            ns.utils.loopForEachValue(dictionary.lookup, function (key, value) {
                if ( value ) {
                    var result = dehydrate(value);
                    objects.push(result);
                }
            })

            var payload = JSON.stringify(objects);
            localStorage.setItem(storageKey || specId, payload);
            return true;
        }
    }

    ns.restoreDictionary = function (specId, storageKey, hydrate) {
        if (!ns.isValidNamespaceKey(specId)) return;
        if (localStorage) {
            var factory = ns.typeFactory(specId);
            hydrate = hydrate ? hydrate : function (item) { return factory.establish(item, item.myName); };
            var payload = localStorage.getItem(storageKey || specId) || '[]';

            var objects = JSON.parse(payload);
            objects.forEach(hydrate);

            return true;
        }
    }

    ns.deleteDictionary = function (specId) {
        if (!ns.isValidNamespaceKey(specId)) return;

        var found = _dictionaries[specId];
        if (found) {  //drop references to help GC
            found.purge();
        }

        delete _dictionaries[specId];
    }

    ns.unloadDictionary = function (specId, idList) {
        if (!ns.isValidNamespaceKey(specId)) return;
        var results = [];
        var found = _dictionaries[specId];
        if (!found) return results;

        idList = idList || [];
        idList.forEach(function(id){
            results.push(found.removeItem(id));
        });

        found.reset()
        return results;
    }


    


}(Foundry));