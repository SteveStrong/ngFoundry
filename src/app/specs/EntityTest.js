/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Foundry/Foundry.adaptor.js" />

describe("Foundry: Semantic Model System", function () {

    var completeData = [
        {
            "event": "224455",
            "createDate": "1/15/2014",
            "examDate": "1/14/2014 13:35",
            "lastName": "NANA",
            "firstName": "MOHAMED",
            "genderCode": "M",
            "dob": "10/1/1975",
            "birthCountryCode": "US",
            "citizenshipCountryCode": "US",
            "travelDocumentType": "PASSPORT",
            "travelDocumentNumber": "485322158",
            "issuingCountryCode": "US",
            "addressLine": "722 CRESCENT AVE",
            "city": "SAN FRANCISCO",
            "stateCode": "CA",
            "countryCode": "US",
            "postalCode": "94080",
            "reviewType": "",
            "amscoEntity": "",
            "dutyAssigmnetOffice": "",
            "dutyAssignmentSiteCode": "",
            "personType": "TSDB",
            "scopeOfDuty": "",
            "eod": "",
            "hashId": "",
            "ssn": "",
            "plateNumber": "",
            "plateState": "",
            "referredToJIC": "",
            "subject": "",
            "status": "CLOSED",
            "disposition": "AMSCO- NOT DISPOSITIONED",
            "dispositionCategory": "AMSCO",
            "addressResolution": {
                "position": [
                   -122.414535,
                   37.734591
                ],
                "resolution": "PRECISE",
                "formattedAddress": "722 Crescent Avenue, San Francisco, CA 94110, USA"
            }
        },
    ];


    fo.establishType('Test::Person', {
        "event": "224455",
        "lastName": "<string>",
        "firstName": "<string>",
        "genderCode": "<string>",
    });


    fo.establishType('Test::ResolvedAddress', {
        "position": [
                   0,
                   0
        ],
        "resolution": "<string>",
        "formattedAddress": "<string>"
    });

    fo.establishType('Test::Place', {
        "event": "224455",
        "addressLine": "722 CRESCENT AVE",
        "city": "SAN FRANCISCO",
        "stateCode": "CA",
        "countryCode": "US",
        "postalCode": "94080",
        "addressResolution": '<Resolvedaddress>'
    });


    fo.establishType('Test::Event', {
        "event": "224455",
        "createDate": "1/15/2014",
        "examDate": "1/14/2014 13:35",
        "reviewType": "",

        "status": "CLOSED",

    });

    beforeEach(function () {
    });



    it("create instance and check type", function () {
        var event = fo.Test.newEvent();
        expect(event.isType('Test::Event')).toBe(true);
        expect(event.isOfType('Event')).toBe(true);
    });

    it("create instance and check values", function () {
        var person = fo.Test.newPerson();
        expect(person.isOfType('Person')).toBe(true);
        expect(person.lastName.matches('<string>')).toBe(true);
    });

    it("create instance using mixin", function () {
        var data = {
            "event": "224455",
            "createDate": "1/15/2014",
            "examDate": "1/14/2014 13:35",
            "lastName": "NANA",
            "firstName": "MOHAMED",
            "genderCode": "M",
        }       
        
        var person = fo.Test.newPerson(data);
        expect(person.isOfType('Person')).toBe(true);
        expect(person.lastName.matches('NANA')).toBe(true);

        expect(person.event.matches('224455')).toBe(true);
    });

    it("should be also to extract defined attributes", function () {
        var data = {
            "event": "224455",
            "createDate": "1/15/2014",
            "examDate": "1/14/2014 13:35",
            "lastName": "NANA",
            "firstName": "MOHAMED",
            "genderCode": "M",
            "dob": "10/1/1975",
            "birthCountryCode": "US",
            "citizenshipCountryCode": "US",
            "travelDocumentType": "PASSPORT",
            "travelDocumentNumber": "485322158",
            "issuingCountryCode": "US",
            "addressLine": "722 CRESCENT AVE",
            "city": "SAN FRANCISCO",
            "stateCode": "CA",
            "countryCode": "US",
            "postalCode": "94080",
            "reviewType": "",
        }


        var extract = fo.extractSpec('Test::Person', data);

        expect(extract.isOfType).toBeUndefined();
        expect(extract.lastName.matches('NANA')).toBe(true);

        expect(extract.countryCode).toBeUndefined();

        var person = fo.newInstanceExtract('Test::Person', data);
        expect(person.isOfType).toBeDefined();
        expect(person.isOfType('Person')).toBe(true);
        expect(person.lastName.matches('NANA')).toBe(true);

        expect(person.countryCode).toBeUndefined();
    });

    it("should be also to construct extracted instance", function () {
        var data = {
            "event": "224455",
            "createDate": "1/15/2014",
            "examDate": "1/14/2014 13:35",
            "lastName": "NANA",
            "firstName": "MOHAMED",
            "genderCode": "M",
            "dob": "10/1/1975",
            "birthCountryCode": "US",
            "citizenshipCountryCode": "US",
            "travelDocumentType": "PASSPORT",
            "travelDocumentNumber": "485322158",
            "issuingCountryCode": "US",
            "addressLine": "722 CRESCENT AVE",
            "city": "SAN FRANCISCO",
            "stateCode": "CA",
            "countryCode": "US",
            "postalCode": "94080",
            "reviewType": "",
            "addressResolution": {
                "position": [
                   -122.414535,
                   37.734591
                ],
                "resolution": "PRECISE",
                "formattedAddress": "722 Crescent Avenue, San Francisco, CA 94110, USA"
            }
        }


        var personWithExtra = fo.Test.newPerson(data);
        var personOnly = fo.Test.newPersonExtract(data);

        expect(personWithExtra.isOfType('Person')).toBe(true);
        expect(personOnly.isOfType('Person')).toBe(true);

        expect(personWithExtra.countryCode.matches('US')).toBe(true);
        expect(personOnly.countryCode).toBeUndefined();

        var addressOnly = fo.Test.newResolvedAddressExtract(data.addressResolution);
        expect(addressOnly.isOfType('ResolvedAddress')).toBe(true);
    });



    it("should be able to define a simple oneway linksTo relationship", function () {
        
        var type = fo.establishType('Test::Person');
        var relateLinksTo = fo.establishRelation('linksTo');

        var person1 = fo.Test.newPerson();
        var person2 = fo.Test.newPerson();
        relateLinksTo(person1, person2);

        expect(person1.isOfType('Person')).toBe(true);
        expect(person2.isOfType('Person')).toBe(true);

        expect(person1.linksTo.count).toBe(1);
        expect(person1.linksTo.elements[0]).toBe(person2);
        expect(person2.linksTo).toBeUndefined();

    });

    it("should be able to unrelate a simple oneway linksTo relationship", function () {

        var type = fo.establishType('Test::Person');
        var relateLinksTo = fo.establishRelation('linksTo');

        var person1 = fo.Test.newPerson();
        var person2 = fo.Test.newPerson();
        relateLinksTo(person1, person2);

        expect(person1.linksTo.count).toBe(1);
        expect(person1.linksTo.elements[0]).toBe(person2);
        expect(person2.linksTo).toBeUndefined();

        //undoing the only member will delete the relation
        relateLinksTo.unDo(person1, person2);
        expect(person1.linksTo).toBeUndefined();
        expect(person2.linksTo).toBeUndefined();

    });

    it("should be able to define a twoway hasBrother|hasSister relationship", function () {

        var type = fo.establishType('Test::Person');
        var relateLinksTo = fo.establishRelationship('hasBrother', 'hasSister');

        var person1 = fo.Test.newPerson();
        var person2 = fo.Test.newPerson();
        relateLinksTo(person1, person2, true); //apply inverse as well

        expect(person1.isOfType('Person')).toBe(true);
        expect(person2.isOfType('Person')).toBe(true);

        expect(person1.hasBrother.count).toBe(1);
        expect(person2.hasSister.count).toBe(1);

        expect(person1.hasBrother.elements[0]).toBe(person2);
        expect(person2.hasSister.elements[0]).toBe(person1);

    });

    it("should be able to unrelate a twoway hasBrother|hasSister relationship", function () {

        var type = fo.establishType('Test::Person');
        var relateLinksTo = fo.establishRelationship('hasBrother', 'hasSister');

        var person1 = fo.Test.newPerson();
        var person2 = fo.Test.newPerson();
        relateLinksTo(person1, person2, true); //apply inverse as well


        expect(person1.hasBrother.count).toBe(1);
        expect(person2.hasSister.count).toBe(1);

        expect(person1.hasBrother.elements[0]).toBe(person2);
        expect(person2.hasSister.elements[0]).toBe(person1);

        relateLinksTo.unDo(person1, person2, true); //apply inverse as well


        expect(person1.hasBrother).toBeUndefined();
        expect(person2.hasSister).toBeUndefined();
    });

});