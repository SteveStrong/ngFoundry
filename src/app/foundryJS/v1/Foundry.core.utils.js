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

    ns.lastGUID = 0;
    ns.newGuid = function () {
        ns.lastGUID += 1;
        return ns.lastGUID;
    }


    //http://jsperf.com/split-and-join-vs-replace2
    //http://mattsnider.com/parsing-javascript-function-argument-names/

    ns.utils = {
        replaceAll: function (x, y) {
            return this.split(x).join(y);
        },
        createID: function (name) {
            var guid = ns.newGuid();
            if (name) {
                guid = new String(name).replace(/ /g, '_') + '_' + guid;
            }
            return guid;
        },
        //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        generateUUID: function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        },
        removeCRLF: function (text) {
            return text.replace(/(\r\n|\n|\r)/gm, ' ');
        },
        removeExtraSpaces: function (text) {
            return text.replace(/\s{2,}/g, ' ');
        },
        removeJSComments: function (text) {
            return text.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');//http://james.padolsey.com/javascript/removing-comments-in-javascript/
        },
        cleanFormulaText: function (formula) {
            var text = formula.toString();
            return ns.utils.removeExtraSpaces(ns.utils.removeCRLF(ns.utils.removeJSComments(text)));
        },
        cleanTemplateHtml: function (html) {
            var text = html;
            return ns.utils.removeCRLF(html);
        },
        capitaliseFirstLetter: function (name) {
            var string = ns.utils.asString(name);
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        asString: function (obj) {
            return obj === undefined ? "" : obj.toString();
        },
        asInt: function (value, defaultValue) {
            var otherwise = defaultValue ? defaultValue : 0;
            var result = parseInt(value);
            return isNaN(result) ? otherwise : result;
        },
        isArray: function (obj) {
            if (Array.isArray) return Array.isArray(obj);
            return (Object.prototype.toString.call(obj) === '[object Array]') ? true : false;
        },
        isFunction: function (obj) {
            return typeof obj === 'function';
        },
        isString: function (obj) {
            return typeof obj === 'string';
        },
        isNumber: function (obj) {
            return typeof obj === 'number';
        },
        isObject: function (obj) {
            return obj && typeof obj === 'object'; //prevents typeOf null === 'object'
        },
        asArray: function (obj) {
            if (ns.utils.isaCollection(obj)) return obj.elements;
            return ns.utils.isArray(obj) ? obj : obj === undefined ? [] : [obj];
        },
        objectToArray: function (obj, func) {
            if (ns.utils.isaCollection(obj)) return obj.elements;
            if (ns.utils.isArray(obj)) return obj;

            if (ns.utils.isObject(obj)) {
                var array = [];
                var keys = obj ? Object.keys(obj) : [];
                keys.forEach(function (key) {
                    var value = func ? func(obj[key]) : obj[key];
                    value && array.push(value);
                });
                return array;
            };
            return obj ? [obj] : undefined;
        },
        removeDuplicates: function (origArr) {
            var newArr = [];
            var origLenth = origArr.length;

            for (var x = 0; x < origLenth; x++) {
                var found = undefined;
                for (var y = 0; y < newArr.length; y++) {
                    if (origArr[x] === newArr[y]) {
                        found = true;
                        break;
                    }
                }
                if (!found) newArr.push(origArr[x]);
            }
            return newArr;
        },
        getParamNames: function (fn) {
            var funStr = fn.toString();
            return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
        },
        hasAspect: function (obj, key) {
            return obj && (obj[key] || obj[key.toLowerCase()]);
        },
        getAspectOrDefault: function (obj, key) {
            if (obj[key]) return obj[key];
            if (obj[key.toLowerCase()]) return obj[key.toLowerCase()];
            return obj;
        },
        extractSlots: function (obj, predicate) {
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var init = obj[key];
                    if (predicate(init)) {
                        result[key] = init;
                    }
                }
            }
            return result;
        },
        isSelf: function (ref) {
            return ref.matches('@') || ref.matches('this') || ref.matches('self')
        },
        isaCollection: function (obj) {
            return obj instanceof ns.Collection ? true : false;
        },
        asCollection: function (obj, parent) {
            return ns.utils.isaCollection(obj) ? obj : new ns.Collection(ns.utils.asArray(obj), parent);
        },
        isaComponent: function (obj) {
            return obj instanceof ns.Component ? true : false;
        },
        isaRelationship: function (obj) {
            return obj instanceof ns.Relationship ? true : false;
        },
        isaProperty: function (obj) {
            return obj instanceof ns.Property ? true : false;
        },
        isManaged: function (obj) {
            return this.isaComponent(obj) || this.isaCollection(obj) || this.isaProperty(obj);
        },
        isArrayOrCollection: function (obj) {
            return this.isArray(obj) || this.isaCollection(obj);
        },
        isaPromise: function (obj) {
            return obj instanceof ns.Promise ? true : false;
        },
        forEachValue: function (obj, mapFunc) {  //funct has 2 args.. key,value
            var list = [];
            var keys = obj ? Object.keys(obj) : [];
            keys.forEach(function (key) {
                var value = obj[key];
                var result = mapFunc(key, value);
                if (result) list.push(result);
            });
            return list;
        },
        loopForEachValue: function(obj, mapFunc) {  //funct has 2 args.. key,value
            var keys = obj ? Object.keys(obj) : [];
            keys.forEach(function (key) {
                var value = obj[key];
                mapFunc(key, value);
            });
        },
        findKeyForValue: function (obj, key) {
            for (var name in obj) {
                if (obj[name].matches(key)) return name;
            }
        },
        // can be used like: persons.filter(propEq("firstName", "John"))
        propEq: function (propertyName, value) {
            return function (obj) {
                return obj[propertyName] === value;
            };
        },
        debounce: function (func, threshold, execAsap) {
            return func.debounce(threshold, execAsap);
        },
        // can be used like persons.map(pluck("firstName"))
        pluck: function (propertyName) {
            return function (obj) {
                return obj[propertyName];
            };
        },
        getNamespace: function(obj){
            var myNamespace = obj.myType.split('::');
            myNamespace = myNamespace[0];
            return myNamespace;
        },
        getType: function (obj) {
            var myType = obj.myType.split('::');
            myType = myType.length == 2 ? myType[1] : myType[0];
            return myType;
        },
        isComment: function (str) {
            return str.startsWith('//');
        },
        comment: function (str) {
            if (ns.utils.isComment(str)) return str;
            return '//' + str;
        },

        unComment: function (str) {
            if (!ns.utils.isComment(str)) return str;
            return str.substring(2);
        },
        bindingStringToObject: function (sQuery) {
            var result = undefined;
            if (sQuery) {
                var array = sQuery.split(',');
                for (var i = 0; i < array.length; i++) {
                    var oItem = array[i];
                    var oKVpair = oItem.split(':');
                    if (oKVpair.length == 1) continue;
                    result = result || {};
                    var key = decodeURI(oKVpair[1].trim());
                    var value = decodeURI(oKVpair[0].trim());
                    result[key] = value;
                }
            }

            return result;
        },

        stylingStringToObject: function (sQuery) {
            var result = undefined;
            if (sQuery) {
                var array = sQuery.split(',');
                for (var i = 0; i < array.length; i++) {
                    var oItem = array[i];
                    var oKVpair = oItem.split(':');
                    if (oKVpair.length == 1) continue;
                    result = result || {};
                    var key = decodeURI(oKVpair[0].trim());
                    var value = decodeURI(oKVpair[1].trim());
                    result[key] = value;
                }
            }
            return result;
        },
        //return a dictionary of args
        queryStringToObject: function (sQuery, splitAt) {
            var result = undefined;
            if (sQuery) {
                var splitter = splitAt === undefined ? '&' : splitAt;
                var array = sQuery.split(splitter);
                for (var i = 0; i < array.length; i++) {
                    var oItem = array[i];
                    if (oItem) {
                        var oKVpair = oItem.split('=');
                        if (oKVpair.length == 1) continue;
                        result = result || {};
                        var key = decodeURI(oKVpair[0].trim());
                        var value = decodeURI(oKVpair[1].trim());
                        result[key] = value;
                    }
                }
            }
            return result;
        },
        windowUrlObject: function (url) {
            var href = url ? url : window.location.href;
            var routing = href.split('?');
            var params = ns.utils.queryStringToObject(routing.length > 1 ? routing[1] : "") || {};
            return params;
        },
        //return an array for route matching
        hashStringToArray: function (sQuery, splitAt) {
            var result = undefined;
            if (sQuery) {
                var splitter = splitAt === undefined ? '#' : splitAt;
                var array = sQuery.split(splitter);
                for (var i = 0; i < array.length; i++) {
                    var oItem = array[i];
                    if (oItem) {
                        result = oItem.split('/').map(function (item) {
                            return decodeURI(item.trim());
                        });
                    }
                }
            }

            return result;
        },

        objectToQueryString: function (obj, start) {
            var result = "";
            if (obj) {
                var keys = Object.keys(obj);
                if (keys.length > 0) {
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (obj[key] === undefined) continue;
                        result += "&" + key + "=" + obj[key];
                    }
                    if (start) {
                        result = "?" + result.substring(1);
                    }
                }
            }
            return result;
        },
        clone: function (obj) {
            //http://www.xenoveritas.org/comment/1688#comment-1688
            //nowadays you can clone objects with
            //CLONEDOLLY = JSON.parse(JSON.stringify(DOLLY));
            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            // Handle Date
            if (obj instanceof Date) {
                var copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
            // Handle Array
            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = ns.utils.clone(obj[i]);
                }
                return copy;
            }
            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = ns.utils.clone(obj[attr]);
                }
                return copy;
            }
            throw new Error("Unable to copy obj! Its type isn't supported.");
        },
        getOwnPropertyValues: function (source) {
            var result = [];
            for (var name in source) {
                if (this.hasOwnProperty.call(source, name)) {
                    result.push(source[name]);
                }
            }
            return result;
        },
        makeComputedValue: function (obj, key, init) {
            var initValueComputed = ns.utils.isFunction(init);
            Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    if (!initValueComputed) return init;
                    var result = init.call(obj, obj);
                    return result;
                },
            });
            return obj;
        },
        extendWithComputedValues: function (obj, spec) {
            //let make some custom getters...
            if (obj && spec) {
                for (var key in spec) {
                    if (this.hasOwnProperty.call(spec, key)) {
                        ns.utils.makeComputedValue(obj, key, spec[key]);
                    }
                }
            }
            return obj;
        },
        extend: function (target, source) {
            if (!source) return target;
            for (var name in source) {
                if (this.hasOwnProperty.call(source, name)) {
                    target[name] = source[name];
                }
            }
            return target;
        },

        mixExtend: function (target, source) {
            if (!source) return target;
            for (var name in source) {
                if (!this.hasOwnProperty.call(target, name)) {
                    target[name] = source[name];
                }
            }
            return target;
        },


        mixin: function (target, source) {
            if (!source) return target;
            if (!target) return source;
            for (var name in source) {
                target[name] = source[name];
            }
            return target;
        },
        mixout: function (target, source) {
            if (!source) return target;
            if (!target) return source;
            for (var key in source) {
                if (target.hasOwnProperty(key)) {
                    delete target[key];
                }
            }
            return target;
        },
        union: function (target, source) {
            var result = {};
            if (target) {
                for (var name in target) {
                    result[name] = target[name];
                }
            }
            if (source) {
                for (var name in source) {
                    result[name] = source[name];
                }
            }
            return result;
        },
        getEvent: function (e) {
            var event = e || window.event;
            return event;
        },
        getEventSource: function (e) {
            var event = ns.utils.getEvent(e);
            var elm = event.srcElement || event.originalTarget;
            return elm;
        },
        getParentElement: function (element) {
            if (element && element.parentNode) {
                return element.parentNode;
            }
        },
        getParentElementWithClassName: function (element, className) {
            var result = element;
            if (className) {
                while (result && result.className != className && result.parentNode) {
                    result = result.parentNode;
                }
            }
            else if (result) {
                result = result.parentNode;
            }
            return result;
        },
        getParentElementWithAttribute: function (element, attribute) {
            for (var result = element; result && result.hasAttribute && result.hasAttribute(attribute) == false; result = result.parentNode) {
            }
            var success = result && result.hasAttribute && result.hasAttribute(attribute) ? result : undefined;
            return success;
        },
        urlCasheBuster: function (url) {
            if (!url) return;
            var cachebuster = Math.round(new Date().getTime() / 1000);
            var bust = url.indexOf('?') >= 0 ? '&cb=' : '?cb='

            return url + bust + cachebuster;
        },
          //<system.webServer>
          //  <staticContent>
          //    <mimeMap fileExtension=".json" mimeType="application/json" />
          //</staticContent>   
        xmlHttpGet: function (url, onComplete, onFailure) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onload = function () {
                var result = xmlHttp.responseText;
                onComplete && onComplete(result, xmlHttp);
            };
            try {
                xmlHttp.open("GET", url, false);  //this may give chrome some problems
                xmlHttp.send(null);
            }
            catch (ex) {
                onFailure && onFailure(ex, xmlHttp);
            }
        },
        loadTemplate: function (url, onComplete) {
            ns.utils.xmlHttpGet(url, function (text, xhr) {
                if (xhr.status == 200 || xhr.status == 304) {
                    var head = document.getElementsByTagName("head")[0];
                    var script = document.createElement('div');

                    script.innerHTML = text;
                    head.appendChild(script);
                    onComplete && onComplete(script);
                }
            });
        },
        loadAsScript: function (url, onComplete) {
            ns.utils.xmlHttpGet(url, function (text, xhr) {
                if (xhr.status == 200 || xhr.status == 304) {
                    var head = document.getElementsByTagName("head")[0];
                    var script = document.createElement('script');
                    script.innerHTML = text;
                    head.appendChild(script);
                    onComplete && onComplete(script);
                }
            });
        },

        // discover own file name and line number range for filtering stack traces
        captureLine: function() {

            function getFileNameAndLineNumber(stackLine) {
                // Named functions: "at functionName (filename:lineNumber:columnNumber)"
                // In IE10 function name can have spaces ("Anonymous function") O_o
                var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
                if (attempt1) {
                    return [attempt1[1], Number(attempt1[2])];
                }

                // Anonymous functions: "at filename:lineNumber:columnNumber"
                var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
                if (attempt2) {
                    return [attempt2[1], Number(attempt2[2])];
                }

                // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
                var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
                if (attempt3) {
                    return [attempt3[1], Number(attempt3[2])];
                }
            }

            try {
                throw new Error();
            } catch (e) {
                var lines = e.stack.split("\n");
                var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
                var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
                if (!fileNameAndLineNumber) {
                    return;
                }

                var qFileName = fileNameAndLineNumber[0];
                return fileNameAndLineNumber[1];
            }
        }

    }

	
}(Foundry));