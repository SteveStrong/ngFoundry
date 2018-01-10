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

    if (!Array.prototype.every) {
        Array.prototype.every = function (predicate) {
            var t = new Object(this);
            for (var i = 0, len = t.length >>> 0; i < len; i++) {
                if (i in t && !predicate.call(arguments[1], t[i], i, t)) {
                    return false;
                }
            }
            return true;
        };
    }

    if (!Array.prototype.map) {
        Array.prototype.map = function (selector) {
            var results = [], t = new Object(this);
            for (var i = 0, len = t.length >>> 0; i < len; i++) {
                if (i in t) {
                    results.push(selector.call(arguments[1], t[i], i, t));
                }
            }
            return results;
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function (predicate) {
            var results = [], item, t = new Object(this);
            for (var i = 0, len = t.length >>> 0; i < len; i++) {
                item = t[i];
                if (i in t && predicate.call(arguments[1], item, i, t)) {
                    results.push(item);
                }
            }
            return results;
        };
    }

    if (!Array.prototype.firstWhere) {
        Array.prototype.firstWhere = function (whereClause) {
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                var ok = (whereClause == undefined) ? true : whereClause(item);
                if (ok) return item;
            }
        }
    }

    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) == '[object Array]';
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function indexOf(item) {
            var self = new Object(this), length = self.length >>> 0;
            if (!length) {
                return -1;
            }
            var i = 0;
            if (arguments.length > 1) {
                i = arguments[1];
            }
            i = i >= 0 ? i : Math.max(0, length + i);
            for (; i < length; i++) {
                if (i in self && self[i] === item) {
                    return i;
                }
            }
            return -1;
        };
    }

    if (!Array.prototype.insert) {
        Array.prototype.insert = function (index, item) {
            this.splice(index, 0, item);
        };
    }


    if (!Array.prototype.max) {
        Array.prototype.max = function () {
            if (this.length == 0) return undefined;
            var n = Number(this[0]);
            for (var i = 1; i < this.length; i++) { n = Math.max(n, this[i]) };
            return n;
        }
    }

    if (!Array.prototype.min) {
        Array.prototype.min = function () {
            if (this.length == 0) return undefined;
            var n = Number(this[0]);
            for (var i = 1; i < this.length; i++) { n = Math.min(n, this[i]) };
            return n;
        }
    }

    if (!Array.prototype.sortOn) {
        Array.prototype.sortOn = function (field, dec) {
            var dir = dec ? -1 : 1;
            if (field) {
                return this.sort(function (a, b) {
                    return (a[field] < b[field] ? -1 * dir : (a[field] > b[field] ? 1 * dir : 0))
                });
            }
            return this;
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (applyFunc) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                applyFunc(this[i]);
            }
        };
    }

    if (!Array.prototype.indexOfFirst) {
        Array.prototype.indexOfFirst = function (predicate) {
            for (var i = 0, j = this.length; i < j; i++) {
                if (predicate(this[i])) return i;
            }
            return -1;
        }
    }

    if (!Array.prototype.itemByIndex) {
        Array.prototype.itemByIndex = function (index) {
            if (index < 0 || index > this.length) return undefined;
            return this[index];
        }
    }

    if (!Array.prototype.contains) {
        Array.prototype.contains = function (item) {
            for (var i = 0, j = this.length; i < j; i++) {
                if (this[i] == item) return true;
            }
        }
    }


    if (!Array.prototype.distinctItems) {
        Array.prototype.distinctItems = function () {
            var result = [];
            for (var i = 0, j = this.length; i < j; i++) {
                if (result.indexOf(this[i]) < 0)
                    result.push(this[i]);
            }
            return result;
        }
    }

    if (!Array.prototype.addNoDupe) {
        Array.prototype.addNoDupe = function (element) {
            if (this.length === 0) {
                this.push(element);
            }
            else if (this.length === 1 && element !== this[0]) {
                this.push(element);
            }
            else {
                found = this.indexOf(element);
                if (found === -1) {
                    this.push(element);
                }
            }
        };
    };

    if (!Array.prototype.prependNoDupe) {
        Array.prototype.prependNoDupe = function (element) {
            if (this.length === 0) {
                this.push(element);
            }
            else if (this.length === 1 && element !== this[0]) {
                this.splice(0, 0, element);
            }
            else {
                found = this.indexOf(element);
                if (found === -1) {
                    this.splice(0, 0, element);
                }
            }
        };
    };

    if (!Array.prototype.peek) {
        Array.prototype.peek = function () {
            if (this.length > 0) {
                var i = this.length - 1;
                return this[i];
            }
        }
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


    //http://stackoverflow.com/questions/500606/javascript-array-delete-elements
    // Array Remove - By John Resig (MIT Licensed)
    if (!Array.prototype.remove) {
        Array.prototype.remove = function (from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
    }

    if (!Array.prototype.removeItem) {
        Array.prototype.removeItem = function (item) {
            var index = this.indexOf(item);
            if (index < 0) return this;
            return this.remove(index);
        };
    }

    if (!Array.prototype.duplicate) {
        Array.prototype.duplicate = function () {
            var result = new Array(this.length);
            for (var i = 0; i < this.length; i++) {
                result[i] = this[i];
            }
            return result;
        };
    }

    if (!Array.prototype.uniqueValue) {
        Array.prototype.uniqueValue = function (groupClause, hash) {
            var result = hash ? hash : {};
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                var key = groupClause(item);
                result[key] ? result[key] += 1 : result[key] = 1;
            }
            return result;
        }
    }

    if (!Array.prototype.groupBy) {
        Array.prototype.groupBy = function (groupClause, hash) {
            var result = hash ? hash : {};
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                var key = groupClause(item);
                result[key] ? result[key].push(item) : result[key] = [item];
            }
            return result;
        }
    }







    // End of Utilities and Array Ploy fill

    //Start of extensions
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };

    String.prototype.ltrim = function () {
        return this.replace(/^\s+/, '');
    };

    String.prototype.rtrim = function () {
        return this.replace(/\s+$/, '');
    };

    String.prototype.fulltrim = function () {
        return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    };

    String.prototype.removeSpaces = function () {
        return this.replace(/\s+/g, '');
    }

    //'The {0} is dead. Don\'t code {0}. Code {1} that is open source!'.format('ASP', 'PHP');

    String.prototype.formatOLD = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match ;
            });
        };
    }



    if (!String.prototype.matches) {
        String.prototype.matches = function (str) {
            if (str) return this.toLocaleLowerCase() == str.toLocaleLowerCase();

            return str == this;
        };
    }

    if (!String.prototype.contains) {
        String.prototype.contains = function (it) {
            return this.toLocaleLowerCase().containsString(it.toLocaleLowerCase());
        };
    }

    String.prototype.startsWith = function (str) {
        return (this.match("^" + str) == str);
    };

    String.prototype.endsWith = function (str) {
        return (this.match(str + "$") == str);
    };

    String.prototype.containsString = function (it) {
        return this.indexOf(it) != -1;
    };



    String.prototype.begins = function (str) {
        return this[0] === str;
    };

    String.prototype.ends = function (str) {
        return this[this.length - 1] === str;
    };


    if (!String.prototype.toCamelCase) {
        String.prototype.toCamelCase = function (str) {
            return str.replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); })
                .replace(/\s/g, '')
                .replace(/^(.)/, function ($1) { return $1.toLowerCase(); });
        }
    }


    if (!String.prototype.toUpperCaseFirstChar) {
        String.prototype.toUpperCaseFirstChar = function () {
            return this.substr(0, 1).toUpperCase() + this.substr(1);
        }
    }



    if (!String.prototype.toLowerCaseFirstChar) {
        String.prototype.toLowerCaseFirstChar = function () {
            return this.substr(0, 1).toLowerCase() + this.substr(1);
        }
    }



    if (!String.prototype.toUpperCaseEachWord) {
        String.prototype.toUpperCaseEachWord = function (delim) {
            delim = delim ? delim : ' ';
            return this.split(delim).map(function (v) { return v.toUpperCaseFirstChar() }).join(delim);
        }
    }



    if (!String.prototype.toLowerCaseEachWord) {
        String.prototype.toLowerCaseEachWord = function (delim) {
            delim = delim ? delim : ' ';
            return this.split(delim).map(function (v) { return v.toLowerCaseFirstChar() }).join(delim);
        }
    }


    //http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
    if (!Function.prototype.debounce) {
        Function.prototype.debounce = function (threshold, execAsap) {
            var func = this, // reference to original function
                timeout; // handle to setTimeout async task (detection period)
            // return the new debounced function which executes the original function only once
            // until the detection period expires
            return function debounced() {
                var obj = this, // reference to original context object
                    args = arguments; // arguments at execution time
                // this is the detection function. it will be executed if/when the threshold expires
                function delayed() {
                    // if we're executing at the end of the detection period
                    if (!execAsap)
                        func.apply(obj, args); // execute now
                    // clear timeout handle
                    timeout = null;
                };
                // stop any current detection period
                if (timeout)
                    clearTimeout(timeout);
                    // otherwise, if we're not already waiting and we're executing at the beginning of the detection period
                else if (execAsap)
                    func.apply(obj, args); // execute now
                // reset the detection period
                timeout = setTimeout(delayed, threshold || 100);
            };
        }
    }

    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    Date.prototype.diffToMinutes = function (dt) {
        if (this > dt) {
            return Math.abs(this - dt) / 60000;
        }
        return -Math.abs(this - dt) / 60000;
    }

    Date.prototype.diffToSeconds = function (dt) {
        if (this > dt) {
            return Math.abs(this - dt) / 1000;
        }
        return -Math.abs(this - dt) / 1000;
    }

    Date.prototype.toMMDDYYYY = function (separator) {
        var month = this.getMonth() + 1;
        var day = this.getDay();
        var year = this.getFullYear();

        if (month < 10) {
            month = '0' + month;
        }

        if (day < 10) {
            day = '0' + day;
        }

        return month + separator + day + separator + year;
    }

    Date.prototype.toHHMMAMPM = function (separator) {

        var hours = this.getHours();
        var minutes = this.getMinutes();
        var amOrPm = '';

        if (hours > 12) {
            hours = hours - 12;
            amOrPm = 'PM';
        }

        if (hours < 10) {
            hours = '0' + hours;
        }

        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        return hours + separator + minutes + ' ' + amOrPm;
    }


    if (!Function.prototype.wait100) {
        Function.prototype.wait100 = function () {
            var func = this;// this is the function that is extended
            var args = arguments; // arguments to be passed to it
            function delayed() {
                return func.apply(func, args); // execute now
            }
            setTimeout(delayed, 100);
        }
    }
    if (!Function.prototype.wait200) {
        Function.prototype.wait200 = function () {
            var func = this;// this is the function that is extended
            var args = arguments; // arguments to be passed to it
            function delayed() {
                return func.apply(func, args); // execute now
            }
            setTimeout(delayed, 200);
        }
    }
    if (!Function.prototype.wait500) {
        Function.prototype.wait500 = function () {
            var func = this;// this is the function that is extended
            var args = arguments; // arguments to be passed to it
            function delayed() {
                return func.apply(func, args); // execute now
            }
            setTimeout(delayed, 500);
        }
    }
    if (!Function.prototype.wait1000) {
        Function.prototype.wait1000 = function () {
            var func = this;// this is the function that is extended
            var args = arguments; // arguments to be passed to it
            function delayed() {
                return func.apply(func, args); // execute now
            }
            setTimeout(delayed, 1000);
        }
    }

	
}(Foundry));