/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Scripts/moment.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />

/// <reference path="../Foundry/Foundry.rules.filtering.js" />


describe("Sort: for each", function () {
    var list;
    var data;

    beforeEach(function () {
        list = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        var i = 0;

        var documents = list.map(function (item) {
            var hour = i; i++;
            var time = new moment();
            return {
                name: item,
                number: hour,
                hour: time.add('h', hour),
            }
        });

        data = {
            fname : 'steve',
            age: 100,
            documents: documents,
            lname : 'strong'
        }

        fo.filtering.registerForEach('docName', 'documents:name');
        fo.filtering.registerForEach('docNumber', 'documents:name');
    });


    //it("sort into arrays as well", function () {
    //    expect(data.documents.length).toBe(11);

    //    var docs = fo.filtering.applyFilter(data, 'docName(z)');
    //    expect(docs.length).toBe(1);

    //});



});