/*
    Foundry.trace.js part of the FoundryJS project
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


(function (ns, undefined) {

    ns.dom = {
        ul: function (text, id) {
            return (id == undefined) ? "<ul>" + text + "</ul>" : "<ul id='" + id + "'>" + text + "</ul>"
        },
        li: function (text, id) {
            return (id == undefined) ? "<li>" + text + "</li>" : "<li id='" + id + "'>" + text + "</li>"
        },
        p: function (text, id) {
            return (id == undefined) ? "<p>" + text + "</p>" : "<p id='" + id + "'>" + text + "</p>"
        },
        span: function (text, id) {
            return (id == undefined) ? "<span>" + text + "</span>" : "<span id='" + id + "'>" + text + "</span>"
        },
        div: function (text, id) {
            return (id == undefined) ? "<div>" + text + "</div>" : "<div id='" + id + "'>" + text + "</div>"
        },
        pre: function (text, id) {
            return (id == undefined) ? "<pre>" + text + "</pre>" : "<pre id='" + id + "'>" + text + "</pre>"
        },
        w: function (text, id) {
            return (id == undefined) ? "<div>" + text + "<br/></div>" : "<div id='" + id + "'>" + text + "<br/></div>"
        },
    };


    function toText(arg) {
        return arg ? String(arg) : '';
    }

    ns.trace = {};
    ns.traceEnabled = false;
    ns.traceTarget = undefined;


    function targetElement(target) {
        if ( target) return target;
        if (  ns.traceTarget) return  ns.traceTarget;

        var debug = document.getElementById("debug");
       return debug || document.body;
    }

    var trace = {
        clr: function () {
            if (window.console && window.console.clear) {
                window.console.clear();
            }
        },
        exception: function (message, e) {
            if (window.console && window.console.log) {
                window.console.log(message);
            }
        },
        log: function (message) {
            if (window.console && window.console.log) {
                window.console.log(message);
            }
        },
        assert: function (falsey, message) {
            if (ns.traceEnabled && window.console && window.console.assert) {
                window.console.assert(falsey, message);
            }
        },
        error: function (message) {
            if (ns.traceEnabled && window.console && window.console.error) {
                window.console.error(message);
            }
        },
        warn: function (message) {
            if (ns.traceEnabled && window.console && window.console.warn) {
                window.console.warn(message);
            }
        },
        info: function (message) {
            if (ns.traceEnabled && window.console && window.console.info) {
                window.console.info(message);
            }
        },
        dir: function (obj) {
            if (ns.traceEnabled && window.console && window.console.dir) {
                try {
                    window.console.dir(obj);
                }
                catch(ex) {
                    window.console.dir(ex);
                }
            }
        },
        //Sends a message if expression evaluates to false
        assert: function (expression, message) {
            if (ns.traceEnabled && window.console && window.console.assert) {
                window.console.assert(expression, message);
            }
        },


        funcTrace: function (callingArgs, name) {
            var fun = name ? name + "()" : callingArgs.callee.caller.toString().split(')')[0] + ")";
            fun += " -> ";

            for (var i = 0; i < callingArgs.length; i++) {
                var item = callingArgs[i];
                if (typeof item === 'function') {
                    fun += ' ' + item.toString().split('(')[0] + ', ';
                }
                else {
                    fun += ' ' + item + ', ';
                }
            }
            ns.trace.log(fun);
        },

        alert: function (text) {
            window.alert && window.alert(text);
        },

        writeLog: function (text) {
            var fun = text + " -> ";
            for (var i = 1; i < arguments.length; i++) {
                var item = arguments[i];
                if (typeof item === 'function') {
                    fun += ' ' + item.toString().split('(')[0] + ', ';
                }
                else {
                    fun += ' ' + item + ', ';
                }
            }

            ns.trace.log(fun);
        },
        p: function (text, target) {
            var oDiv = document.createElement("div");
            oDiv.innerHTML = "<p>" + toText(text) + "</p>";
            oDiv.style.color = '#0000FF';
            oDiv.setAttribute("class", "foundry-trace");
            var site = targetElement(target);
            site.appendChild(oDiv);
            return oDiv;
        },

        br: function (target) {
            var oDiv = document.createElement("div");
            oDiv.innerHTML = "<br/>";
            oDiv.style.color = '#0000FF';
            oDiv.setAttribute("class", "foundry-trace");
            var site = targetElement(target);
            site.appendChild(oDiv);
            return oDiv;
        },

        pre: function (text, target) {
            var oDiv = document.createElement("div");
            oDiv.innerHTML = "<pre>" + toText(text) + "</pre>";
            oDiv.style.color = '#0000FF';
            oDiv.setAttribute("class", "foundry-trace");
            var site = targetElement(target);
            site.appendChild(oDiv);
            return oDiv;
        },

        w: function (text, target) {
            var oDiv = document.createElement("div");
            oDiv.innerHTML = toText(text) + "<br />";
            oDiv.style.color = '#0000FF';
            oDiv.setAttribute("class", "foundry-trace");
            var site = targetElement(target);
            site.appendChild(oDiv);
            return oDiv;
        },

        clear: function (target) {
            var site = targetElement(target);
            site.innerHTML = "";
            this.clr();
            return true;
        },

        timerStart: function (text) {
            var div = this.w("start :" + toText(text)).style;
            div.backgroundColor = '#000000';
            div.color = '#FFFFFF';
            return { time: Date.now(), text: text };
        },

        timerReport: function (timer, text) {
            var dif = (Date.now() - timer.time) / 1000;
            var div = this.w("report:" + timer.text + " (" + dif + " sec) " + ((text == undefined) ? "" : text)).style;
            div.backgroundColor = '#000000';
            div.color = '#FFFFFF';
            return { time: Date.now(), text: text || timer.text };
        },

        reportValueChange: function (prop) {
            var ref = prop.asReference();
            if (prop.initValueComputed) {
                return this.w("change: " + ref + " is changed to formula: " + prop.init.toString());
            }
            else {
                var json = "<pre>" + prop.owner.stringify(prop) + "</pre>";
                return this.w("change: " + ref + " is changed to: " + json);
            }
        },

        reportValueSmash: function (prop) {
            var name = prop.asReference();
            var state = prop.formula === undefined ? "V: " + prop.value : "F: " + prop.formula.toString();
            return this.w("smash: " + name + " status: " + prop.status + " " + state);
        },

        varifyValue: function (oTarget, Name, result, site) {
            if (oTarget[Name] === result) {
                this.w("CORRECT! The value of " + Name + " == " + result, site).style.color = '#00FF00';
            }
            else {
                this.w("ERROR    The value of " + Name + "(" + oTarget[Name] + ") != " + result, site).style.color = '#FF0000';
            }
        },

        reportValue: function (oTarget, Name, site) {
            this.w("The value of Property: " + Name + " is " + oTarget[Name], site);
            if (oTarget[Name] instanceof ns.Collection) {
                var array = oTarget[Name].elements;
                for (var i = 0; i < array.length; i++) {
                    this.w("[" + i + "] is " + array[i], site);
                }
            }
        },

        reportProperties: function (oTarget, site) {
            var sKeys = Object.keys(oTarget);
            for (var i = 0; i < sKeys.length; i++) {
                var key = sKeys[i];
                if ('_' === key[0]) this.reportValue(oTarget, key.substring(1), site);
            }
        },

        reportPropertyState: function (oTarget, privateName, site) {
            var property = oTarget[privateName];
            var name = property.asReference();
            var state = property.formula === undefined ? "V:" + property.value : "F:" + property.formula.toString();
            state = property.status !== undefined ? "Value=|" + property.value + "|" : state;
            this.w("Property: " + name + " status: " + property.status + " " + state, site);
        },

        reportState: function (oTarget, site) {
            var sKeys = Object.keys(oTarget);
            for (var i = 0; i < sKeys.length; i++) {
                var key = sKeys[i];
                if ('_' === key[0]) this.reportPropertyState(oTarget, key, site);
            }
        },

        reportDependencyState: function (oTarget, privateName, site) {
            var that = this;

            function refAndStat(prop) {
                var val = !ns.utils.isArray(prop.value) ? prop.value : "array[" + prop.value.length + "]total";
                return "|{0} s: {1} v: {2}| ".format(prop.asReference(), prop.status, val);
            };

            var property = oTarget[privateName];
            var dependsOn = property.thisValueDependsOn

            if (dependsOn && dependsOn[0]) {
                dependsOn.forEach(function (item) {
                    that.w(refAndStat(property) + " Depends on " + refAndStat(item));
                });
            }
            else {
                that.w(refAndStat(property) + " Depends on NOTHING ");
            };

            var informsThese = property.thisInformsTheseValues
            if (informsThese && informsThese[0]) {
                informsThese.forEach(function (item) {
                    that.w(refAndStat(property) + " Informs " + refAndStat(item));
                });
            }
            else {
                that.w(refAndStat(property) + " Informs NOTHING ");
            };
        },

        reportDependencyNetwork: function (oTarget, site) {
            var sKeys = Object.keys(oTarget);
            for (var i = 0; i < sKeys.length; i++) {
                var key = sKeys[i];
                if ('_' === key[0]) this.reportDependencyState(oTarget, key, site);
            }
        },

        inspectProperty: function (oTarget, privateName, site) {
            var property = oTarget[privateName];
            //if (ns.utils.isaCollection(property.value) && property.value.count == 0) return;

            this.w("Property: " + property.asReference(), site);
            this.pre(property.stringify(), site);
        },

        inspect: function (oTarget, site) {
            var sKeys = Object.keys(oTarget);
            for (var i = 0; i < sKeys.length; i++) {
                var key = sKeys[i];
                if ('_' === key[0]) this.inspectProperty(oTarget, key, site);
            }
            this.dir(oTarget);
        },




        reportStructure: function (obj, displayFn, target) {
            if (displayFn === undefined) {
                displayFn = function (item) {
                    return item.toString();
                }
            }

            function renderNode(node) {

                var display = displayFn(node);
                var html = ns.dom.div(display); //+ ":- <span data-bind='innerText: ScoreText' />");

                var result = ns.dom.li(html, node.getID());

                if (node.Subcomponents.isNotEmpty()) {
                    //using map reduce syntax.... makes recursion way too easy
                    result = node.Subcomponents.mapReduce(
                         //function (x) { return ns.dom.li(ns.dom.ul(renderNode(x))); },
                        function (x) { return ns.dom.ul(renderNode(x)); },
                        function (a, b) { return a += b; },
                        result);
                }

                return result;
            };

            var html = renderNode(obj);

            var debug = document.getElementById("debug");
            var site = target || debug || document.body;
            var rootElement = document.createElement("div");

            site.appendChild(rootElement);

            rootElement.innerHTML = html;

        },
    }

    var keys = Object.keys(trace);

    ns.traceOn = function (target) {
        ns.traceTarget = target;
        ns.traceEnabled = true;
        keys.forEach(function (key) {
            ns.trace[key] = trace[key];
        });
    }

    ns.traceOff = function (target) {
        ns.traceTarget = target;
        ns.traceEnabled = false;
        function NoOp() { };
        keys.forEach(function (key) {
            ns.trace[key] = NoOp;
        });
    }

    ns.traceOff();
    


}(Foundry));








