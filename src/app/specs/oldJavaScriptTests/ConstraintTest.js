/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Foundry: Constraint", function () {
    var block;

    //this is the UI object
    var spec = {
        option1: true,
        option2: false,
        option3: false,
    }

    beforeEach(function() {
        block = fo.makeComponent(spec);

        var listDefault = {
            option1: false,
            option2: false,
            option3: false,
        }

        function applyMEConstraint(newValue, fun, obj) {
            if (!newValue) return;
            var prop = this;

            for (var key in listDefault) {
                if (!prop.myName.matches(key)) {

                    obj[key] = false;
                }
            }
        }

        for (var key in listDefault) {
            block.onPropertyValueSet(key, applyMEConstraint);
        }

    });

    it("defaults should be set", function() {
        expect(block.option1).toEqual(true);
        expect(block.option2).toEqual(false);
        expect(block.option3).toEqual(false);
    });

    it("constraints should force other values to change", function () {
        expect(block.option1).toEqual(true);
        expect(block.option2).toEqual(false);
        expect(block.option3).toEqual(false);

        block.option2 = true;

        expect(block.option1).toEqual(false);
        expect(block.option2).toEqual(true);
        expect(block.option3).toEqual(false);

        block.option3 = true;

        expect(block.option1).toEqual(false);
        expect(block.option2).toEqual(false);
        expect(block.option3).toEqual(true);

    });


});