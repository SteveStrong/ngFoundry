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

(function (undefined) {

    if (!Array.prototype.addNoDupe) {
        Array.prototype.addNoDupe = function (element) {
            if (this.length === 0) {
                this.push(element);
                return true;
            }
            else if (this.length === 1 && element !== this[0]) {
                this.push(element);
                return true;
            }
            else {
                found = this.indexOf(element);
                if (found === -1) {
                    this.push(element);
                    return true;
                }
            }
        };
    };

    if (!Array.prototype.prependNoDupe) {
        Array.prototype.prependNoDupe = function (element) {
            if (this.length === 0) {
                this.push(element);
                return true;
            }
            else if (this.length === 1 && element !== this[0]) {
                this.splice(0, 0, element);
                return true;
            }
            else {
                found = this.indexOf(element);
                if (found === -1) {
                    this.splice(0, 0, element);
                    return true;
                }
            }
        };
    };

    if (!Array.prototype.isEmpty) {
        Array.prototype.isEmpty = function () {
            return this.length == 0;
        }
    };

    if (!Array.prototype.isNotEmpty) {
        Array.prototype.isNotEmpty = function () {
            return this.length > 0;
        }
    };


})();

(function (ns, undefined) {

    //this is designed to be obserervable
    var Collection = function (init, parent, spec) {

        this.myName = undefined;
        this.owner = parent;
        //obsolite this.dataContext = this;

        this.elements = (init === undefined) ? [] : init;

        this.withDependencies = true

        // var count = new Property(this, 'count', function () { return this.elements.length; }); //could property will change
        var count = new ns.Counter(this); //could property will change
        spec && ns.utils.extendWithComputedValues(this, spec);
        return this;
    }


    //Prototype defines functions using JSON syntax
    Collection.prototype = {

        getID: function () {
            if (this.guid) return this.guid;
            this.guid = ns.utils.createID(this.myName);
            return this.guid;
        },

        globalComputeStack: function () {
            return this.owner ? this.owner.globalComputeStack() : undefined;
        },
        currentComputingProperty: function () {
            var stack = this.globalComputeStack();
            return stack && stack.peek();
        },



        stringify: function (that) {
            var target = that || this;
            //if (target.hasOwnProperty(key)) {
            //    return undefined;
            //}
            function ResolveCircular(key, value) {
                switch (key) {
                    case 'owner':
                        //obsolite case 'dataContext':
                    case 'myParent':
                        return value ? value.asReference() : value;
                    case 'thisValueDependsOn':
                    case 'thisInformsTheseValues':
                    case 'uiBindings':
                    case 'onRefreshUi':
                    case 'trace':
                        return undefined;
                }
                return value;
            }

            return JSON.stringify(target, ResolveCircular, 3);
        },

        getSpec: function (deep) {
            if (this.count == 0) return undefined;
            var items = this.elements.map(function (item) {
                return item.getSpec(deep);
            });
            return items;
        },

        asReference: function () {
            if (this.owner === undefined) {
                return this.myName ? this.myName : "collection";
            }
            return this.owner.asReference() + "." + this.myName;
        },

        smash: function () {
            var p = this['_count'];
            if (p && p.status) {
                fo.publishNoLock('smash', [p]);
                p.smash();
            }
        },

        purgeBindings: function (deep) {
            var result = false;
            this.elements.forEach(function (item) {
                result = item.purgeBindings(deep) || result;
            });
            return result;
        },

        resolveProperty: function (reference) {
            alert('please bind to a data-repeater' + reference);
        },
        resolveSuperior: function (reference) {
            if (this.myName.match(reference) || ns.utils.isSelf(reference)) return this;
            var result = this.owner.resolveSuperior(reference);
            return result;
        },

        resolvePropertyReference: function (reference) {
            var result = {};
            var obj = this;

            if (reference.containsString('#')) {
                var ref = reference.split('#')
                result = this.resolvePropertyReference(ref[0]);
                result.meta = ref[1];
                return result;
            }

            //now it is probably just a property and we may need to peek at the value
            var property = obj.getProperty(reference);
            var found = undefined; //now looking for collection or component

            if (property === undefined) {
                found = obj[reference]; //now looking for collection or component
            }
            else {
                result.property = property;  //peek at value 
                if (property.status) found = property.value;
            }

            if (ns.utils.isaCollection(found)) {
                result.collection = found;
            }
            else if (ns.utils.isaComponent(found)) {
                result.component = found;
            }
            return result;
        },

        getProperty: function (name, search) {
            var sPrivate = "_" + name;
            var p = this[sPrivate];
            return p ? p : search && this.myParent ? this.myParent.getProperty(name, search) : p;
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

        smashProperties: function (names, search) {
            var obj = this;
            var list = fo.utils.isArray(names) ? names : names.split(',');
            list.forEach(function (name) {
                obj.smashProperty(name, search);
            });

            return obj;
        },

        //there are additional 'meta' slots that contain Meta or Reference data on property objects
        getMetaData: function (meta, metaDefault) {
            if (meta === undefined || this[meta] === undefined) return metaDefault;

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

            var promise = new Promise(this.owner, meta);
            promise.value = this;
            return promise;
        },

        setMetaData: function (meta, metaInit) {
            if (meta !== undefined) {
                this[meta] = metaInit;
            }
            return this;
        },

        //used in binding an get and set the value from the owner
        getValue: function (meta) {
            if (meta !== undefined) {
                return this; //.owner[this.myName];
            }
            return this;
        },

        push: function (element) {
            if (element) {
                this.elements.push(element);
                this.smash();
            }
            return element;
        },

        addList: function (list) {
            if (list) {
                this.elements = this.elements.concat(list);
                this.smash();
            }
            return this;
        },

        addNoDupe: function (element) {
            if (element) {
                this.elements.addNoDupe(element);
                this.smash();
            }
            return element;
        },
        prependNoDupe: function (element) {
            if (element) {
                this.elements.prependNoDupe(element);
                this.smash();
            }
            return element;
        },
        insertNoDupe: function (index, element) {
            if (element && this.elements.indexOf(element) == -1) { //things should not be found
                this.elements.insert(index, element);
                this.smash();
            }
            return element;
        },



        pop: function () {
            var element = this.elements.pop();
            this.smash();
            return element;
        },

        peek: function () {
            if (this.elements && this.elements.length > 0) {
                var i = this.elements.length - 1;
                return this.elements[i];
            }
        },

        item: function (i) {
            return this.elements[i];
        },

        first: function () {
            return this.elements.length > 0 ? this.elements[0] : undefined;
        },

        last: function () {
            var i = this.elements.length - 1;
            return i >= 0 ? this.elements[i] : undefined;
        },

        next: function (item, cycle) {
            var i = this.indexOf(item) + 1;
            if (i >= this.elements.length) return cycle ? this.first() : item;
            return this.elements[i];
        },

        previous: function (item, cycle) {
            var i = this.indexOf(item) - 1;
            if (i < 0) return cycle ? this.last() : item;
            return this.elements[i];
        },

        add: function (element) {
            if (element === undefined) return element;
            if (ns.utils.isArray(element)) {
                for (var i = 0; i < element.length; i++) this.elements.push(element[i]);
            }
            else {
                this.elements.push(element);
            }
            this.smash();
            return element;
        },

        reset: function (element) {
            this.clear();
            return this.add(element);
        },

        remove: function (element) {
            var i = this.elements.length;
            this.elements.removeItem(element);
            var j = this.elements.length;
            if (i !== j) {
                this.smash();
            }
            return element;
        },

        removeWhere: function (predicate) {
            var list = this.filter(predicate).elements;
            for (var i = 0; i < list.length; i++) {
                this.remove(list[i]);
            }
            return this;
        },

        sumOver: function (initValue) {
            return this.reduce(function (a, b) {
                return a += b;
            }, initValue ? initValue : 0);
        },

        commaDelimited: function (delimiter) {
            var delim = delimiter ? delimiter : ',';
            return this.reduce(function (a, b) {
                return a += (b + delim);
            }, '');
        },

        slice: function (start, end) {
            return this.elements.slice(start, end)
        },

        members: function (col) {
            // var list = col === undefined ? ns.makeCollection([], this) : col;
            return this.copyTo([]);
        },

        membersWhere: function (whereClause, col) {
            var list = col === undefined ? ns.makeCollection([], this) : col;
            //using Count will set up a dependency 
            if (this.count > 0) {
                this.copyWhere(whereClause, list);
            };
            return list;
        },

        isEmpty: function () {
            //return this.count === 0; // do this to create a dependency
            return this.elements.isEmpty();
        },

        isNotEmpty: function () {
            //return this.count === 0; // do this to create a dependency
            return this.elements.isNotEmpty();
        },

        copyTo: function (list) {
            var result = list ? list : [];
            for (var i = 0; i < this.elements.length; i++) {
                result.push(this.elements[i]);
            }
            return result;
        },

        copyWhere: function (whereClause, list) {
            var result = list ? list : [];
            for (var i = 0; i < this.elements.length; i++) {
                var item = this.elements[i];
                var ok = (whereClause == undefined) ? true : whereClause(item);
                if (ok) result.push(item);
            }
            return result;
        },

        firstWhere: function (whereClause) {
            for (var i = 0; i < this.elements.length; i++) {
                var item = this.elements[i];
                var ok = (whereClause == undefined) ? true : whereClause(item);
                if (ok) return item;
            }
        },

        clear: function () {
            this.elements = [];
            this.smash();
        },

        indexOf: function (item) {
            return this.elements.indexOf(item);
        },

        indexOfFirst: function (predicate) {
            return this.elements.indexOfFirst(predicate);
        },

        itemByIndex: function (index) {
            return this.elements.itemByIndex(index);
        },

        duplicate: function (filterFunction) {
            var list = ns.makeCollection();

            if (this.count === 0) return list; // do this to create a dependency
            this.copyTo(list);
            return list;
        },

        filter: function (filterFunction) {
            var list = ns.makeCollection();

            if (this.count === 0) return list; // do this to create a dependency
            return this.copyWhere(filterFunction, list);
        },

        sortOn: function (field) {
            var changed = false;
            if (field) {
                var newList = this.elements.sort(function (a, b) {
                    var result = (a[field] < b[field] ? -1 : (a[field] > b[field] ? 1 : 0));
                    if (result < 0) changed = true;
                    return result;
                });
            }
            if (changed) {
                this.elements = newList;
                ns.trace && ns.trace.error("SORTING SMASHED THE COLLECTION");
                this.smash();
            }
            return this;
        },

        forEach: function (mapFunction) {
            if (this.count === 0) return undefined; // do this to create a dependency
            return this.elements.forEach(mapFunction);
        },

        map: function (mapFunction) {
            if (this.count === 0) return this.elements; // do this to create a dependency
            return this.elements.map(mapFunction);
        },

        reduce: function (reduceFunction, init) {
            if (this.count === 0) return undefined; // do this to create a dependency
            return this.elements.reduce(reduceFunction, init);
        },

        mapReduce: function (mapFunction, reduceFunction, init) {
            return this.elements.map(mapFunction).reduce(reduceFunction, init);
        },

        mapCollectNoDupe: function (mapFunction) {
            var result = new Collection([], this.myParent);
            this.elements.map(mapFunction).forEach(function (item) {
                result.addNoDupe(item);
            });
            return result;
        },

        sumAll: function (prop, init) {
            var pluck = ns.utils.pluck(prop);
            var sum = function (a, b) { return a += b; };
            return this.elements.map(pluck).reduce(sum, init ? init : 0);
        },

        maxAll: function (prop, init) {
            var pluck = ns.utils.pluck(prop);
            var max = function (a, b) { return Math.max(a, b) };
            return this.elements.map(pluck).reduce(max, init !== undefined ? init : -Infinity);
        },

        minAll: function (prop, init) {
            var pluck = ns.utils.pluck(prop);
            var min = function (a, b) { return Math.min(a, b) };
            return this.elements.map(pluck).reduce(min, init !== undefined ? init : Infinity);
        },

        selectComponents: function (whereClause, col) {
            var list = col === undefined ? ns.makeCollection([], this) : col;

            //using Count will set up a dependency 
            if (this.count > 0) {
                this.copyWhere(whereClause, list);
                for (var i = 0; i < this.elements.length ; i++) {
                    var comp = this.elements[i];
                    comp.selectComponents(whereClause, list);
                };
            };
            return list;
        },
    }


    //this is designed to be obserervable
    //http://www.klauskomenda.com/code/javascript-inheritance-by-example/
    var OrderedCollection = function (init, parent, indexName) {
        this.base = Collection;

        var list = ns.utils.isaCollection(init) ? init.elements : init;
        this.base(list, parent);

        this.indexName = indexName;

        this.sortOn(this.indexName);
        this.synchronizeElements();
        return this;
    }

    //http://trephine.org/t/index.php?title=JavaScript_prototype_inheritance
    OrderedCollection.prototype = (function () {
        var anonymous = function () { this.constructor = OrderedCollection; };
        anonymous.prototype = Collection.prototype;
        return new anonymous();
    })();

    OrderedCollection.prototype.setItemIndex = function (item, index) {
        if (this.indexName === undefined) return item;

        if (item[this.indexName] !== undefined) {
            item[this.indexName] = index;
        }
        else if (ns.utils.isaComponent(item)) {
            item.createProperty(this.indexName, index);
        }
        else {
            item[this.indexName] = index;
        }
        return item;
    }

    OrderedCollection.prototype.synchronizeElements = function () {
        var elements = this.elements;
        for (var i = 0; i < elements.length; i++) {
            var item = elements[i];
            this.setItemIndex(item, i);
        };
        this.markForRefresh()
    };

    OrderedCollection.prototype.markForRefresh = function () {
        ns.markForRefresh(this.getProperty("count"));
        return this;
    }

    OrderedCollection.prototype.addItem = function (item) {
        var result = this.add(item);
        this.setItemIndex(result, this.elements.length - 1);
        this.markForRefresh();
        return item;
    }

    OrderedCollection.prototype.removeItem = function (item) {
        var result = this.remove(item);
        if (item.getProperty(this.indexName)) {
            item.deleteProperty(this.indexName)
        }
        delete result[this.indexName];
        this.synchronizeElements();
        return result;
    }

    OrderedCollection.prototype.swapItemTo = function (item, index) {
        if (index < 0 || index > this.count - 1 || isNaN(index)) return item;
        var oldItem = this.elements[index];

        var oldIndex = item[this.indexName];
        if (oldIndex !== undefined) {
            this.elements[index] = this.setItemIndex(item, index);
            this.elements[oldIndex] = this.setItemIndex(oldItem, oldIndex);
            this.markForRefresh();
        }
        return item;
    }


    ns.Collection = Collection;
    ns.OrderedCollection = OrderedCollection;


}(Foundry));