export enum foNames {
    UNKNOWN = "unknown",
    AT = '@',
    THIS = 'this',
    SELF = 'self',
    ROOT = 'root'
};

// Converts numeric degrees to radians
// if (typeof (Number.prototype.toRad) === "undefined") {
//     Number.prototype.toRad = function () {
//         return this * Math.PI / 180;
//     }
// }
// if (typeof (Number.prototype.toDeg) === "undefined") {
//     Number.prototype.toDeg = function () {
//         return this * 180 / Math.PI;
//     }
// }

export class foTools {

    // Speed up calls to hasOwnProperty
    private hasOwnProperty = Object.prototype.hasOwnProperty;

    constructor() {
    }


    /**
     * http://stackoverflow.com/questions/6588977/how-to-to-extract-a-javascript-function-from-a-javascript-file
     * @param funct
     */
    getFunctionName(funct) {
        let ret = funct.toString();  //do with regx
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret.trim();
    };

    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    asJson(target: any) {
        let result = this.stringify(target);
        return JSON.parse(result);
    }

    stringify(target: any, func = undefined, deep = 3) {
        function resolveReference(value) {
            if (value && value.asReference) {
                return 'resolveRef(' + value.asReference() + ',' + value.constructor.name + ')';
            }
            return value;
        }
        function resolveCircular(key, value) {

            switch (key) {
                case 'myParent':
                    return resolveReference(value);
                case 'myMembers':
                    return value ? value.map(function (item) { return resolveReference(item); }) : value;
                case '_lookup':
                    return value;
                case '_members':
                    return value;
            }
            if (key.startsWith('_')) return;
            //if (this.isCustomLinkName(key)) {
            //    return resolveReference(value);
            //}

            return value;
        }

        return JSON.stringify(target, resolveCircular, deep);
    };

    splitNamespaceType(id: string, primitive?: string) {
        let typeId = id.split('::');
        let result = { namespace: '', name: id }
        if (typeId.length == 2) {
            result = {
                namespace: typeId[0],
                name: typeId[1]
            }
        } else if (primitive) {
            result = {
                namespace: typeId[0],
                name: primitive
            }
        }
        return result;
    };

    getNamespace(obj) {
        var myNamespace = obj.myType ? obj.myType.split('::') : [''];
        myNamespace = myNamespace[0];
        return myNamespace;
    };

    getType(obj): string {
        let myType = obj.myType ? obj.myType.split('::') : [''];
        myType = myType.length == 2 ? myType[1] : myType[0];
        return myType;
    };

    namespace(namespace: string, name: string) {
        return `${namespace}::${name}`;
    };


    randomInt(low: number, high: number) {
        return low + Math.floor(Math.random() * (high - low + 1));
    };

    random(low: number, high: number) {
        return low + Math.random() * (high - low);
    };

    randomRGBColor() {
        var r = 255 * Math.random() | 0,
            g = 255 * Math.random() | 0,
            b = 255 * Math.random() | 0;
        return `rgb(${r},${g},${b})`;
    }

    matches(str1: string, str2: string) {
        if (str1 === str2) return true;
        return str1 && str2 && str1.toLocaleLowerCase() == str2.toLocaleLowerCase();
    }

    capitalizeFirstLetter(str1: string) {
        return str1.charAt(0).toUpperCase() + str1.slice(1);
    }

    isSelf(ref) {
        return this.matches(ref, foNames.AT) || this.matches(ref, foNames.THIS) || this.matches(ref, foNames.SELF)
    };

    isArray(obj) {
        if (Array.isArray) return Array.isArray(obj);
        return (Object.prototype.toString.call(obj) === '[object Array]') ? true : false;
    };

    isFunction(obj) {
        return typeof obj === 'function';
    };

    isString(obj) {
        return typeof obj === 'string';
    };

    isNumber(obj) {
        return typeof obj === 'number';
    };

    isDate(obj) {
        return obj instanceof Date;
    };

    isObject(obj) {
        return obj && typeof obj === 'object'; //prevents typeOf null === 'object'
    };

    isCustomLinkName(key) {
        return false;
    };

    isTyped(obj) {
        return obj && obj.isInstanceOf;
    };

    isEmpty(obj) {
        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0) return false;
        if (obj.length === 0) return true;

