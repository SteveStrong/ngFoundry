/*
    Foundry.decision.js part of the FoundryJS project
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
/// <reference path="Foundry.decision.js" />


var Foundry = Foundry || {};

(function (ns,undefined) {

    var DecisionComponent = function (properties, subcomponents, parent) {

        var decisionSpec = {
            isStipulated: false,
            customName: function () { return this.myName; },
            nodeDepth: function () {
                if (this.myParent === undefined) return 0;
                return this.myParent.nodeDepth + 1;
            },
            importance: function () {
                if (this.Subcomponents.isEmpty()) return 5;
                var list = this.selectComponents(function (x) { return x.nodeDepth == 2; });
                var totalImportance = list.mapReduce(function (x) { return x.importance }, function (a, b) { return a += b; }, 0);
                return totalImportance;
            },
            decisionValue: function () {
                if (this.Subcomponents.isEmpty()) return 0;
                //convert the score to a decision value -2 to +2
                
                var score = this.score - 3;
                //now round it? but how up or down
                score =  score.toFixed(0);
                return score;
            },
            rating: function () {
                return this.IsStipulated ? 2 * (this.decision + 3) : 2 * (this.score + 3); //now round this What else could you do?
            },
            scoreText: function () {
                var score = undefined;
                if (this.isStipulated || this.Subcomponents.isEmpty()) {
                    score = this.decisionValue;
                }
                else {
                    score = this.score;
                }

                if (score == undefined) return "...";
                //12.345.toFixed(2); // returns "12.35" (rounding!)

                score = (score + 3).toFixed(2);
                return "  current score " + score + " out of 5.0";
            },
            weight: function () {
                var result = 0;
                if (this.myParent) {
                    result = this.importance / this.myParent.importance;
                }
                return result;
            },
            score: function () {
                if (this.isStipulated || this.Subcomponents.isEmpty()) {
                    return this.decisionValue;
                }

                //var root = this.myName;

                //alert(" Update score on " + root);

                var score = 0.0;
                if (this.importance == 0) {
                    return score;
                }


                var list = this.selectComponents(function (x) { return x.nodeDepth == 2; });

                //maybe add a map reduce ?  count should create a dependency automatically THIS IS GOOD
                for (var i = 0; i < list.count; i++) {
                    var item = list.item(i);
                    //var source = item.myName;
                    var weight = item.weight;
                    score += item.decisionValue * weight;
                }

                //var oDependentValue = globalComputing.peek();
                //oDependentValue.addDependency(this["_Importance"]);

                return score;
            },
        };

        this.base = ns.Component;
        this.base(ns.utils.mixin(decisionSpec, properties), subcomponents, parent);
        return this;
    }

    //http://trephine.org/t/index.php?title=JavaScript_prototype_inheritance
    DecisionComponent.prototype = (function () {
        var Anonymous = function () { this.constructor = DecisionComponent; };
        Anonymous.prototype = ns.Component.prototype;
        return new Anonymous();
    })();



    ns.utils.isaDecisionComponent = function (obj) {
        return obj instanceof DecisionComponent ? true : false;
    };


    //override establishSubcomponent
    DecisionComponent.prototype.establishSubcomponent = function (name, properties) {
        var parent = this;
        var found = parent.getSubcomponent(name);
        if (!found) {
            var component = new DecisionComponent(properties, undefined, parent);
            if (!component.myName) component.myName = name;
            component.withDependencies = parent.withDependencies;

            found = parent.Subcomponents.addNoDupe(component);
        }
        return found;
    };

    ns.makeDecisionComponent = function (properties, subcomponents, parent) {
        return new DecisionComponent(properties, subcomponents, parent);
    };

}(Foundry));
