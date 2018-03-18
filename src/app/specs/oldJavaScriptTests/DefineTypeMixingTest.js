/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.js" />

describe("Foundry: Define Type Mixing", function () {

    beforeEach(function () {

        fo.establishType('define::Person', {
            "event": "224455",
            "lastName": "<string>",
            "firstName": "<string>",
            "genderCode": "<string>",
        });

        fo.establishType('define::Place', {
            "event": "224455",
            "addressLine": "722 CRESCENT AVE",
            "city": "SAN FRANCISCO",
            "stateCode": "CA",
            "countryCode": "US",
            "postalCode": "94080",
            "addressResolution": '<Resolvedaddress>'
        });

        fo.establishType('define::Event', {
            "event": "224455",
            "createDate": "1/15/2014",
            "examDate": "1/14/2014 13:35",
            "reviewType": "",
            "amscoEntity": "",
            "status": "CLOSED",
            "disposition": "AMSCO- NOT DISPOSITIONED",
            "dispositionCategory": "AMSCO",
        });

    });

    it("should be able to duplicate a type", function () {

        var make = fo.createNewType('mixed::Event', ['define::Event']);
  
        expect(fo.mixed).toBeDefined();

        var result1 = fo.define.newEvent();
        var result2 = fo.mixed.newEvent();
        expect(result1.createDate).toEqual(result1.createDate);
    });


    it("should be able extract value from parent", function () {

        var model = fo.makeComponent({event: 'superbowl'});
        expect(model.event).toEqual('superbowl');

        var spec = {
            event: fo.fromParent,
        };

        var child = fo.makeComponent(spec);
        expect(child.myParent).toBeUndefined();

        model.capture(child);
        expect(child.myParent).toBeDefined();
        expect(child.myParent).toEqual(model);

        expect(child.event).toEqual('superbowl');
    });

    it("should be able extract value from parent that is NOT a component", function () {

        var model = { event: 'superbowl' };
        expect(model.event).toEqual('superbowl');

        var spec = {
            event: fo.fromParent,
        };

        var child = fo.makeComponent(spec);
        expect(child.myParent).toBeUndefined();

        child.myParent = model;
        //child._event.smash();

        expect(child.myParent).toBeDefined();
        expect(child.myParent).toEqual(model);

        expect(child.event).toEqual('superbowl');
    });

    it("should be throw exception if parent does not exist", function () {

        var spec = {
            event: fo.fromParent,
        };

        var child = fo.makeComponent(spec);
        expect(child.myParent).toBeUndefined();

        try {
            child.event;
        } catch (ex) {
            expect(ex.message).toEqual('the property event does not have a parent');
        }
    });

    it("should throw exception if property is not found", function () {

        var model = fo.makeComponent({ event: 'superbowl' });
        expect(model.event).toEqual('superbowl');

        var spec = {
            myEvent: fo.fromParent,
        };

        var child = fo.makeComponent(spec);
        model.capture(child);

        var child = fo.makeComponent(spec);
        try {
            child.myEvent;
        } catch (ex) {
            expect(ex.message).toEqual('the property myEvent does not have a parent');
        }
    });

    //it("can be defered version 1", function () {
    //    var deferred = Q.defer();
    //    var p = deferred.promise;

    //    deferred.resolve(1);
    //    p.then(function (result) {
    //        expect(result).toEqual(1);
    //    })

    //});

    //it("can be defered version 2", function () {
    //    var deferred = Q.defer();
    //    var p = deferred.promise;

    //    p.then(function (result) {
    //        expect(result).toEqual(2);
    //    })
    //    deferred.resolve(2);

    //});

    //it("can be defered version 3", function () {
    //    var item = Q(100);


    //    item.then(function (result) {
    //        expect(result).toEqual(100);
    //    })

    //});


  
});