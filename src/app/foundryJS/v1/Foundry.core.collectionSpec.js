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

 
    var CollectionSpec = function (specs, baseClass, onCreate) {
        this.elements = specs ? specs : [];
        this.baseSpec = baseClass;
        this.uponCreation = onCreate;
    }

    //Prototype defines functions using JSON syntax
    CollectionSpec.prototype = {
        createCollection: function (parent) {
            var base = this.baseSpec;
            var members = this.elements.map(function (init) {
                var component = init;
                var spec = init.spec ? init.spec : ns.utils.isObject(init) ? init : undefined;;
                var name = init.myName ? init.myName : ns.utils.isString(init) ? init : undefined;

                if (!ns.utils.isaComponent(component)) {
                    component = ns.makeComponent(base ? base : spec, undefined, parent);
                    if (base !== undefined) component.extendWith(spec);
                    if (name) component.myName = name;
                }
                component.myParent = component.myParent ? component.myParent : parent;
                return component;
            });
            var collection = ns.makeCollection(members, parent);
            if (this.uponCreation) collection.forEach(this.uponCreation);
            return collection;
        },
        createSubcomponents: function (parent) {
            var base = this.baseSpec;
            var members = this.elements.map(function (init) {
                var component = init;
                var spec = init.spec ? init.spec : ns.utils.isObject(init) ? init : undefined;;
                var name = init.myName ? init.myName : ns.utils.isString(init) ? init : undefined;

                if (!ns.utils.isaComponent(component)) {
                    component = parent.createSubcomponent(base ? base : spec);
                    if (base !== undefined) component.extendWith(spec);
                    if (name) component.myName = name;
                }
                else {
                    parent.addSubcomponent(component);
                }
                return component;
            });
            if (this.uponCreation) {
                members.forEach(this.uponCreation);
            }
            return members;
        },
    }
    ns.CollectionSpec = CollectionSpec;

    ns.utils.isaCollectionSpec = function (obj) {
        return obj instanceof ns.CollectionSpec ? true : false;
    };

}(Foundry));