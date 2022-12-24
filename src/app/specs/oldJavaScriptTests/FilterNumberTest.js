/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />
/// <reference path="../Scripts/moment.min.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../ViewModels/FiltersAndSortsVM.js" />
/// <reference path="../Foundry/Foundry.rules.filtering.js" />


describe("Filter: objects by number", function () {

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
                bool:  i % 2 != 0,
                number: hour,
                hour: time.add('h', hour),
            }
        });

        data = fo.filtering.applySort(data, 'name(asc)');
    });

    it("be able to get numbers less than or equal 5", function () {
        expect(data.length).toBe(11);
        expect(data.length).toBe(list.length);

        var array1 = data.filter(function (item) {
            return item.number <= 5;
        });

        expect(array1.length).toBe(6);

        var array2 = fo.filtering.applyFilter(data, 'number[:5]')
        expect(array2.length).toBe(6);

    });


    it("be able to get numbers greater than or equal 7", function () {
        expect(data.length).toBe(11);
        expect(data.length).toBe(list.length);

        var array1 = data.filter(function (item) {
            return item.number >= 7;
        });

        expect(array1.length).toBe(4);

        var array2 = fo.filtering.applyFilter(data, 'number[7:]')
        expect(array2.length).toBe(4);

    });

    it("be able to get numbers between 5 and 7 inclusive", function () {
        expect(data.length).toBe(11);
        expect(data.length).toBe(list.length);

        var array1 = data.filter(function (item) {
            return item.number >= 5 && item.number <= 7;
        });

        expect(array1.length).toBe(3);

        var array2 = fo.filtering.applyFilter(data, 'number[5:7]')
        expect(array2.length).toBe(3);

    });

    it("be able to get numbers exactly 5", function () {

        var array1 = data.filter(function (item) {
            return item.number == 5;
        });

        expect(array1.length).toBe(1);

        var array2 = fo.filtering.applyFilter(data, 'number[5:5]')
        expect(array2.length).toBe(1);

    });

    it("be able to get numbers exactly 5 alternative", function () {

        var array1 = fo.filtering.applyFilter(data, 'number[5]')
        expect(array1.length).toBe(1);

        var array2 = fo.filtering.applyFilter(data, 'number(5)')
        expect(array2.length).toBe(1);

    });

    it("be able to get numbers exactly !5 alternative", function () {

        var list = data.filter(function (item) {
            return item.number != 5;
        });

        expect(list.length).toBe(data.length-1);


        var array1 = fo.filtering.applyFilter(data, 'number![5]')
        expect(array1.length).toBe(10);

        var array2 = fo.filtering.applyFilter(data, 'number!(5)')
        expect(array2.length).toBe(10);

    });

    it("be able to get bool exactly true", function () {

        var list = data.filter(function (item) {
            return item.bool;
        });

        expect(list.length).toBe(6);

        var array1 = fo.filtering.applyFilter(data, 'bool[true]')
        expect(array1.length).toBe(6);

        var array2 = fo.filtering.applyFilter(data, 'bool(true)')
        expect(array2.length).toBe(6);

    });


    it("be able to get bool exactly !true", function () {

        var list = data.filter(function (item) {
            return !item.bool;
        });

        expect(list.length).toBe(5);

        var array1 = fo.filtering.applyFilter(data, 'bool![true]')
        expect(array1.length).toBe(5);

        var array2 = fo.filtering.applyFilter(data, 'bool!(true)')
        expect(array2.length).toBe(5);

    });

});