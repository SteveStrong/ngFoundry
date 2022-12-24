/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


 describe("Apprentice: Advanced Property Management", function () {

    var obj;

    beforeEach(function () {
        var spec = { Text: 'Hello' };
        obj = fo.makeComponent(spec);
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Text).toEqual('Hello');
    });

    it("should take extensions ", function () {
        obj.establishProperty("name", function () {
            return this.Text + " World";
        });

        expect(obj.Text).toEqual('Hello');
        expect(obj.name).toEqual('Hello World');
    });

    it("should take extensions and watch smashes", function () {
        var dummy = 10;
        expect(dummy).toEqual(10);

        obj.establishProperty("name", 
            function () {
                return this.Text + " World";
            },
            function () {
                dummy = 3;
            }
        );
        expect(obj.name).toEqual('Hello World');

        obj.Text = "Goodbye";

        expect(dummy).toEqual(3);

        expect(obj.name).toEqual('Goodbye World');

    });

});