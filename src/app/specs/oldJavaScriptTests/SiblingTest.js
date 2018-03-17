/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Foundry: Siblings", function () {
    var root;
    var c1;
    var c2;
    var c3;


    beforeEach(function () {
        root = fo.makeComponent();
        c1 = root.addSubcomponent(fo.makeComponent(), 'C1');
        c2 = root.addSubcomponent(fo.makeComponent(), 'C2');
        c3 = root.addSubcomponent(fo.makeComponent(), 'C3');
       
    });

    it("root should be a Component", function () {
        expect(fo.utils.isaComponent(root)).toBe(true);

        expect(root.Properties.isEmpty()).toBe(true);
    });

    it("should have 3 Siblings", function () {
        expect(root.Subcomponents.count).toBe(3);

        expect(c1.mySiblingTotal()).toBe(3);
        expect(c2.mySiblingTotal()).toBe(3);
        expect(c3.mySiblingTotal()).toBe(3);
    });

    it("should compute the right index", function () {

        expect(c1.myIndex()).toBe(0);
        expect(c2.myIndex()).toBe(1);
        expect(c3.myIndex()).toBe(2);
    });

    it("should compute next Siblings", function () {

        expect(c1.mySiblingNext()).toBe(c2);
        expect(c2.mySiblingNext()).toBe(c3);
        expect(c3.mySiblingNext()).toBeUndefined();
    });

    it("should compute previous Siblings", function () {

        expect(c1.mySiblingPrevious()).toBeUndefined();
        expect(c2.mySiblingPrevious()).toBe(c1);
        expect(c3.mySiblingPrevious()).toBe(c2);
    });

    it("should compute removals", function () {

        root.removeSubcomponent(c2);
        expect(c1.mySiblingNext()).toBe(c3);
        expect(c2.myIndex()).toBe(-1);
        expect(c3.mySiblingPrevious()).toBe(c1);
    });

    it("should compute a list of members before itself", function () {

        var elements = c3.mySiblingsBefore();
        expect(elements.count).toBe(2);

        elements = c1.mySiblingsBefore();
        expect(elements.count).toBe(0);
    });

    it("should compute a list of members after itself", function () {

        var elements = c3.mySiblingsAfter();
        expect(elements.count).toBe(0);

        elements = c1.mySiblingsAfter();
        expect(elements.count).toBe(2);
    });

    it("should compute a list of members members nearby", function () {

        var e1 = c2.mySiblingsBefore();
        expect(e1.count).toBe(1);
        expect(e1.first()).toBe(c1);

        var e2 = c2.mySiblingsAfter();
        expect(e2.count).toBe(1);
        expect(e2.first()).toBe(c3);
    });
});