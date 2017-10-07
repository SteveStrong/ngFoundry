"use strict";


// "fields": {
//     "show_date": {
//         "label": "Show"
//     },
//     "year": {
//         "dataType": "year",
//         "label": "Year"
//     },
//     "guest_name": {
//         "dataType": "text",
//         "label": "Guest"
//     },
//     "google_occupation": {
//         "dataType": "text",
//         "label": "Occupation"
//     },
//     "category": {
//         "dataType": "text",
//         "label": "Category"
//     }
// }

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof

export class foDataType {
    private _example: any;
    private _jsontype: any;

    constructor(example?) {
        this._example = example;
        this._jsontype = typeof example;
    }

    get jsontype() {
        return this._jsontype;
    }
    isType(obj) {
        return typeof obj === this.jsontype;
    }
    isValueOfType(value, key?) {
        return typeof value === this.jsontype;
    }
    get datatype() {
        var result = this.className.split('Ty')[0];
        return result;
    }
    get className() {
        var result = this.constructor.name
        return result;
    }
    toNativeValue(value) {
        return value;
    }
    isValueUndefined(value) {
        if (value === undefined) return true;
        return false;
    }
}

export class textType extends foDataType {
    constructor(example?) {
        super(example || 'example');
    }
    isValueOfType(value, key?) {
        return typeof value === this.jsontype;
    }
    toNativeValue(value) {
        if (this.isValueOfType(value)) {
            return value;
        }
        return new String(value);
    }
    isValueUndefined(value) {
        if (super.isValueUndefined(value)) {
            return true;
        }
        return !value || value.length == 0;
    }
}

export class numberType extends foDataType {
    constructor(example?) {
        super(example || 1);
    }
    toNativeValue(value) {
        if (this.isValueOfType(value)) {
            return value;
        }
        var result = +value;
        return result;
    }
    isValueUndefined(value) {
        if (super.isValueUndefined(value)) {
            return true;
        }
        return false;
    }
}

export class booleanType extends foDataType {
    constructor(example?) {
        super(example || true);
    }
}

export class yesno extends booleanType {
    constructor(example?) {
        super(example || true);
    }
    toNativeValue(value) {
        //map this to a integer
        if (this.isValueOfType(value)) {
            return value;
        }
        if ("NO" == value) {
            return false;
        }
        if ("YES" == value) {
            return true;
        }
        return undefined;
    }
}



export class timeType extends foDataType {
    constructor(example?) {
        super(example);
    }
}

// Date.prototype.isValid = function () {
//     // An invalid date object returns NaN for getTime() and NaN is the only
//     // object not strictly equal to itself.
//     return this.getTime() === this.getTime();
// };


export class dateType extends timeType {
    constructor(example?) {
        super(example || new Date());
    }
    toNativeValue(value) {
        //map this to a integer
        if (this.isValueOfType(value)) {
            return value;
        }
        var result = Date.parse(value);
        if (isNaN(result) == true) {
            return new Date();
        }
        return new Date(value);
    }
}

export class yearType extends timeType {
    constructor(example?) {
        super(example || 1874);
    }
    isValueOfType(value, key?) {
        var result = super.isValueOfType(value, key);
        if (!result) return;
        var found = parseInt(value);
        return found > 0 && found < 40000;
    }
    toNativeValue(value) {
        //map this to a integer
        if (this.isValueOfType(value)) {
            return value;
        }
        return parseInt(value);
    }
}

export class resource extends textType {
    constructor(example?) {
        super(example || 'xxx.jpg');
    }
    isValueOfType(value, key) {
        var result = super.isValueOfType(value, key);
        if (!result) return;
        return value.endsWith('.jpg') || value.endsWith('.png');
    }
}

export class urlType extends textType {
    constructor(example?) {
        super(example || 'http://');
    }
    isValueOfType(value, key) {
        var result = super.isValueOfType(value, key);
        if (!result) return;
        return value.startsWith('http') || value.startsWith('www.');
    }
}

export class anyType extends foDataType {
    constructor(example?) {
        super(example);
    }
}

// isNumber: !isNaN(value),
// isUrl: stringValue.startsWith('http') || stringValue.startsWith('www.'),
// isResource: stringValue.endsWith('.jpg') || stringValue.endsWith('.png')

export class foDataTools {
    classMap = {};
    valueMap = {};

    typeMap = {
        number: new numberType(),
        boolean: new booleanType(),
        yesno: new yesno(),
        time: new timeType(),
        year: new yearType(),
        date: new dateType(),
        text: new textType(),
        any: new anyType(),
    }

    constructor() {
        for (var key in this.typeMap) {
            var className = this.typeMap[key].className;
            this.classMap[key] = className;
            this.valueMap[className] = this.typeMap[key];
        }
    }

    findType(key) {
        let found = this.typeMap[key];
        if (!found) {
            found = this.typeMap.any;
        }
        return found.datatype;
    }

    computeValueType(key, value, suggestion, context) {
        if (suggestion) {
            return suggestion;
        }

        var stringValue = String(value);
        var isNumber = !isNaN(value);

        for (var type in this.typeMap) {
            if (this.typeMap[type].isValueOfType(value, key)) {
                return this.typeMap[type].datatype();
            }
        }

        return this.typeMap.text.datatype;
    }

    verifyAndChangeDataType(value, className) {

        //console.log('verifyAndChangeDataType:' + value + '  ' + className);
        var type = this.valueMap[className];
        if (!type) return value;
        var result = type.toNativeValue(value);
        //console.log('result:' + result);

        return result;
    }

    isValueUndefined(value, className) {

        var type = this.valueMap[className];
        if (!type) return true;
        var result = type.isValueUndefined(value);

        return result;
    }

}


export let DataTools: foDataTools = new foDataTools();



