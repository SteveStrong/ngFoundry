/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Scripts/moment.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

/// <reference path="../Foundry/Foundry.rules.filtering.js" />


describe("Grouping: ", function () {
    var listOfStrings;
    var listOfObjects;



    beforeEach(function () {
        listOfStrings = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

        var i = 0;
        listOfObjects = listOfStrings.map(function (item) {
            return {
                name: item,
                index: i++,
                cat1: item.charAt(0).toUpperCase(),
                cat2: item.charAt(item.length-1).toUpperCase(),
            };
        });
    });


    it("group should be able to collect strings by first character", function () {

        var group = listOfStrings.groupBy(function (item) {
            return item.charAt(0);
        });

        var set = Object.keys(group);
        expect(group.t.length).toBe(3);
        expect(set.length).toBe(7);
    });

    it("group register function 'firstLetter' ", function () {

        fo.filtering.registerGroup('firstLetter', function (item) {
            return item.charAt(0);
        });

        var group = fo.filtering.applyGrouping(listOfStrings, 'firstLetter');

        var set = Object.keys(group);
        expect(group.t.length).toBe(3);
        expect(set.length).toBe(7);
    });

    it("group should be able to collect strings by last character", function () {

        var group = listOfStrings.groupBy(function (item) {
            return item.charAt(item.length-1);
        });

        var set = Object.keys(group);
        expect(group['e'].length).toBe(4);
        expect(set.length).toBe(6);
    });

    it("group register function 'lastLetter' ", function () {

        fo.filtering.registerGroup('firstLetter', function (item) {
            return item.charAt(0);
        });
        fo.filtering.registerGroup('lastLetter', function (item) {
            return item.charAt(item.length - 1);
        });

        var group = fo.filtering.applyGrouping(listOfStrings, 'lastLetter');

        var set = Object.keys(group);
        expect(group['e'].length).toBe(4);
        expect(set.length).toBe(6);
    });

    it("group by property 'cat1' ", function () {

        var group = fo.filtering.applyGrouping(listOfObjects, 'cat1');

        var set = Object.keys(group);
        expect(group['T'].length).toBe(3);
        expect(set.length).toBe(7);
    });

    it("group by property 'cat2' ", function () {

        var group = fo.filtering.applyGrouping(listOfObjects, 'cat2');

        var set = Object.keys(group);
        expect(group['E'].length).toBe(4);
        expect(set.length).toBe(6);
    });

    it("group by sorted property 'cat1' ", function () {

        var group = fo.filtering.applyFilterSortAndGrouping(listOfObjects, '', '', 'cat1')

        var set = Object.keys(group);
        expect(group['T'].length).toBe(3);
        expect(set.length).toBe(7);
    });

    it("group by property 'cat1;cat2' ", function () {

        var group = fo.filtering.applyGrouping(listOfObjects, 'cat1;cat2');

        var set = Object.keys(group);
        expect(group['E']['T'][0].name).toBe('eight');
        expect(set.length).toBe(7);
    });

    it("group by property 'cat2;cat1' ", function () {

        var group = fo.filtering.applyGrouping(listOfObjects, 'cat2;cat1');

        var set = Object.keys(group);
        expect(group['T']['E'][0].name).toBe('eight');
        expect(set.length).toBe(6);
    });


    function occurrences(string, subString, allowOverlapping) {

        string += ""; subString += "";
        if (subString.length <= 0) return string.length + 1;

        var n = 0, pos = 0;
        var step = (allowOverlapping) ? (1) : (subString.length);

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) { n++; pos += step; } else break;
        }
        return (n);
    }


    it("count occurance of letter 'z'  ", function () {

        var searchString = 'z';
        function letterCount(item) {
            var str = item.name;
            var count = occurrences(str, searchString);
            return count ? count : 0;
        }

        fo.filtering.registerSort('letterCount', letterCount);

        fo.filtering.registerGroup('letterCount', letterCount);

        var group = fo.filtering.applyFilterSortAndGrouping(listOfObjects, '', 'letterCount(a)', 'letterCount');

        var set = Object.keys(group);
        expect(group[1][0].name).toBe('zero');
        expect(set.length).toBe(2);
    });

    it("count occurance of letter 'e'  ", function () {

        var searchString = 'e';
        function letterCount(item) {
            var str = item;
            var count = occurrences(str, searchString);
            return count ? count : 0;
        }

        fo.filtering.registerSort('letterCount', letterCount);

        fo.filtering.registerGroup('letterCount', letterCount);

        var group = fo.filtering.applyFilterSortAndGrouping(listOfStrings, '', 'letterCount(a)', 'letterCount');

        var set = Object.keys(group);
        expect(group[1][0]).toBe('zero');
        expect(set.length).toBe(3);
    });

});