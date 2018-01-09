var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};

(function (ns, tools, undefined) {

    function getManager(parent) {
        var collections = parent._collections;
        if (!collections) throw new Error("collections does not exist " + name);

        return collections;
    }

    function getCollection(parent, name) {
        var collections = parent._collections;
        if (!collections) throw new Error("collections property does not exist " + name);

        return collections[name];
    }

    function setCollection(parent, name, value) {
        var collections = parent._collections;
        if (!collections) {
            collections = parent._collections = {};
        }
        var slot = collections[name];
        if (slot && slot != value) {
            throw new Error("cannot replace collections property " + name);
        }

        value.myName = name;
        value.myParent = parent;
        collections[name] = value;

        return collections[name];
    }

    function findCollection(parent, name) {
        var collections = parent._collections;
        return collections && collections[name];
    }

    var Collection = function (owner, name, init) {

        this.myName = name || undefined;
        this.myParent = owner;
        this.myType = 'Collection';

        this.elements = (init === undefined) ? [] : init;

        this.counter = new ns.Counter(this, 'count'); //could property will change
        var self = this;

        tools.defineCalculatedProperty(this, 'length', function () { return self.count; });


        if (this.myName && owner) {
            setCollection(owner, this.myName, this);
        }

        return this;
    }

    Collection.prototype = (function () {
        var anonymous = function () { this.constructor = Collection; };
        anonymous.prototype = ns.Node.prototype;
        return new anonymous();
    })();

    ns.Collection = Collection;
    ns.Collection.getManager = getManager;
    ns.Collection.capture = setCollection;
    ns.Collection.find = findCollection;

    Collection.make = function (name, subcomponents, parent) {
        return new ns.Collection(parent, name, subcomponents);
    };
    ns.makeCollection = Collection.make;

    tools.isaCollection = function (obj) {
        return obj && obj.isInstanceOf(Collection);
    };

    //should return a new collection with all but the first;
    //tools.defineCalculatedProperty(Collection.prototype, 'rest', function () {
    //    return this.elements.length > 0 ? this.elements[0] : undefined;
    //});

    tools.defineCalculatedProperty(Collection.prototype, 'all', function () {
        return this.elements.length > 0 ? this.elements : [];
    });

    tools.defineCalculatedProperty(Collection.prototype, 'first', function () { 
        return this.elements.length > 0 ? this.elements[0] : undefined;
    });

    tools.defineCalculatedProperty(Collection.prototype, 'second', function () {
        return this.elements.length > 1 ? this.elements[1] : undefined;
    });

    tools.defineCalculatedProperty(Collection.prototype, 'last', function () {
        var i = this.elements.length - 1;
        return i >= 0 ? this.elements[i] : undefined;
    });

    tools.defineCalculatedProperty(Collection.prototype, 'nearlyLast', function () {
        var i = this.elements.length - 2;
        return i >= 0 ? this.elements[i] : undefined;
    });

    //Prototype defines functions using JSON syntax
    tools.mixin(Collection.prototype, {
        toJSON: function () {
            var obj = {
                elements: this.elements,
            };
            return obj;
        },

        createManagedProperty: function (name, init) {
            var property = new ns.Property(this, name, init);
            return property;
        },

        getManagedProperty: function (name) {
            try {
                return ns.Property.find(this, name);
            } catch (ex) {
            }
        },


        mergeManagedProperties: function (spec) {
            for (var key in spec) {
                var init = spec[key];
                this.createManagedProperty.call(this, key, init);
            }
        },

        smash: function () {
            var p = this.counter;
            if (p && p.status) {
                fo.publishNoLock('smash', [p]);
                p.smash();
            }
        },

        asArray:function() {
            return this.elements;
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

        findByName: function (name) {
            return this.firstWhere(function (p) { return p.myName && p.myName.matches(name) });
        },

        add: function (element) {
            if (element === undefined) return element;
            if (tools.isArray(element)) {
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
            if (this.length > 0) {
                this.copyWhere(whereClause, list);
            };
            return list;
        },

        isEmpty: function () {
            //return this.length === 0; // do this to create a dependency
            return this.elements.isEmpty();
        },

        isNotEmpty: function () {
            //return this.length === 0; // do this to create a dependency
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

            if (this.length === 0) return list; // do this to create a dependency
            this.copyTo(list);
            return list;
        },

        filter: function (filterFunction) {
            var list = ns.makeCollection();

            if (this.length === 0) return list; // do this to create a dependency
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
            if (this.length === 0) return undefined; // do this to create a dependency
            return this.elements.forEach(mapFunction);
        },

        map: function (mapFunction) {
            if (this.length === 0) return this.elements; // do this to create a dependency
            return this.elements.map(mapFunction);
        },

        reduce: function (reduceFunction, init) {
            if (this.length === 0) return undefined; // do this to create a dependency
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
            var pluck = tools.pluck(prop);
            var sum = function (a, b) { return a += b; };
            return this.elements.map(pluck).reduce(sum, init ? init : 0);
        },

        maxAll: function (prop, init) {
            var pluck = tools.pluck(prop);
            var max = function (a, b) { return Math.max(a, b) };
            return this.elements.map(pluck).reduce(max, init !== undefined ? init : -Infinity);
        },

        minAll: function (prop, init) {
            var pluck = tools.pluck(prop);
            var min = function (a, b) { return Math.min(a, b) };
            return this.elements.map(pluck).reduce(min, init !== undefined ? init : Infinity);
        },

        selectComponents: function (whereClause, col) {
            var list = col === undefined ? ns.makeCollection([], this) : col;

            //using Count will set up a dependency 
            if (this.length > 0) {
                this.copyWhere(whereClause, list);
                for (var i = 0; i < this.elements.length ; i++) {
                    var comp = this.elements[i];
                    comp.selectComponents(whereClause, list);
                };
            };
            return list;
        },

    });

}(Foundry, Foundry.tools));