        // If it isn't an object at this point
        // it is empty, but it can't be anything *but* empty
        // Is it empty?  Depends on your application.
        if (typeof obj !== "object") return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (this.hasOwnProperty.call(obj, key)) return false;
        }

        return true;

    };

    removeDQ(str: string): string {
        return str.replace(/^"(.*)"$/, '$1');
    }

    unwrap(str: string): string {
        return str.substring(1, str.length - 1)
    }

    wrapDQ(str: string): string {
        return `"${str}"`;
    }

    wrapSQ(str: string): string {
        return `'${str}'`;
    }

    decomposeHostPath(filename) {
        var string = filename.toLowerCase();
        string = string.replace('http://', "")
        string = string.replace('https://', "")

        var host = string.split('/')[0];
        var path = string.replace(host, '');
        return {
            fullpath: filename,
            host: host,
            path: path,
        }
    };

    extend(target, source) {
        if (!source) return target;
        for (var key in source) {
            if (this.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
        return target;
    };

    mixin(target, source) {
        if (!source) return target;
        if (!target) return source;
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    };

    mixExact(target, source) {
        if (!source) return target;
        if (!target) return source;
        for (var key in source) {
            if (foTools.hasOwnProperty.call(target, key)) {
                target[key] = source[key];
            }
        }
        return target;
    };

    mixout(target, source) {
        if (!source) return target;
        if (!target) return source;
        for (var key in source) {
            if (this.hasOwnProperty.call(target, key)) {
                delete target[key];
            }
        }
        return target;
    };

    extract(target, keys?: string[]) {
        let spec = {}
        keys && keys.forEach(key => {
            spec[key] = target[key];
        });
        return spec;
    }

    mixMap(target, source) {
        if (!source) return target;
        var result = {};
        for (var key in target) {
            var keyMap = source[key] || key;
            result[keyMap] = target[key];
        }
        return result;
    };

    intersect(target, source) {
        if (!source) return target;
        if (!target) return source;
        var intersect = {};
        for (var key in target) {
            if (this.hasOwnProperty.call(source, key)) {
                intersect[key] = source[key];
            } else {
                intersect[key] = target[key];
            }
        }
        return intersect;
    };

    union(target, source) {
        var result = {};
        if (target) {
            for (var key in target) {
                result[key] = target[key];
            }
        }
        if (source) {
            for (var key in source) {
                result[key] = source[key];
            }
        }
        return result;
    };

    defineComputeOnlyProperty(target, name, func) {
        //var self = target;
        Object.defineProperty(target, name, {
            enumerable: true,
            configurable: true,
            get: func
        });
        return target;
    };

    defineCalculatedProperty(target, name, func) {
        //var self = target;
        Object.defineProperty(target, name, {
            enumerable: true,
            configurable: true,
            get: func,    //.call(self, self),
            set: function (value) {
                this[`_${name}`] = value;
            }
        });
        return target;
    };

    getMethods(obj) {
        var list = [];
        for (var m in obj.prototype) {
            if (typeof obj[m] == "function") {
                list.push(m)
            }
        }
        return list;
    }

    asArray(obj, funct?) {
        if (this.isArray(obj)) return obj;
        return this.mapOverKeyValue(obj, function (key, value) { return funct ? funct(key, value) : value; });
    };

    applyOverKeyValue(obj, mapFunc) {  //funct has 2 args.. key,value
        var body = {};
        var keys = obj ? Object.keys(obj) : [];
        keys.forEach(key => {
            if (this.hasOwnProperty.call(obj, key)) {
                var value = obj[key];
                var result = mapFunc(key, value);
                if (result) body[key] = result;
            }
        });
        return body;
    };

    mapOverKeyValue(obj, mapFunc) {  //funct has 2 args.. key,value
        var list = [];
        var keys = obj ? Object.keys(obj) : [];
        keys.forEach(key => {
            if (this.hasOwnProperty.call(obj, key)) {
                var value = obj[key];
                var result = mapFunc(key, value);
                if (result) list.push(result);
            }
        });
        return list;
    };

    forEachKeyValue(obj, mapFunc) {  //funct has 2 args.. key,value
        var keys = obj ? Object.keys(obj) : [];
        keys.forEach(key => {
            if (this.hasOwnProperty.call(obj, key)) {
                var value = obj[key];
                mapFunc(key, value);
            }
        });
    };

    findKeyForValue(obj, key) {
        for (var name in obj) {
            if (this.hasOwnProperty.call(obj, key)) {
                if (obj[name].matches(key)) return name;
            }
        }
        return obj;
    };

    extractReadWriteKeys(spec) {
        let keys: string[] = [];
        Tools.forEachKeyValue(spec, (k, v) => {
            if (!Tools.isFunction(v)) {
                keys.push(k);
            }
        });
        return keys;
    }

    extractComputedKeys(spec) {
        let keys: string[] = [];
        Tools.forEachKeyValue(spec, (k, v) => {
            if (Tools.isFunction(v)) {
                keys.push(k);
            }
        });
        return keys;
    }

    overrideComputed(obj: any, properties: any) {
        Tools.forEachKeyValue(properties, function (key, value) {
            try {
                if (Tools.isFunction(value)) {
                    Tools.defineCalculatedProperty(obj, key, value);
                } else {
                    obj[key] = value;
                }
            } catch (ex) {
                console.log(ex);
            }
        });
    }

    extendComputed(obj: any, properties: any) {
        Tools.forEachKeyValue(properties, function (key, value) {
            try {
                if (!obj[key]) {
                    if (Tools.isFunction(value)) {
                        Tools.defineCalculatedProperty(obj, key, value);
                    } else {
                        obj[key] = value;
                    }
                }
            } catch (ex) {
                console.log(ex);
            }
        });
    }

    pluck(name) {
        return function (x) { return x[name] }
    }

    distinctItems(list) {
        let distinct = {}
        list.forEach(item => {
            distinct[item] = item;
        })
        return Object.keys(distinct);
    }

    groupBy(pluckBy, list) {
        let dictionary = {}
        list.forEach(item => {
            let key = pluckBy(item);
            if (!dictionary[key]) {
                dictionary[key] = [];
            }
            dictionary[key].push(item);
        })
        return dictionary;
    }

    //add this to new service to dynamicaly load javascript,  maybe over signalR

    // xmlHttpGet(url:string, onComplete, onFailure) {
    //     let xmlHttp = new window.XMLHttpRequest();
    //     xmlHttp.onload = function () {
    //         var result = xmlHttp.responseText;
    //         onComplete && onComplete(result, xmlHttp);
    //     };
    //     try {
    //         xmlHttp.open("GET", url, false);  //this may give chrome some problems
    //         xmlHttp.send(null);
    //     }
    //     catch (ex) {
    //         onFailure && onFailure(ex, xmlHttp);
    //     }
    // }
    // loadAsScript(url:string, onComplete) {
    //     this.xmlHttpGet(url, function (text, xhr) {
    //         if (xhr.status == 200 || xhr.status == 304) {
    //             var head = document.getElementsByTagName("head")[0];
    //             var script = document.createElement('script');
    //             script.innerHTML = text;
    //             head.appendChild(script);
    //             onComplete && onComplete(script);
    //         }
    //     });
    //}

}


export let Tools: foTools = new foTools();