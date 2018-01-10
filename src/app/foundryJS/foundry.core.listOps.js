


var Foundry = Foundry || {};
Foundry.listOps = Foundry.listOps || {};
Foundry.tools = Foundry.tools || {};

(function (undefined) {
    //special functions to support string EXACT match comparisons
    if (!String.prototype.matches) {
        String.prototype.matches = function (str) {
            if (str) return this.toLocaleLowerCase() === str.toLocaleLowerCase();
            return str === this;
        };
    }
    //special functions to support string contains comparisons
    if (!String.prototype.contains) {
        String.prototype.contains = function (string) {
            return this.toLocaleLowerCase().indexOf(string.toLocaleLowerCase()) !== -1;
        };
    }

    if (!Number.prototype.matches) {
        Number.prototype.matches = function (num) {
            return this.valueOf() == new Number(num).valueOf();
        };
    }
    if (!Number.prototype.contains) {
        Number.prototype.contains = function (num) {
            return this.valueOf() == new Number(num).valueOf();
        };
    }

    if (!Boolean.prototype.matches) {
        Boolean.prototype.matches = function (num) {
            return this.valueOf() == new Boolean(num).valueOf();
        };
    }
    if (!Boolean.prototype.contains) {
        Boolean.prototype.contains = function (num) {
            return this.valueOf() == new Boolean(num).valueOf();
        };
    }


    if (!Array.prototype.matchAnyItem) {
        Array.prototype.matchAnyItem = function (list) {
            for (var i = 0; i < list.length; i++) {
                var target = list[i].trim();
                for (var j = 0; j < this.length; j++) {
                    var source = this[j].trim();
                    if (source.length > 0 && source.matches(target)) return true;
                }
            }
        };
    }

    if (!Array.prototype.anyMatch) {
        Array.prototype.anyMatch = function (string) {
            var list = string.split(',');
            var result = this.matchAnyItem(list);
            return result;
        };
    }

    if (!Array.prototype.containsAnyItem) {
        Array.prototype.containsAnyItem = function (list) {
            for (var i = 0; i < list.length; i++) {
                var target = list[i].trim();
                for (var j = 0; j < this.length; j++) {
                    var source = this[j].trim();
                    if (source.length > 0 && source.contains(target)) return true;
                }
            }
        };
    }


    if (!Array.prototype.containsMatch) {
        Array.prototype.containsMatch = function (string) {
            var list = string.split(',');
            var result = this.containsAnyItem(list);
            return result;
        };
    }

    if (!Array.prototype.trimString) {
        Array.prototype.trimString = function () {
            var list = String.split(',');
            var result = this.matchAnyItem(list);
            return result;
        };
    }

    if (!Array.prototype.groupBy) {
        Array.prototype.groupBy = function (groupClause, hash) {
            var result = hash ? hash : {};
            for (var i = 0, j = this.length; i < j; i++) {
                var item = this[i];
                var key = groupClause(item);
                if (key) {
                    result[key] ? result[key].push(item) : result[key] = [item];
                }
            }
            return result;
        };
    }


})();

