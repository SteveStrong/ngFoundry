/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />
/// <reference path="../Scripts/jquery-2.0.3.min.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.rules.binding.js" />


describe("Foundry: rules.bindings", function () {
    var obj;

    var showSpec = {
        doesExist: false,
        canShow: false,
        canHide: false,
    };

    beforeEach(function () {
        obj = fo.makeComponent(showSpec);
    });

    it("can compute correct values", function () {
        expect(obj.doesExist).toEqual(false);
        expect(obj.canShow).toEqual(false);
        expect(obj.canHide).toEqual(false);
    });

    it("can resolve property returns property", function () {
        var reference = 'doesExist';

        var resolvedTo = obj.resolveProperty(reference);
        expect(resolvedTo.property).toBeDefined();
    });

    it("can compute binding plan", function () {
        var sBindRule = 'value: doesExist';
        var bindingPlan = Foundry.utils.bindingStringToObject(sBindRule);

        var element = document.createElement("input");
        try {
            var result = Foundry.createBinding(element, bindingPlan, obj);
            expect(result).toEqual(true);
        }
        catch (ex) {
        }

    });

    it("can resolve property expression returns formula", function () {
        var reference = '( this.doesExist && this.canShow )';

        var resolvedTo = obj.resolveProperty(reference);
        expect(resolvedTo.formula).toBeDefined();
    });



    it("can compute complex binding plan", function () {
        var sBindRule = 'show: ( this.doesExist &&  this.canShow )';
        var bindingPlan = Foundry.utils.bindingStringToObject(sBindRule);

        var element = document.createElement("div");
        try {
            var result = Foundry.createBinding(element, bindingPlan, obj);
            expect(result).toEqual(true);
        }
        catch (ex) {
        }
    });

});