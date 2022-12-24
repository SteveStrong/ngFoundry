/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />


/// <reference path="../Foundry/Foundry.js" />



 describe("Foundry: On SmashTest", function () {

    var obj;

    beforeEach(function () {
        var spec = {
            Text: 'Hello',
            Greeting: function() {
                return this.Text + '  World';
            }
        };
        obj = fo.makeComponent(spec);
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Text).toEqual('Hello');
    });

    it("should be able to watch value smash ", function () {

        var changed = false;
        expect(obj.Text).toEqual('Hello');
        expect(changed).toEqual(false);

        var prop = obj.getProperty('Text');
        prop.onValueSmash = function (value, formula, owner) {
            changed = true;
        };


        obj.Text = 'Goodbye'

        expect(obj.Text).toEqual('Goodbye');
        expect(changed).toEqual(true);

    });

    it("should be able to smash many times but report it once", function () {

        var changed = 0;
        expect(obj.Text).toEqual('Hello');
        expect(changed).toEqual(0);

        var prop = obj.getProperty('Text');
        prop.onValueSmash = function (value, formula, owner) {
            changed++;
        };

        for (var i = 0; i < 10; i++) {
            obj.Text = 'Goodbye'
        }

        expect(obj.Text).toEqual('Goodbye');
        expect(changed).toEqual(1);

    });

    it("should be able to smash many times but report it once for formulas", function () {

        var changed = 0;
        expect(obj.Greeting).toEqual(obj.Greeting);
        expect(changed).toEqual(0);

        var prop = obj.getProperty('Greeting');
        prop.onValueSmash = function (value, formula, owner) {
            changed++;
        };

        for (var i = 0; i < 10; i++) {
            obj.Text = 'Goodbye'
        }

        expect(obj.Greeting).toEqual(obj.Greeting);
        expect(changed).toEqual(1);

    });

    it("should be able to watch value be set ", function () {

        var changed = false;
        expect(obj.Text).toEqual('Hello');
        expect(changed).toEqual(false);

        var prop = obj.getProperty('Text');


        prop.onValueSet = function (value, formula, owner) {
            changed = true;
        };


        obj.Text = 'Goodbye'

        expect(obj.Text).toEqual('Goodbye');
        expect(changed).toEqual(true);

    });

    it("should be able to watch value be set but only if it changes ", function () {

        var changed = 0;
        expect(obj.Text).toEqual('Hello');
        expect(changed).toEqual(0);

        var prop = obj.getProperty('Text');


        prop.onValueSet = function (value, formula, owner) {
            changed++;
        };


        for (var i = 0; i < 10; i++) {
            obj.Text = 'Goodbye'
        }

        expect(obj.Text).toEqual('Goodbye');
        expect(changed).toEqual(1);

    });

    it("should be able to watch value onValueDetermined ", function () {

        var changed = false;
        expect(obj.Text).toEqual('Hello');
        expect(changed).toEqual(false);

        var prop = obj.getProperty('Greeting');

        prop.onValueDetermined = function (value, formula, owner) {
            changed = true;
        };

        obj.Text = 'Goodbye'

        expect(obj.Greeting).toEqual(obj.Greeting);
        expect(changed).toEqual(true);

    });
});