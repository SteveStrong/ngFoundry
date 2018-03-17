/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

var Foundry = Foundry || {};

(function (ns, undefined) {
 
    //Prototype defines functions using JSON syntax
    function attachProperty (obj, key, source) {
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                var result = source[key];
                return result
            },
            set: function (newInit) {
                source[key] = newInit;
            }
        });
    }
        
    ns.attachComponent = function (self, source) {
        if (source !== undefined) {
            for (var key in source) {
                if (key.startsWith('_') ) {
                    var prop = source[key];
                    var name = prop.myName;
                    attachProperty(self, name, source);
                }
            }
        }

        return self;
    };

}(Foundry));

describe("Foundry: Extend via Prototype", function () {

    var utils = fo.utils;
    var obj;

    beforeEach(function () {
        var spec = {
            firstName: 'steve',
            userNickName: 'java',
            user: function () {
                return '{0} ({1})'.format(this.firstName, this.userNickName);
            },
        };
        obj = fo.makeComponent(spec);
    });

    it("should be a Component", function () {
        expect(utils.isaComponent(obj)).toBe(true);
    });

    it("create a new object Via Function", function () {
        function house() {
            return {
                address: '414 Drexel Place',
                town: 'Swarthmore',
                state: 'Pa',
            }
        }
        var myHouse = new house();
        expect(myHouse.town).toEqual('Swarthmore');
    });

    it("create a new object Via Function", function () {
        function house() {
            return {
                address: '414 Drexel Place',
                town: 'Swarthmore',
                state: 'Pa',
            }
        }


        var myHouse = new house();
        fo.attachComponent(myHouse, obj);

        expect(myHouse.town).toEqual('Swarthmore');
        expect(myHouse.userNickName).toEqual('java');
        expect(myHouse.user).toEqual(obj.user);
    });

});