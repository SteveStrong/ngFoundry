/**
 * Caches the return value of get accessors and methods.
 *
 * Notes:
 * - Doesn't really make sense to put this on a method with parameters.
 * - Creates an obscure non-enumerable property on the instance to store the memoized value.
 * - Could use a WeakMap, but this way has support in old environments.
 */
export function Memoize(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    if (descriptor.value != null) {
        descriptor.value = getNewFunction(descriptor.value);
    }
    else if (descriptor.get != null) {
        descriptor.get = getNewFunction(descriptor.get);
    }
    else {
        throw "Only put a Memoize decorator on a method or get accessor.";
    }
}

let counter = 0;
function getNewFunction(originalFunction: () => void) {
    const identifier = ++counter;

    return function (this: any, ...args: any[]) {
        const propName = `__memoized_value_${identifier}`;
        let returnedValue: any;

        if (this.hasOwnProperty(propName)) {
            returnedValue = this[propName];
        }
        else {
            returnedValue = originalFunction.apply(this, args);
            Object.defineProperty(this, propName, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: returnedValue
            });
        }

        return returnedValue;
    };
}

// Example:
// import * as assert from "assert";
// import {Memoize} from "./memoize-decorator";

// describe("Memoize", () => {
//     class MyClass {
//         @Memoize
//         getNumber() {
//             return Math.random();
//         }

//         @Memoize
//         get value() {
//             return Math.random();
//         }
//     }

//     const a = new MyClass();
//     const b = new MyClass();

//     it("method should be memoized", () => {
//         assert.equal(a.getNumber(), a.getNumber());
//     });

//     it("accessor should be memoized", () => {
//         assert.equal(a.value, a.value);
//     });

//     it("multiple instances shouldn't share values for methods", () => {
//         assert.notEqual(a.getNumber(), b.getNumber());
//     });

//     it("multiple instances shouldn't share values for accessors", () => {
//         assert.notEqual(a.value, b.value);
//     });
// });