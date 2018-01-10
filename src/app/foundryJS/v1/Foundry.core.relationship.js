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
    var Relationship = function (init, parent, indexName) {
        this.base = ns.Collection;

        var list = ns.utils.isaCollection(init) ? init.elements : init;
        this.base(list, parent);

        return this;
    }

    //http://trephine.org/t/index.php?title=JavaScript_prototype_inheritance
    Relationship.prototype = (function () {
        var Anonymous = function () { this.constructor = Relationship; };
        Anonymous.prototype = ns.Collection.prototype;
        return new Anonymous();
    })();


    ns.Relationship = Relationship;

    ns.makeRelationship = function (init, parent, spec) {
        return new ns.Relationship(init, parent, spec);
    };

    // you need to make this observable and dynamic, then does that
    ns.Component.prototype.establishRelationship = function (name, init, spec) {
        var relationship = this[name];
        if (!ns.utils.isaRelationship(relationship)) {
            relationship = ns.makeRelationship(init, this, spec); //this is observable
            relationship.withDependencies = this.withDependencies;
            relationship.myName = name;
            this[name] = relationship;
        };
        return relationship;
    };

    //collections can also have relationships
    ns.Collection.prototype.establishRelationship = function (name, init, spec) {
        var relationship = this[name];
        if (!ns.utils.isaRelationship(relationship)) {
            relationship = ns.makeRelationship(init, this, spec); //this is observable
            relationship.withDependencies = this.withDependencies;
            relationship.myName = name;
            this[name] = relationship;
        };
        return relationship;
    };

    ns.makeRelation = function (source, target, inverse) {
        if (!source || !target) return;

        var spec = this;
        var relation = source.establishRelationship(spec.myName);
        relation.addNoDupe(target);
        return relation;
    };

    ns.unMakeRelation = function (source, target, inverse) {
        if (!source || !target) return;

        var spec = this;
        if (!source[spec.myName]) return;

        var relation = source.establishRelationship(spec.myName);
        relation.remove(target);
        if (relation.isEmpty()) {
            delete source[spec.myName];
        }
        return relation;
    };




}(Foundry));