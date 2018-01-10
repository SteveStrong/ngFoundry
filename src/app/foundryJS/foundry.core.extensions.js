(function (undefined) {

    if (!String.prototype.matches) {
        String.prototype.matches = function (str) {
            if (str) return this.toLocaleLowerCase() == str.toLocaleLowerCase();
            return str == this;
        };
    }

    //no longer needed
    //String.prototype.startsWith = function (str) {
    //    return (this.match("^" + str) == str);
    //};

    //String.prototype.endsWith = function (str) {
    //    return (this.match(str + "$") == str);
    //};

    //String.prototype.containsString = function (it) {
    //    return this.indexOf(it) != -1;
    //};


    String.prototype.capitalizeFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }


    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                  ? args[number]
                  : match
                ;
            });
        };
    }

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

    if (!Array.prototype.insert) {
        Array.prototype.insert = function (index, item) {
            this.splice(index, 0, item);
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

    if (!Array.prototype.peek) {
        Array.prototype.peek = function () {
            if (this.length > 0) {
                var i = this.length - 1;
                return this[i];
            }
        }
    };

    if (!Array.prototype.addNoDupe) {
        Array.prototype.addNoDupe = function (element) {
            if (this.length === 0) {
                this.push(element);
                return true;
            }
            else if (this.length === 1 && element !== this[0]) {
                this.push(element);
                return true;
            }
            else {
                found = this.indexOf(element);
                if (found === -1) {
                    this.push(element);
                    return true;
                }
            }
        };
    };

    if (!Array.prototype.prependNoDupe) {
        Array.prototype.prependNoDupe = function (element) {
            if (this.length === 0) {
                this.push(element);
                return true;
            }
            else if (this.length === 1 && element !== this[0]) {
                this.splice(0, 0, element);
                return true;
            }
            else {
                found = this.indexOf(element);
                if (found === -1) {
                    this.splice(0, 0, element);
                    return true;
                }
            }
        };
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

    if (!Array.prototype.firstWhere) {
        Array.prototype.firstWhere = function (whereClause) {
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                var ok = (whereClause == undefined) ? true : whereClause(item);
                if (ok) return item;
            }
        }
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

    if (!Array.prototype.uniqueValue) {
        Array.prototype.uniqueValue = function (groupClause, hash) {
            var result = hash ? hash : {};
            for (var i = 0, j = this.length; i < j; i++) {
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

    if (!Array.prototype.countBy) {
        Array.prototype.countBy = function (countClause, hash) {
            var result = hash ? hash : {};
            for (var i = 0, j = this.length; i < j; i++) {
                var item = this[i];
                var key = countClause(item);
                if ( key ) {
                    if (!result[key]) {
                        result[key] = 0;
                    }
                    result[key] += 1;
                }
            }
            return result;
        };
    }

    // Converts numeric degrees to radians
    if (typeof (Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        }
    }
    if (typeof (Number.prototype.toDeg) === "undefined") {
        Number.prototype.toDeg = function () {
            return this * 180 / Math.PI;
        }
    }

    Date.prototype.addDays = function (days) {
        var date = new Date(date.getDate() + days);
        return date;
    }

    Date.prototype.addMinutes = function (minutes) {
        var date = new Date(this.getTime() + minutes * 60000);
        return date;
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


})();
