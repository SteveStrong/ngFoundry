/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.decision.js" />


describe("Foundry: Decision Component", function () {
    var obj;

    beforeEach(function () {
        obj = fo.makeDecisionComponent({ 
            properName: 'Major Decision', 
            customName: function () { return this.properName;},
        });
        return obj;
    });

    it("should be a component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.isEmpty()).toBe(false);
        expect(obj.Subcomponents.isEmpty()).toBe(true);
    });

    it("should be a extentable", function () {
        expect(obj.properName).toEqual('Major Decision');
    });

    it("should be overrideable", function () {
        expect(obj.customName).toEqual('Major Decision');
    });

    it("should compute a default score of 0", function () {
        expect(obj.score).toEqual(0);
    });

    it("should compute a default weight of 0", function () {
        expect(obj.weight).toEqual(0);
    });

    it("should compute a default isStipulated of false", function () {
        expect(obj.isStipulated).toEqual(false);
    });
 
});



describe("Foundry: Decision Component Tree", function () {
    var obj;


    beforeEach(function () {
        obj = fo.makeDecisionComponent({ name: "Car" });

        var wants = obj.establishSubcomponent("Wants")
        wants.establishSubcomponent("Styling")
        wants.establishSubcomponent("Performance Handling")
        wants.establishSubcomponent("InCar Technology")
        wants.establishSubcomponent("Roof Style")
        wants.establishSubcomponent("Luxury Ride")
        wants.establishSubcomponent("Status")

        var needs = obj.establishSubcomponent("Needs")
        needs.establishSubcomponent("Seating Capacity")
        needs.establishSubcomponent("Interior Cargo Space")
        needs.establishSubcomponent("InCar Technology")
        needs.establishSubcomponent("Exterior Cargo Space")
        needs.establishSubcomponent("Off Road")
        needs.establishSubcomponent("Fuel Economy")
    });

    it("should be a component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);
        expect(obj.Properties.isEmpty()).toBe(false);
    });

    it("should be a Decision component", function () {
        expect(fo.utils.isaDecisionComponent(obj)).toBe(true);
        expect(obj.Properties.isEmpty()).toBe(false);
    });


    it("should have subcomponents that are Decision Components", function () {
        expect(obj.Subcomponents.count).toEqual(2);

        var Wants = obj.getSubcomponent("Wants");
        expect(fo.utils.isaDecisionComponent(Wants)).toBe(true);


        var Needs = obj.getSubcomponent("Needs");
        expect(fo.utils.isaDecisionComponent(Needs)).toBe(true);

    });

    it("should have subcomponents Wants & Needs", function () {
        expect(obj.Subcomponents.count).toEqual(2);

        var Wants = obj.getSubcomponent("Wants");
        expect(Wants.Subcomponents.count).toEqual(6);

        var Needs = obj.getSubcomponent("Needs");
        expect(Needs.Subcomponents.count).toEqual(6);
    });

    it("should have a Score of 0 by default", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.nodeDepth).toEqual(0);
        expect(obj.weight).toEqual(0);
    });

    it("should have subcomponents with the default weights of .5", function () {
        var Wants = obj.getSubcomponent("Wants");
        expect(Wants.score).toEqual(0);
        expect(Wants.importance).toEqual(30);
        expect(Wants.weight).toEqual(0.5);

        var Needs = obj.getSubcomponent("Needs");
        expect(Needs.score).toEqual(0);
        expect(Needs.importance).toEqual(30);
        expect(Needs.weight).toEqual(0.5);

    });


});