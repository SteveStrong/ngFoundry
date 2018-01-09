/*
    Foundry.rules.factoryfliter.js part of the FoundryJS project
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
/// <reference path="Foundry.trace.js" />
/// <reference path="Foundry.js" />


var Foundry = Foundry || {};
Foundry.factory = Foundry.factory || {};
Foundry.filtering = Foundry.filtering || {};

(function (ns, utils, fa, fi, undefined) {

    var _filterFunc = {};
    ns.setGlobalFilter = function (specId, filterFunc) {
        if (!ns.isValidNamespaceKey(specId)) return false;

        _filterFunc[specId] = filterFunc;
        return true;
    }

    ns.getGlobalFilter = function (specId) {
        if (!ns.isValidNamespaceKey(specId)) return false;

        var idFunc = function (o, i, a) { return true; }
        return _filterFunc[specId] ? _filterFunc[specId] : idFunc;
    }

    ns.filterDictionary = function (specId, filterSpec) {
        var results = [];
        var found = ns.getEntityDictionaryLookup(specId);
        if (!found) return results;

        var filterFn = fi.makeFilter(filterSpec);
        if (!filterFn) return results;

        utils.loopForEachValue(found, function (key, value) {
            if (filterFn(value)) {
                results.push(value);
            }
        });

        return results;
    }

    ns.sortDictionary = function (specId, sortSpec) {
        var results = [];
        var found = ns.getEntityDictionaryLookup(specId);
        if (!found) return results;

        var sortFn = fi.makeSort(sortSpec);
        if (!sortFn) return results;

        utils.loopForEachValue(found, function (key, value) {
            results.push(value);
        });
        var sortedList = sortSpec ? results.sort(sortFn) : results;
        return sortedList;
    }

    ns.filterAndSortDictionary = function (specId, filterSpec, sortSpec) {
        var results = [];
        var found = ns.getEntityDictionaryLookup(specId);
        if (!found) return results;

        var filterFn = fi.makeFilter(filterSpec);
        var sortFn = fi.makeSort(sortSpec);

        utils.loopForEachValue(found, function (key, value) {
            if (filterSpec && filterFn(value)) {
                results.push(value);
            }
        });

        var sortedList = sortSpec ? results.sort(sortFn) : results;
        return sortedList;
    }

 
}(Foundry, Foundry.utils, Foundry.factory, Foundry.filtering));
