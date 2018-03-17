/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Scripts/moment.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

/// <reference path="../Foundry/Foundry.rules.filtering.js" />


describe("Sort: Via Parent", function () {
    var list;
    var main;

    beforeEach(function () {
        list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        var i = 0;

        var data = list.map(function (item) {
            var hour = i; i++;
            var time = new moment();
            return {
                name: item,
                number: hour,
                hour: time.add('h', hour),
            }
        });

        data = fo.filtering.applyFilterAndSort(data, undefined, 'name(asc)');

        main = fo.makeComponent({});
        main.myName = 'test';

        data.forEach(function (item) {
            var child = fo.makeComponent(item);
            main.capture(child, item.name);
        });
    });


    it("sort should be by name by default", function () {
        var firstChild = main.Subcomponents.item(0);
        expect(firstChild.name).toBe("eight");

        var item = main.Subcomponents.findByName("eight")
        expect(item.name).toBe("eight");
        expect(item.myName).toBe("eight");

        var lastChild = main.Subcomponents.item(main.Subcomponents.count - 1);
        expect(lastChild).toBe(main.Subcomponents.last());

        expect(lastChild.name).toBe("zero");
        expect(lastChild.myName).toBe("zero");
    });

    it("sort asc numbers", function () {
        var elements = main.Subcomponents.elements;
        var data = fo.filtering.applyFilterAndSort(elements, undefined, 'number(asc)');

        expect(data[0].number).toBe(0);
        expect(data[data.length - 1].number).toBe(10);
    });

    it("sort dec numbers", function () {
        var elements = main.Subcomponents.elements;
        data = fo.filtering.applyFilterAndSort(elements, undefined, 'number(dev)');

        expect(data[0].number).toBe(10);
        expect(data[data.length - 1].number).toBe(0);
    });

    it("sort asc hour", function () {
        var elements = main.Subcomponents.elements;
        data = fo.filtering.applyFilterAndSort(elements, undefined, 'hour(asc)');

        expect(data[0].number).toBe(0);
        expect(data[data.length - 1].number).toBe(10);
    });

    it("sort dec hour", function () {
        var elements = main.Subcomponents.elements;
        data = fo.filtering.applyFilterAndSort(elements, undefined, 'hour(dev)');

        expect(data[0].number).toBe(10);
        expect(data[data.length - 1].number).toBe(0);
    });


});