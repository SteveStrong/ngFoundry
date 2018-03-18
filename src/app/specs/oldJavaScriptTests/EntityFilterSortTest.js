/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.js" />

describe("Foundry: Entity Filter and Sort Test", function () {

    fo.establishType('Entity::Event', {
        createDate: "<createDate>",
        name: "<name>",
        status: "<status>",
    });

    fo.establishType('Entity::Person', {
        lastName: "<lastName>",
        firstName: "<firstName>",
        genderCode: "<genderCode>",
        name: function () {
            return this.firstName + ' ' + this.lastName;
        }
    });


    fo.establishType('Entity::Location', {
        addressLine: "<addressLine>",
        city: "<city>",
        stateCode: "<stateCode>",
        countryCode: "<countryCode>",
        address: function () {
            return '{0}, {1} {2} {3}'.format(this.addressLine, this.city, this.stateCode, this.countryCode);
        }
    });


    var model;

    var data = {
        events: [
            {
                name: 'fall',
                status: 'open',
                subSpec: [
                    {
                        firstName: 'payton',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 main st',
                                    city: 'Denver',
                                    stateCode: 'CO',
                                },
                                {
                                    addressLine: '678 market st',
                                    city: 'dallas',
                                    stateCode: 'Tx',
                                },
                            ]
                        },
                    {
                        firstName: 'eli',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 park av',
                                    city: 'new york',
                                    stateCode: 'NY',
                                },
                        ]
                    },
                ]
            },
            {
                name: 'spring',
                status: 'open',
                subSpec: [
                    {
                        firstName: 'payton',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 main st',
                                    city: 'Denver',
                                    stateCode: 'CO',
                                },
                                {
                                    addressLine: '678 main st',
                                    city: 'indianapolis',
                                    stateCode: 'IN',
                                },
                        ]
                    },
                    {
                        firstName: 'eli',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '678 market st',
                                    city: 'dallas',
                                    stateCode: 'Tx',
                                },
                        ]
                    },
                ]
            },
            {
                name: 'summer',
                status: 'closed',
                subSpec: [
                    {
                        firstName: 'payton',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 main st',
                                    city: 'Denver',
                                    stateCode: 'CO',
                                },
                                {
                                    addressLine: '678 main st',
                                    city: 'indianapolis',
                                    stateCode: 'IN',
                                },
                        ]
                    },
                    {
                        firstName: 'eli',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 park av',
                                    city: 'new york',
                                    stateCode: 'NY',
                                },
                        ]
                    },
                ]
            },
            {
                name: 'winter',
                status: 'closed',
                subSpec: [
                    {
                        firstName: 'payton',
                        lastName: 'manning',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 main st',
                                    city: 'Denver',
                                    stateCode: 'CO',
                                },
                                {
                                    addressLine: '678 main st',
                                    city: 'indianapolis',
                                    stateCode: 'IN',
                                },
                        ]
                    },
                    {
                        firstName: 'david',
                        lastName: 'tyree',
                        genderCode: 'M',
                        subSpec: [
                                {
                                    addressLine: '123 park av',
                                    city: 'new york',
                                    stateCode: 'NY',
                                },
                        ]
                    },
                    {
                        firstName: 'betty',
                        lastName: 'rubble',
                        genderCode: 'F',
                        subSpec: [
                                {
                                    addressLine: '123 park av',
                                    city: 'San Ramon',
                                    stateCode: 'CA',
                                },
                        ]
                    },
                    {
                        firstName: 'wilma',
                        lastName: 'flintstone',
                        genderCode: 'F',
                        subSpec: [
                                {
                                    addressLine: '123 park av',
                                    city: 'Los Angles',
                                    stateCode: 'CA',
                                },
                        ]
                    },
                ]
            },
        ]
    }


    beforeEach(function() {
        model = fo.makeComponent();

        data.events.forEach(function (eventData) {
            var event = fo.Entity.newEventExtract(eventData);

            eventData.subSpec.forEach(function (personData) {
                var person = fo.Entity.newPersonExtract(personData);
                event.capture(person);

                personData.subSpec.forEach(function (locationData) {
                    var location = fo.Entity.newLocationExtract(locationData);
                    person.capture(location);
                });
            });
            model.capture(event);
        })
     
    });

    it("verify counts", function () {

        var events = model.selectComponents(function (item) { return item.isOfType('Event') });
        var people = model.selectComponents(function (item) { return item.isOfType('Person') });
        var locations = model.selectComponents(function (item) { return item.isOfType('Location') });

        expect(events.count).toEqual(4);
        expect(people.count).toEqual(10);
        expect(locations.count).toEqual(14);
    });

    it("be able to filter based on root entity", function () {
        var events = model.selectComponents(function (item) { return item.isOfType('Event') });

        var filter = 'status(open)';
        var filteredEvent = fo.filtering.applyFilter(events, filter)

        expect(filteredEvent.count).toEqual(2);
    });

    it("be able to filter based on parent entity", function () {
        var person = model.selectComponents(function (item) { return item.isOfType('Person') });

        var filter = 'firstName(david)';
        var filteredPeople = fo.filtering.applyFilter(person, filter)

        expect(filteredPeople.count).toEqual(1);
    });

    it("be able to filter based on child entity", function () {
        var location = model.selectComponents(function (item) { return item.isOfType('Location') });

        var filter = 'stateCode(tx)';
        var filteredLocation = fo.filtering.applyFilter(location, filter)

        expect(filteredLocation.count).toEqual(2);

        filteredLocation = fo.filtering.applyFilter(location, 'city(denver)')
        expect(filteredLocation.count).toEqual(4);

    });


    it("be able to find the parents of the results", function () {
        var location = model.selectComponents(function (item) { return item.isOfType('Location') });

        var filteredLocation = fo.filtering.applyFilter(location, 'stateCode(tx)')
        expect(filteredLocation.count).toEqual(2);

        var parents = filteredLocation.mapCollectNoDupe(function (item) {
            var rootParent = item.findParentWhere(function (parent) { return parent.isOfType('Event') });
            return rootParent;
        });

        expect(parents.count).toEqual(2);
    });


    it("be able to find the distinct parents of the results", function () {
        var location = model.selectComponents(function (item) { return item.isOfType('Location') });

        var filteredLocation = fo.filtering.applyFilter(location, 'stateCode(ca)')
        expect(filteredLocation.count).toEqual(2);

        var parents = filteredLocation.mapCollectNoDupe(function (item) {
            var rootParent = item.findParentWhere(function (parent) { return parent.isOfType('Event') });
            return rootParent;
        });

        expect(parents.count).toEqual(1);
    });

    it("be able to find the same result fromt distinct parents", function () {
        var location = model.selectComponents(function (item) { return item.isOfType('Location') });

        var filteredLocation = fo.filtering.applyFilter(location, 'stateCode(ca)')
        expect(filteredLocation.count).toEqual(2);

        var parents = filteredLocation.mapCollectNoDupe(function (item) {
            var rootParent = item.findParentWhere(function (parent) { return parent.isOfType('Event') });
            return rootParent;
        });

        expect(parents.count).toEqual(1);

        var singleLocation = parents.selectComponents(function (item) { return item.isOfType('Location') });
        var filteredLocation = fo.filtering.applyFilter(location, 'stateCode(ca)')
        expect(filteredLocation.count).toEqual(2);

    });

});