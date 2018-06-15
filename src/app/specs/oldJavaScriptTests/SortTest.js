/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Scripts/moment.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

/// <reference path="../Foundry/Foundry.rules.filtering.js" />


describe("Sort: numbers and time", function () {
    var list;
    var data;

    beforeEach(function () {
        list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        var i = 0;

        data = list.map(function (item) {
            var hour = i; i++;
            var time = new moment();
            return {
                name: item,
                number: hour,
                hour: time.add('h', hour),
            }
        });

        data = fo.filtering.applyFilterAndSort(data, undefined, 'name(asc)');


    });


    it("sort should be by name by default", function () {
        expect(data[0].name).toBe("eight");
        expect(data[data.length - 1].name).toBe("zero");
    });

    it("sort asc numbers", function () {
        data = fo.filtering.applyFilterAndSort(data, undefined, 'number(asc)');

        expect(data[0].number).toBe(0);
        expect(data[data.length - 1].number).toBe(10);
    });

    it("sort dec numbers", function () {
        data = fo.filtering.applyFilterAndSort(data, undefined, 'number(dev)');

        expect(data[0].number).toBe(10);
        expect(data[data.length - 1].number).toBe(0);
    });

    it("sort asc hour", function () {
        data = fo.filtering.applyFilterAndSort(data, undefined, 'hour(asc)');

        expect(data[0].number).toBe(0);
        expect(data[data.length - 1].number).toBe(10);
    });

    it("sort dec hour", function () {
        data = fo.filtering.applyFilterAndSort(data, undefined, 'hour(dev)');

        expect(data[0].number).toBe(10);
        expect(data[data.length - 1].number).toBe(0);
    });


});