(function (ns, tools, moment, undefined) {

    function isArray (obj) {
        if (Array.isArray) return Array.isArray(obj);
        return (Object.prototype.toString.call(obj) === '[object Array]') ? true : false;
    }
    function isFunction(obj) {
        return typeof obj === 'function';
    }
    function isString(obj) {
        return typeof obj === 'string';
    }
    function isNumber(obj) {
        return typeof obj === 'number';
    }
    function isObject (obj) {
        return obj && typeof obj === 'object'; //prevents typeOf null === 'object'
    }
    function trim(varString) {
        return varString.replace(/^\s+|\s+$/g, '');
    }

    function splitOnComma(obj) {
        return obj !== null ? String(obj).split(',') : [];
    }
    function pluck(propertyName) {
        return function (obj) {
            return obj[propertyName];
        };
    }



    var customProperty = {};
    ns.registerProperty = function (name, func) {
        customProperty[name] = func;
    };

    function getValue(name, obj) {
        var val = obj[name];
        if (val === undefined) {
            var func = customProperty[name];
            return func ? func(obj) : undefined;
        }
        return val;
    }

    function multiFieldGroup(list, listFn) {
        if (!listFn) return list;

        var result;
        var first = listFn[0];
        var rest = listFn.length > 1 ? listFn.slice(1, listFn.length) : null;

        if (Array.isArray(list)) {
            result = list.groupBy(first);
        } //assume this is an object 
        else {
            result = list;
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    var data = result[key];
                    if (Array.isArray(data)) {
                        result[key] = multiFieldGroup(data, listFn);
                    }                   
                }
            }
            return result;
        }
        return rest ? multiFieldGroup(result, rest) : result;
    }

    function multiFieldCount(list, listFn) {
        if (!listFn) return list;

        var result;
        var first = listFn[0];
        var rest = listFn.length > 1 ? listFn.slice(1, listFn.length) : null;

        if (Array.isArray(list)) {
            result = list.countBy(first);
        } //assume this is an object 
        else {
            result = list;
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    var data = result[key];
                    if (Array.isArray(data)) {
                        result[key] = multiFieldCount(data, listFn);
                    }
                }
            }
            return result;
        }
        return rest ? multiFieldCount(result, rest) : result;
    }

    var customGroups = {};
    ns.registerGroup = function (name, func) {
        customGroups[name] = func;
    };


    var customSorts = {};
    ns.registerSort = function (name, func) {
        customSorts[name] = func;
    };

    function singleFieldSort(c, d) {
        var dir = (d === undefined) ? 1 : d;
        var sortFn = customSorts[c] ? customSorts[c] : function (obj) { return obj[c]; };

        if (c === undefined || c === null) {
            return function (a, b) {
                return 0;
            };
        }
        else {
            return function (a, b) {
                var objA = sortFn(a);
                var objB = sortFn(b);

                if (typeof objA === "number" && typeof objB === "number")
                    return dir * (objA - objB);

                //check for time math the toDate function is on moment objects
                //if (moment && moment.isMoment(objA) && moment.isMoment(objB))
                //    return dir * objA.diff(objB);

                var left = objA || '';
                var right = objB || '';

                var val = dir * (left < right ? -1 : (left > right ? 1 : 0));
                return val;
            };
        }
    }

    function multiFieldSort(c, d) {
        if (c === null || c.length === 0) {
            return undefined;
        }
        else if (!Array.isArray(c)) {
            return singleFieldSort(c, d);
        }
        else {
            var first = c[0];
            var rest = c.length > 1 ? c.slice(1, c.length) : null;
            return function (a, b) {
                var dir = first.dir || d;
                var field = first.field || first;
                var result = singleFieldSort(field, dir)(a, b);
                if (result === 0 && rest !== null) {
                    return multiFieldSort(rest, d)(a, b);
                }
                return result;
            };
        }
    }


    function lessThanFilter(c, d) {
        return function (o, i, a) {
            var val = getValue(c,o);
            if (val === undefined) return false;
            return val < d;
        };
    }

    function lessThanFilterAndPositive(c, d) {
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            return val < d && val >= 0;
        };
    }


    function greaterThanFilter(c, d) {
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            return val > d;
        };
    }

    function inRangeFilter(c, d, e) {
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            return d <= val && val <= e;
        };
    }


    function equalsFilter(c, string) {
        var list = splitOnComma(string).map(trim);
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            var valArray = Array.isArray(val) ? val : splitOnComma(val);
            return valArray.matchAnyItem(list);
        };
    }


    function eitherOrFilter(c, d, string) {
        return ifAnyContainFilter([c, d], string);
    }

    function ifAnyMatchFilter(fieldNames, string) {
        var fields = Array.isArray(fieldNames) ? fieldNames : splitOnComma(fieldNames).map(trim);
        var list = splitOnComma(string).map(trim);
        return function (o, i, a) {
            var total = fields.filter(function (field) {
                var val = getValue(field, o);
                if (val === undefined) return false;
                var valArray = Array.isArray(val) ? val : splitOnComma(val);
                var result = valArray.matchAnyItem(list);
                return result;
            });
            return total.length > 0;
        };
    }

    function ifAnyContainFilter(fieldNames, string) {
        var fields = Array.isArray(fieldNames) ? fieldNames : splitOnComma(fieldNames).map(trim);
        var list = splitOnComma(string).map(trim);
        return function (o, i, a) {
            var total = fields.filter(function (field) {
                var val = getValue(field, o);
                if (val === undefined) return false;
                var valArray = Array.isArray(val) ? val : splitOnComma(val);
                var result = valArray.containsAnyItem(list);
                return result;
            });
            return total.length > 0;
        };
    }


    function andFilter(x, y) {
        if (!x) return function (o, i, a) { return y(o, i, a); };
        if (!y) return function (o, i, a) { return x(o, i, a); };
        return function (o, i, a) {
            return x(o, i, a) && y(o, i, a);
        };
    }

    function orFilter(x, y) {
        if (!x) return function (o, i, a) { return y(o, i, a); };
        if (!y) return function (o, i, a) { return x(o, i, a); };
        return function (o, i, a) {
            return x(o, i, a) || y(o, i, a);
        };
    }

    function multiSelectFilter(c, string) {
        var list = splitOnComma(string).map(trim);
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            var valArray = Array.isArray(val) ? val : splitOnComma(val);
            return valArray.matchAnyItem(list);
        };
    }

    function matchesFilter(c, string) {
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            return val.matches(string);
        };
    }



    function containsFilter(c, string) {
        return function (o, i, a) {
            var val = getValue(c, o);
            if (val === undefined) return false;
            var result = val.contains(string);
            return result;
        };
    }

    function typeInFilter(c, string) {
        var list = splitOnComma(string).map(trim);
        if (list.length > 1) {
            return multiSelectFilter(c, string);
        }
        return containsFilter(c, string);
    }

    function applyAndFilter(list) {
        if (list === undefined || !Array.isArray(list) || list.length === 0) {
            return undefined;
        }

        var result = list[0];
        for (var i = 1; i < list.length; i++) {
            var oItem = list[i];
            result = andFilter(result, oItem);
        }
        return result;
    }

    //New notFilter function just negates the result of any function (no relation or dependency on filters, so this might be better as a general-purpose utility function like debounce?)
    function notFilter(func) {
        return function () {
            return !func.apply(this, arguments);
        };
    }


    var customFilters = {};
    ns.registerFilter = function (name, func) {
        customFilters[name] = func;
    };

    function createFilterFunction(specArray) {
        if (specArray === undefined || specArray.length === 0)
            return undefined;

        return applyAndFilter(specArray.map(function (x) {
            if (!x) return;

            var propertyName = x.name;
            var filterValue = x.value;
            var isRangeFilter = filterValue.indexOf(":") > -1;
            var isNotFilter = x.negate;
            var key = x.bracketStart;

            // Determine filter function
            var filterFunction;
            if (customFilters[propertyName]) {
                filterFunction = customFilters[propertyName](filterValue);

            } else if (key === "[" && isRangeFilter) {
                var range = filterValue.split(':');
                var low = range[0] === "" || range[0] === "*" ? -1000000 : parseInt(range[0]);
                var high = range[1] === "" || range[1] === "*" ? 1000000 : parseInt(range[1]);
                if (low > high) {
                    var temp = high;
                    high = low;
                    low = temp;
                }
                filterFunction = inRangeFilter(propertyName, low, high);

            } else if (key === "[" && !isRangeFilter) {
                filterFunction = multiSelectFilter(propertyName, filterValue);

            } else if (key === "(" && !isRangeFilter) {
                filterFunction = typeInFilter(propertyName, filterValue);
            }

            // Apply negation
            if (isNotFilter) {
                filterFunction = notFilter(filterFunction);
            }

            return filterFunction;
        }));
    }



    function createSortFunction (specArray) {
        if (specArray === undefined || specArray.length === 0)
            return undefined;

        var sorts = multiFieldSort(specArray.map(function (x) {
            //the filter types are based on how the value is wraped
            var sortValue = x.value;
            var sValue = sortValue.substring(1, sortValue.length - 1);
            return {
                field: x.name,
                dir: sValue.contains("A") || sValue.contains("a") ? 1 : -1
            };
        }));
        return sorts;
    }

    ns.makeFilter = function (spec) {
        if (!spec) return undefined;
        var list = spec.split(';').filter(function (n) { return n; }); //removes null elements

        var specArray = list.map(function (item) {
            var parts = item.trim().match(/^(.+?)(\!?)([\[(])(.*)([\])])$/);
            if (parts) {
                return {
                    name: parts[1].trim(),
                    negate: parts[2] ? true : false,
                    bracketStart: parts[3],
                    value: parts[4].trim(),
                    bracketEnd: parts[5]
                };
            }
            return '';
        });


        return createFilterFunction(specArray);
    };

    ns.makeSort = function (spec) {
        if (!spec) return undefined;
        var list = spec.split(';').filter(function (n) { return n; }); //removes null elements

        var specArray = list.map(function (item) {
            var pr = item.split('(');
            if (pr.length === 2) {
                return { name: pr[0].trim(), value: '(' + pr[1].trim() };
            }
            return '';
        });

        return createSortFunction(specArray);
    };

    ns.applyFilter = function (list, filterSpec) {
        if (!list) return [];
        var filterFn = ns.makeFilter(filterSpec);
        var filteredList = filterSpec ? list.filter(filterFn) : list;
        return filteredList;
    };

    ns.applySort = function (list, sortSpec) {
        if (!list) return [];
        var sortFn = ns.makeSort(sortSpec);
        var sortedList = sortSpec ? list.sort(sortFn) : list;
        return sortedList;
    };

    ns.applyFilterAndSort = function (list, filterSpec, sortSpec) {
        if (!list) return [];
        var filteredList = ns.applyFilter(list,filterSpec)
        var sortedList =  ns.applySort(filteredList,sortSpec)
        return sortedList;
    };





    ns.makeGrouper = function (spec) {
        if (!spec) return undefined;
        var list = spec.split(';').filter(function (n) { return n; }); //removes null elements

        var groupings = list.map(function (item) {
            if (customGroups[item]) return customGroups[item];
            return pluck(item);
        });

        return groupings;
    };

    function asArray(list) {
        if (isArray(list)) return list;

        //look at links..
        if (tools.isTyped(list) && tools.isaLink && tools.isaLink(list)) {
            return list.myMembers
        }
        //look at collection..
        if (tools.isTyped(list) && tools.isaCollection && tools.isaCollection(list) ) {
            return list.asArray();
        }
        return tools.asArray(list);
    }

    ns.asArray = asArray;

    ns.applyGrouping = function (list, groupSpec) {
        if (!list) return undefined;

        var itemList = asArray(list);
        var groupFn = ns.makeGrouper(groupSpec);
        var group = groupSpec ? multiFieldGroup(itemList, groupFn) : undefined;
        return group;
    };

    ns.applyMapping = function (list, groupSpec) {
        if (!list) return undefined;

        var itemList = asArray(list);
        var group = ns.applyGrouping(itemList, groupSpec);
        var map = {};
        for (var key in group) {
            map[key] = group[key][0];
        }
        return map;
    };

    ns.applyCounting = function (list, countSpec) {
        if (!list) return undefined;

        var itemList = asArray(list);
        var countFn = ns.makeGrouper(countSpec);
        var counting = countSpec ? multiFieldCount(itemList, countFn) : undefined;
        return counting;
    };

    ns.applyCollectionMapping = function (list, groupSpec) {
        if (!list) return undefined;

        var itemList = asArray(list);
        var group = ns.applyGrouping(itemList, groupSpec);
        var map = {};
        for (var key in group) {
            var collection = fo.makeCollection(group[key]);
            collection.myName = key;
            map[key] = collection;
        }
        return map;
    };

    ns.identifyUniqueKeyFields = function (list) {
        if (!isArray(list) || !list[0]) return;
        var map = {};
        var keys = Object.keys(list[0]);
        var total = list.length;
        keys.forEach(function (item) {
            var group = ns.applyGrouping(list, item);
            var count = Object.keys(group).length;
            if (total == count) {
                map[item] = group;
            }
        })

        return map;
    };

    ns.applyFilterSortAndGrouping = function (list, filterSpec, sortSpec, groupSpec) {
        var filtersort = ns.applyFilterAndSort(list, filterSpec, sortSpec);
        var group = ns.applyGrouping(filtersort, groupSpec);
        return group;
    };


    ns.createHistogram = function (list, rule, min, max) {

        var group = ns.applyGrouping(list, rule);

        var minCount = min || 0;
        var maxCount = max || list.length;

        var histogram = [];
        tools.forEachKeyValue(group, function (key, members) {

            if (!key) return;
            if (members.length <= minCount) return;

            var relevance = maxCount ? (members.length == maxCount ? 0 : members.length / maxCount) : 0;

            var histo = {
                rule: rule,
                key: key,
                count: members.length,
                total: maxCount,
                members: members,
                relevance: Math.floor(100 * relevance) / 100,
            }

            histogram.push(histo);
        });

        var result = ns.applySort(histogram, 'relevance(d);count(d)');
        return result;
    }


    ns.multiSelect = multiSelectFilter;
    ns.typeIn = typeInFilter;
    ns.eitherOr = eitherOrFilter;
    ns.ifAnyContains = ifAnyContainFilter;
    ns.ifAnyMatches = ifAnyMatchFilter;
    ns.inRange = inRangeFilter;
    ns.createFilterFunction = createFilterFunction;
    ns.createSortFunction = createSortFunction;


    return ns;
}(Foundry.listOps, Foundry.tools));
