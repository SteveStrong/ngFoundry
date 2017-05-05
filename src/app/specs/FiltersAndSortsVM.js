/// <reference path="../Scripts/CONTROLLER.js" />
/// <reference path="../SPAShell/ServiceWrapper.js" />
/// <reference path="../Scripts/MAINPAGE.js" />
/// <reference path="../Scripts/DEBUG.js" />
/// <reference path="../Foundry/Foundry.core.js" />

var viewModels = viewModels || {};

(function (ns, undefined) {


    function StringifyQueryStringArgument(array) {
        var result = undefined;
        if (array && array.length) {
            var list = array.map(function (x) {
                return x.name + x.value;
            });
            result = list.join(";");
        }
        return result;
    }

    function QueryStringArgumentToObject(sQuery) {
        if (sQuery) {
            var result = {};
            var array = sQuery.split(';');
            for (var i = 0; i < array.length; i++) {
                var oItem = array[i];
                var oKVpair = oItem.split('(');
                if (oKVpair.length == 2) {
                    result[oKVpair[0]] = "(" + oKVpair[1];
                    continue;
                }
                oKVpair = oItem.split('[');
                if (oKVpair.length == 2) {
                    result[oKVpair[0]] = "[" + oKVpair[1];
                    continue;
                }
            }
            return result;
        }
    }

    function createFilterFunction(specArray) {
        if (specArray === undefined || specArray.length === 0)
            return undefined;

        var filters = FS.ApplyAnd(specArray.map(function (x) {
            //you need to lookup the type of filter thsi is based on the key MultiSelectFilter || TypeIn...
            if (!x) return;

            //the filter types are based on how the value is wraped
            var filterValue = x.value;
            var sValue = filterValue.substring(1, filterValue.length - 1);
            var bIsRange = sValue.indexOf(":") == -1 ? false : true;
            var key = filterValue[0];

            if (x.myName.matches("PortCode")) {
                return FS.EitherOrFilter("ArrivalLocationCode", "DepartureLocationCode", sValue);
            }
            else if (key === "[") {
                return FS.MultiSelectFilter(x, sValue);
            }
            else if (key === "(" && !bIsRange) {
                return FS.TypeInFilter(x, sValue);
            }
            else if (key === "(" && bIsRange) {
                var range = sValue.split(':');
                var low = range[0] == "" || range[0] == "*" ? -1000000 : parseInt(range[0]);
                var high = range[1] == "" || range[1] == "*" ? 1000000 : parseInt(range[1]);
                if (low > high) {
                    var temp = high;
                    high = low;
                    low = temp;
                }
                return FS.InRangeFilter(x, low, high);
            }
        }));
        return filters;
    }

    function createSortFunction(specArray) {
        if (specArray === undefined || specArray.length === 0)
            return undefined;

        var sorts = FS.MultiSort(specArray.map(function (x) {
            //the filter types are based on how the value is wraped
            var sortValue = x.value;
            var sValue = sortValue.substring(1, sortValue.length - 1);
            return { field: x.name, dir: sValue.matches("Asc") ? 1 : -1 };
        }));
        return sorts;
    }

    var vmSpec = {
        listDefinition: function () {
            var data = CONTROLLER.getData('favorites');
            //var global = data ? data.filter(function (x) { return x.scope == 'global'  }) : data;
            //var favorites = data ? data.filter(function (x) { return x.url !== undefined }).sortOn("title") : data;
            return data;
        },
        metaData: function () {
            var data = CONTROLLER.getData('MetaData');
            return data;
        },
        lookupData: function () {
            var data = GLOBAL;
            return data;
        },
        filterDefinition: function () {
            var filterSpec = this.metaData.FilterDefinition;
            filterSpec = filterSpec.sortOn("title");

            return filterSpec;
        },
        sortDefinition: function () {
            var sortSpec = this.metaData.SortDefinition;
            sortSpec = sortSpec.sortOn("title");

            return sortSpec
        },
        completeQueryString: function() {
            var result = "";
            result += this.listQueryString ? this.listQueryString + "&" : '';
            result += this.filtersQueryString ? this.filtersQueryString + "&" : '';
            result += this.sortsQueryString ? this.sortsQueryString + "&" : '';
            if (result.endsWith('&')) result = result.substring(0, result.length - 1);
            return result;
        },
        listQueryString: function () {
            var key = this.currentList ? this.currentList.list : undefined;
            return key ? "List=" + key : '';
        },
        filtersQueryString: function () {
            var result = StringifyQueryStringArgument(this.FILTER.createSpecArray);
            return result ? "Filter=" + result : '';
        },
        sortsQueryString: function () {
            var result = StringifyQueryStringArgument(this.SORT.createSpecArray);
            return result ? "Sort=" + result : '';
        },        
        getAsFavorite: function () {
            var fav = {};
            if (this.currentList) {
                var title = this.currentList.title;
                var data = CONTROLLER.getData('favorites');
                fav = data.filter(function (item) { return item.title.matches(title); })[0];
            }
            return fav;
        },
        synchronizeFiltersAndSorts: function () {
            this.FILTER.clearAll;
            this.SORT.clearAll;

            this.smashProperty('listQueryString');
            this.smashProperty('filtersQueryString');
            this.smashProperty('sortsQueryString');

            if (this.currentList) {
                var obj = this.currentList.querySpec;
                obj && obj.Filter && this.FILTER.applySettings(obj.Filter);
                obj && obj.Sort && this.SORT.applySettings(obj.Sort);
            }
        },

        currentList: function () {
            var list = this.LIST.lists;
            var found = list.firstWhere(function (item) { return item.isSelected; });
            return found ? found : null;
        },

        filterFunction: function () {
            return createFilterFunction(this.FILTER.createSpecArray);
        },
        sortFunction: function () {
            return createSortFunction(this.SORT.createSpecArray);
        },
        LIST: function(){
            return this.establishSubcomponent("LIST", listSetSpec);
        },
        FILTER: function () {
            return this.establishSubcomponent("FILTER", filterSetSpec);
        },
        SORT: function () {
            return this.establishSubcomponent("SORT", sortSetSpec);
        },
    }

    var listSpec = {
        isSelected: false,
        name: function () {
            return this.title
        },
        displayName: function () {
            //return this.title + "\n" + this.list + ' - ' + this.title;
            return this.title;
        },
        url: '',
        querySpec: function () {
            var routing = this.url ? this.url.split('?') : [];
            return fo.utils.queryStringToObject((routing.length > 1 ? routing[1] : "")) || {};
        }
     }

    var listSetSpec = {
        title: "Select a list...",
        uponCreation: function () {
            var defs = this.getProperty('listDefinition', true).getValue();
            return fo.makeCollectionSpec(defs, listSpec);
        },
        lists: function () {
            return this.Subcomponents;
        },
        toggleSelection: function (item) {
            if (item.isSelected) {
                item.isSelected = false;
            }
            else {
                this.clearAll;
                item.isSelected = true;
            }
            this.smashProperty('currentList', true);
            this.getProperty('synchronizeFiltersAndSorts', true).getValue();
        },
        clearAll: function () {
            this.lists.forEach(function (x) { x.getProperty('isSelected').smash(); });
        },
        content: function () {
            var result = "<div data-template='hotlistTemplate' data-context='@'></div>";
            return result;
        },
    }

    var sortSpec = {
        isSelected: false,
        name: function () {
            return this.title
        },
        displayName: function () {
            //return this.list + ' - ' + this.title;
            //return "{1} of {2}: {0}".format(this.displayName, this.sortOrder + 1, this.myParent.selectedSorts.count);
            return "{1} of {2}: {0}".format(this.title, this.sortOrder + 1, this.myParent.selectedSorts.count);
            //return this.title;
        },
        defaultEnabled: false,
        defaultDirection: "ASC",
        sortOrder: 0,
        sortPercent: function() { 
            var count = this.myParent.selectedSorts.count;
            return count <= 1 ? -1 : this.sortOrder / (count - 1);
        },
        isASC: function () {
            return this.defaultDirection.matches("ASC");
        },
        isDEC: function () {
            return this.defaultDirection.matches("DEC");
        },
        canMoveUp: function () {
            return this.sortPercent >= 0 && this.sortPercent !== 0;
        },
        canMoveDown: function () {
            return this.sortPercent >= 0 && this.sortPercent !== 1;
        },
        clearAll: function () {
            this.getProperty('isSelected').smash();
        },
        applySettings: function () {
            return function (userValue) {
                if (userValue.begins('(') && userValue.ends(')')) {
                    var typeIn = userValue.substring(1, userValue.length - 1);
                    this.defaultDirection = typeIn;
                }
            }
        }
    }

    var sortSetSpec = {
        title: "Sort by...",
        uponCreation: function () {
            var defs = this.getProperty('sortDefinition', true).getValue();
            return fo.makeCollectionSpec(defs, sortSpec);
        },
        sorts: function () {
            return this.Subcomponents;
        },
        selectedSorts: function () {
            //get current set without setting up dependency on property 'isSelected'
            var list = this.sorts.copyWhere(function (item) { return item.isSelected });
            var result = fo.makeOrderedCollection(list, this, 'sortOrder');
            return result;
        },
        toggleSelection: function (item) {
            var list = this.selectedSorts;
            item.isSelected = !item.isSelected;
            item.isSelected ? list.addItem(item) : list.removeItem(item);
            this.refresh;
        },
        setAscending: function (item) {
            item.defaultDirection = "ASC";
        },
        setDecending: function (item) {
            item.defaultDirection = "DEC";
        },
        moveUp: function (item) {
            var list = this.selectedSorts;
            list.swapItemTo(item, item.sortOrder - 1);
            this.refresh;
        },
        moveDown: function (item) {
            var list = this.selectedSorts;
            list.swapItemTo(item, item.sortOrder + 1);
            this.refresh;
        },
        refresh: function() {
            this.smashProperty('createSpecArray', true);
        },
        content: function () {
            var result = "<div data-template='sortsTemplate'  data-context='@'></div>";
            return result;
        },
        clearAll: function () {
            this.sorts.forEach(function (item) {
                item.clearAll;
            });
            this.smashProperty('selectedSorts');
        },
        createSpecArray: function() {
            var sortSpec = [];
            this.selectedSorts.forEach(function (item) {
                var property = item.propertyName
                sortSpec.push({ name: property, value: "(" + item.defaultDirection + ")" });
            });
            return sortSpec;
        },
    }
   
    var lookupSpec = {
        Code: '',
        Description: '',
        isSelected: false,
        display: function () {
            return this.Code + ' - ' + this.Description;
        },
        toggleSelection: function () {
            this.isSelected = !this.isSelected;
        },
        name: function () {
            return this.Code;
        }
    };

    var filterSpec = {
        isSelected: false,
        name: function() {
            return this.title
        },
        displayName: function () {
            //return this.list + ' - ' + this.title;
            return this.name;
        },
        filterType: '',
        propertyName: '',
        lower: '',
        upper: '',

        typeInValue: function () {  //collect up all selected options and extract their Code property
            var list = this.Subcomponents.filter(function (item) { return item.isSelected; });
            list = list.map(fo.utils.pluck('Code'));
            var text = list.reduce(function (a, b) { return a += (b + ',') }, '');
            return text;
        },
        lookupTable: function () {
            if (this.lookupName === undefined) return;
            var data = this.getProperty('lookupData',true).getValue().GetLookup(this.lookupName);
            return data;
        },
        isTypeInFilter: function () {
            return this.filterType.matches('TypeInFilter') || this.filterType.matches('PortFilter');
        },
        isMultiSelectFilter: function () {
            return this.filterType.matches('MultiSelectFilter');
        },
        isRangeSelectFilter: function () {
            return this.filterType.matches('RangeFilter');
        },
        reset: function () {
            this.smashProperty('typeInValue');
        },
        clearAll: function () {
            this.smashProperty('isSelected');
            this.smashProperty('lower');
            this.smashProperty('upper');
            this.Subcomponents.forEach(function (item) {
                item.smashProperty('isSelected');
            });

            this.smashProperty('typeInValue');
        },
        applySettings: function () {
            return function (userValue) {
                var parts = this.Subcomponents;
                if (userValue.begins('[') && userValue.ends(']') && userValue.contains(':')) {
                    var list = userValue.substring(1, userValue.length - 1).split(':');
                    lower = list[0];
                    upper = list[1];
                }
                else if (userValue.begins('[') && userValue.ends(']')) {
                    var typeIn = userValue.substring(1, userValue.length - 1);
                    this.typeInValue = typeIn;  //this value will smash if the FindByName can work
                    var list = typeIn.split(',');
                    list.forEach(function (item) {
                        var found = parts.findByName(item);
                        if (found) found.isSelected = true;
                    });
                }
                else if (userValue.begins('(') && userValue.ends(')')) {
                    var typeIn = userValue.substring(1, userValue.length - 1);
                    this.typeInValue = typeIn;
                }
            }
        }
    }

    var filterSetSpec = {
        title: "Filter by...",
        uponCreation: function () {
            var defs = this.getProperty('filterDefinition', true).getValue();
            return fo.makeCollectionSpec(defs, filterSpec, function (filterItem) {
                var list = fo.utils.objectToArray(filterItem.lookupTable);
                if (!list) return;
                var builder = fo.makeCollectionSpec(list, lookupSpec, function (item) {
                    item.getProperty('isSelected').onValueSet = function (newValue) {
                        this.smashProperty('typeInValue', true);
                    }
                });
                builder.createSubcomponents(filterItem);
            });
        },
        filters: function () {
            return this.Subcomponents;
        },
        selectedFilters: function () {
            var list = this.filters.copyWhere(function (item) { return item.isSelected });
            return list;
        },

        toggleSelection: function (item) {
            item.isSelected = !item.isSelected;
            this.refresh;
        },
        refresh: function () {
            this.smashProperty('createSpecArray', true);
        },
        content: function () {
            var result = "<div data-template='filtersTemplate'  data-context='@'></div>";
            return result;
        },
        clearAll: function(){
            this.Subcomponents.forEach(function (item) {
                item.clearAll;
            });
        },
        createSpecArray: function () {
            var filterSpec = [];

            this.selectedFilters.forEach(function (item) {
                var property = item.propertyName

                if (item.typeInValue) {
                    filterSpec = filterSpec ? filterSpec : {};
                    if (item.isMultiSelectFilter) {
                        filterSpec.push( { name: property, value : "[" + item.typeInValue + "]" });
                    }
                    else if (item.isTypeInFilter) {
                        filterSpec.push({ name: property, value: "(" + item.typeInValue + ")" });
                    }
                    else if (item.isRangeFilter) {
                        filterSpec.push({ name: property, value: "[" + item.lower + ":" + item.upper + "]" });
                    }
                }

            });
            return filterSpec;
        }
    }

    ns.validateMetaData = function(targetListData){
        var result = fo.makeComponent(vmSpec);
        var meta = JSON.stringify(result.metaData, undefined, 3);
        //var target = JSON.stringify(targetData, undefined, 3);
        //return "<pre>{0}</pre>".format(target);
        //return "<pre>{0}</pre>".format(meta);

        var report = {};
        report.filters = {};
        report.sorts = {};

        targetListData.map(function (target) {

            result.filterDefinition.map(function (item) {
                var prop = item.propertyName;
                if (target[prop] !== undefined) {
                    report.filters[prop] = 'Is valid';
                }
                else if (report.filters[prop] === undefined) {
                    report.filters[prop] = 'NOT FOUND';
                }
            });

            result.sortDefinition.map(function (item) {
                var prop = item.propertyName;
                if (target[prop] !== undefined) {
                    report.sorts[prop] = 'Is valid';
                }
                else if (report.sorts[prop] === undefined) {
                    report.sorts[prop] = 'NOT FOUND';
                }
            });

        });

        return "<pre>{0}</pre>".format(JSON.stringify(report, undefined, 3));

    }

    ns.makeListFilterSortVM = function (spec, args, queryString) {

        var newSpec = fo.utils.extend(vmSpec, spec);
        var result = fo.makeComponent(newSpec);

        var listView = result.LIST;
        listView.afterCreate = function (root) {
            fo.bindTo(listView, root);
            //fo.trace.log(root.innerHTML);
        }
        listView.beforeDestroy = function (root) {
        }


        var filterView = result.FILTER;
        filterView.afterCreate = function (root) {
            fo.bindTo(filterView, root);
            //fo.trace.log(root.innerHTML);
        }
        filterView.beforeDestroy = function (root) {
        }
        filterView.applySettings = function (filter) {
            if (filter) {
                var plan = QueryStringArgumentToObject(filter);
                fo.utils.forEachValue(plan, function (key, value) {
                    var found = filterView.Subcomponents.firstWhere(function (p) { return p.propertyName && p.propertyName.matches(key) });
                    if (found) {
                        found.isSelected = true;
                        found.applySettings(value);
                    }
                });
            }
        }

        var sortView = result.SORT;
        sortView.afterCreate = function (root) {
            fo.bindTo(sortView, root);
            //fo.trace.log(root.innerHTML);
        }
        sortView.beforeDestroy = function (root) {
        }
        sortView.applySettings = function (sort) {
            if (sort) {
                var plan = QueryStringArgumentToObject(sort);
                var selected = this.selectedSorts;
                fo.utils.forEachValue(plan, function (key, value) {
                    var found = sortView.Subcomponents.firstWhere(function (p) { return p.propertyName && p.propertyName.matches(key) });
                    if (found) {
                        found.isSelected = true;
                        selected.addItem(found);
                        found.applySettings(value);
                    }
                });
            }
        }

        if (queryString) ns.applyQueryString(result, args, queryString);
        return result;
    }


    ns.applyQueryString = function (result, args, queryString) {
        var keystring = queryString;
        if (keystring && keystring.endsWith('&')) {
            keystring = keystring.substring(0, keystring.length - 1);
        }


        var listView = result.LIST;
        listView.clearAll;

        //can you set the right list if you do not know the title of the list
        //the code is not enough

        function matchesQueryString(item) {
            var routing = item.url.split('?');

            if (routing.length > 1 && queryString)
            {
                var result = routing[1].matches(queryString);
                if (!result) result = routing[1].matches(keystring);
                return result;
            }
            return false;
        }

        if (args.List) {
            var found = listView.Subcomponents.firstWhere(matchesQueryString);
            if (found) {
                found.isSelected = true;
                found.list = args.List;
            }
            else {
                result.listKey = args.List;
            }
        }
        else {
            result.listKey = undefined;
        }

        result.synchronizeFiltersAndSorts;

        return result;
    }

}(viewModels));
