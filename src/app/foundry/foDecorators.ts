"use strict";

//https://www.typescriptlang.org/docs/handbook/decorators.html

function foClassDecorator<T extends {new(...args:any[]):{}}>(constructor:T) {
    console.log('foClassDecorator');
    console.log(constructor);
    let xxx = class extends constructor {
        newProperty = "new property";
        hello = "override";
    }
    return xxx;
}


function configurable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.configurable = value;
        console.log('what shows up here')
        console.log(descriptor);
    };
}




// @foClassDecorator
// export class TestPoint {
//     private _x: number;
//     private _y: number;
//     constructor(x: number, y: number) {
//         this._x = x;
//         this._y = y;
//     }

//     @configurable(false)
//     get x() { return this._x; }

//     @configurable(false)
//     get y() { return this._y; }
// }