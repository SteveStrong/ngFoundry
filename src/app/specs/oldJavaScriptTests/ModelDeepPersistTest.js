/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />
/// <reference path="../Foundry/Foundry.js" />

(function (namespace, fo, undefined) {

    function formatNull(text) {
        if (text == 'null') return '';
        return text ? text : '';
    }

    function ns(name) {
        return "{0}::{1}".format(namespace, name);
    }

    fo.establishType(ns('travelDocument'), {
        "id": "<string>",
        "type": "<string>",
        "number": "<string>",
        "countryCode": "<string>",
    });

    fo.establishType(ns('itinerary'), {
        "id": "<string>",
        "airlineCode": "<string>",
        "flightNumber": "<string>",
    });

    fo.establishType(ns('conveyance'), {
        "id": "<string>",
        "type": "<string>",
        "bodyStyle": "<string>",
        "vin": "<string>",
        "plateNumber": "<string>",
        "plateState": "<string>",
        "plateCountry": "<string>",
    });

    fo.establishType(ns('location'), {
        type: "<string>",
        address: "<address>",
        position: [0, 0],
        resolution: "<string>",
        resolutionKey: "<string>",
        range: 100000,
        isInBox: function () {
            var pos = this.position;
            if (!pos) return function () {
                return false;
            }

            return function (UL, LR) {
                //goto to do better with the math
                if (pos[0] < UL[0]) return false;
                if (pos[0] > LR[0]) return false;

                if (pos[1] > UL[1]) return false;
                if (pos[1] < LR[1]) return false;

                return true;
            }
        },


        entityHeader1: function () {
            return this.type;
        },
        entityHeader2: function () {
            return this.address && this.address.fullAddress;
        },

        mapIconLabel: function () {
            return this.id;
        },
        mapIcon: function () {
            name = 'HouseBlue';
            return name;
        },
        mapIconScale: function () {
            return this.isSelected ? 1.7 : 1.0;
        },

    });

    fo.establishType(ns('address'), {
        addressLine: "<string>",
        city: "<string>",
        state: "<state>",
        countryCode: "<country>",
        postalCode: "<postalCode>",

        line1: function () {
            return formatNull(this.addressLine);
        },
        line2: function () {
            return "{0},{1} {2} {3}".format(formatNull(this.city), formatNull(this.state), formatNull(this.country), formatNull(this.postalCode));
        },

        fullAddress: function () {
            return this.line1 + ' ' + this.geographic.line2;
        },
    })



    fo.establishType(ns('person'), {
        id: "<string>",
        type: "<string>",
        personType: "<string>",
        "hashId": "<string>",

        nuinList: "<string>[]",
        tscidList: "<string>[]",
        travelerIdList: "<string>[]",

        travelDocumentList: "<travelDocument>[]",
        itineraryList: "<itinerary>[]",

        fullName: function () {
            return this.biographic && this.biographic.fullName;
        },

        fullAddress: function () {
            return this.geographic && this.geographic.fullAddress;
        },

        biographic: function () {
            return this.getSubcomponent('biographic');
        },
        geographic: function () {
            return this.getSubcomponent('geographic');
        },

        entityHeader1: function () {
            return this.fullName;
        },
        entityHeader2: function () {
            return this.fullAddress;
        },

        mapIconLabel: function () {
            return this.id;
        },
        mapIcon: function () {
            var name = 'map_precise';
            return name;
        },
        mapIconScale: function () {
            return this.isSelected ? 1.7 : 1.0;
        },
    });

    fo.establishType(ns('biographic'), {

        firstName: '<string>',
        lastName: '<string>',

        "ssn": "<string>",

        age: '<string>',
        genderCode: '<string>',


        birthCountryCodeList: '<birthCountryCode>[]',
        citizenshipCountryCodeList: '<citizenshipCountryCode>[]',

        phoneNumberList: '<phoneNumber>[]',
        emailAddressList: '<emailAddress>[]',

        "dobList": "<date>[]",

        fullName: function () {
            return this.lastName + ', ' + this.firstName;
        },
        gender: function () {
            return this.genderCode || 'U';
        },

    });

    fo.establishType(ns('geographic'), {
        //locationList: '<location>[]',

        fullAddress: function () {
            return this.locationList && locationList[0].fullAddress;
        },
        isInBox: function () {
            var locations = this.locationList;
            if (!fo.utils.isArray(locations)) return function () {
                return false;
            }

            return function (UL, LR) {
                //goto to do better with the math
                var isInside = true;
                locations.forEach(function (location) {
                    isInside = location.isInBox(UL, LR) && isInside;
                });
                return isInside;
            }
        },
    });


    fo.establishType(ns('event'), {
        id: "<string>",
        type: "<string>",
        status: "<string>",
        eventType: "<string>",

        createdBy: '<string>',
        createDate: "<date>",
        createdPort: '<string>',

        requestingPort: '<string>',
        priority: '<string>',
        direction: "<string>",
        modeOfEntry: "<string>",

        assignedUser: '<string>',
        assignedPort: '<string>',
        assignedUnit: '<string>',


        //locationList: '<location>[]',


        entityHeader1: function () {
            return this.status;
        },
        entityHeader2: function () {
            return this.reviewType;
        },

        mapIconLabel: function () {
            return this.id;
        },
        mapIcon: function () {
            var name = 'map_epicenter';
            name = 'StarRed';
            return name;
        },
        mapIconScale: function () {
            return this.isSelected ? 1.7 : 1.0;
        },
        geographic: function () {
            return this.getSubcomponent('geographic');
        },
    });

    fo.establishType(ns('block'), {
        height: 1,
        width: 2,
        baseArea: function () { return this.width * this.height },
        depth: 3,
        side1Area: function () { return this.width * this.depth },
        side2Area: function () { return this.height * this.depth },
        volume: function () { return this.baseArea * this.depth },
        surfaceArea: function () { return 2.0 * this.baseArea + 2.0 * this.side1Area + 2.0 * this.side2Area },
        otherPart: {}
    });

}('ModelDeepPersist', Foundry));


describe("Foundry: Model DEEP Persist", function () {


    beforeEach(function () {
        //should through an exception because we change with is registered
        try {
        }
        catch (ex) { }
    });

    it("should a simple constructor", function () {
        var block = fo.ModelDeepPersist.newBlock();
        expect(block.height).toEqual(1);
        expect(block.width).toEqual(2);
        expect(block.depth).toEqual(3);
        expect(block.volume).toEqual(3 * 2 * 1);
    });

     
    it("should be able to create a workspace", function () {
        var space = fo.ws.makeModelWorkspace('steve')
        expect(space).toBeDefined();
        expect(space.rootModel).toBeDefined();
    })

    it("should be able catch an exception in the tester", function () {
        try {
            throw new Error('exception catch me')
        }
        catch (ex) {
            expect(ex.message).toEqual('exception catch me');
        }
    })


    it("should be able to create a simple payload", function () {

        var space = fo.ws.makeModelWorkspace('steve');
        var model = space.rootModel;
        expect(model).toBeDefined();

        var block = fo.ModelDeepPersist.newBlock({
            depth: 5,
        });

        model.capture(block);
        expect(block.volume).toEqual(5 * 2 * 1);

        try{
            var payload = space.currentModelToPayload()
            expect(payload).toBeDefined();
        }
        catch (ex) {
            expect(ex).toBeUndefined();
        }
    });


    it("should be able to create a compound payload", function () {

        var space = fo.ws.makeModelWorkspace('steve');
        var model = space.rootModel;
        expect(model).toBeDefined();

        var make = fo.ModelDeepPersist.newBlock;

        var block = make();

        model.capture(block);
        block.capture(make(), 'subBlock');


        try {
            var payload = space.currentModelToPayload()
            expect(payload).toBeDefined();
        }
        catch (ex) {
            expect(ex).toBeUndefined();
        }
    });

    it("should be able to create a circular payload", function () {

        var space = fo.ws.makeModelWorkspace('steve');
        var model = space.rootModel;
        expect(model).toBeDefined();

        var make = fo.ModelDeepPersist.newBlock;

        var block = make();
        var subBlock = make();

        model.capture(block);
        block.capture(subBlock, 'subBlock');

        //circ is not defined so it does not get searialize
        block.circ = subBlock;


        try {
            var payload = space.currentModelToPayload()
            expect(payload).toBeDefined();
        }
        catch (ex) {
            expect(ex).toBeUndefined();
        }
    });

    it("should be able to create a relationship payload", function () {

        var space = fo.ws.makeModelWorkspace('steve');
        var model = space.rootModel;
        expect(model).toBeDefined();

        //a relationship is established by matching two key fields
        var relation = fo.establishRelationship('toTheLeft|toTheRight');

        var make = fo.ModelDeepPersist.newBlock;

        var blockLeft = make({ height: 30 });
        var blockRight = make({ width: 30 });

        model.capture(blockLeft);
        model.capture(blockRight);

        //circ is not defined so it does not get searialize
        relation(blockLeft,blockRight, true)

        try {
            var payload = space.currentModelToPayload()
            expect(payload).toBeDefined();
        }
        catch (ex) {
            expect(ex).toBeUndefined();
        }
    });

    it("should be able to create a circular payload if pointer is set", function () {

        var space = fo.ws.makeModelWorkspace('steve');
        var model = space.rootModel;
        expect(model).toBeDefined();

        var make = fo.ModelDeepPersist.newBlock;

        var block1 = make();
        var block2 = make();

        model.capture(block1);
        model.capture(block2);

        //circ is not defined so it does not get searialize
        block1.otherPart = block2;
        block2.otherPart = block1;


        try {
            var payload = space.currentModelToPayload()
            expect(payload).toBeDefined();
        }
        catch (ex) {
            expect(ex).toBeUndefined();
        }
    });


    var eventData = {
        "createDate": "2014-07-15 14:35:53.784",
        "type": "EVENT",
        "locationList": [
           {
               "address": {
                   "addressLine": "24 WHITON CT",
                   "city": "HANOVER",
                   "state": "MASSACHUSETTS",
                   "countryCode": "US",
                   "postalCode": "02339-3108"
               },
               "position": [
                  -70.89439796,
                  42.15148925
               ],
               "type": "U.S. Address",
               "id": "415843"
           },
           {
               "address": {
                   "addressLine": "55 WOODCREST DR",
                   "city": "CHICOPEE",
                   "state": "MASSACHUSETTS",
                   "countryCode": "US",
                   "postalCode": "01020-2051"
               },
               "position": [
                  -72.58256065,
                  42.18144338
               ],
               "type": "Checkpoint",
               "id": "415869"
           }
        ],
        "tfEntityList": [
           {
               "nuinList": [
                  "4565464"
               ],
               "lastName": "SMITH",
               "firstName": "JIM",
               "dobList": [
                  "7/16/1966"
               ],
               "genderCode": "M",
               "birthCountryCodeList": [
                  "US"
               ],
               "lookoutList": [
                  {
                      "type": "TSDB",
                      "matchType": "POSITIVE"
                  },
                  {
                      "type": "TSDB CARGO",
                      "matchType": "POSITIVE"
                  },
                  {
                      "type": "TSDB CIS/ICE",
                      "matchType": "POSITIVE"
                  }
               ],
               "ipAddressList": [
                  "4565464"
               ],
               "maritalStatus": "SEPARATED",
               "personType": "CARGO",
               "type": "PERSON",
               "id": "809813",
               "locationList": [
                  {
                      "address": {
                          "addressLine": "57 CEDAR ST",
                          "city": "WOBURN",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "01801-2148"
                      },
                      "position": [
                         -71.122414,
                         42.497421
                      ],
                      "type": "Permanent Residence",
                      "id": "415871"
                  },
                  {
                      "address": {
                          "addressLine": "57 CEDAR ST",
                          "city": "WOBURN",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "01801-2148"
                      },
                      "position": [
                         -71.122414,
                         42.497421
                      ],
                      "type": "Permanent Residence",
                      "id": "415871"
                  },
                  {
                      "address": {
                          "addressLine": "57 CEDAR ST",
                          "city": "WOBURN",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "01801-2148"
                      },
                      "position": [
                         -71.122414,
                         42.497421
                      ],
                      "type": "Permanent Residence",
                      "id": "415871"
                  }
               ]
           },
           {
               "nuinList": [
                  "546546544",
                  "46546654",
                  "6845155"
               ],
               "lastName": "SMITH",
               "firstName": "JOHNSON",
               "middleName": "J",
               "dobList": [
                  "7/15/1981"
               ],
               "genderCode": "U",
               "birthCountryCodeList": [
                  "US"
               ],
               "travelDocumentList": [
                  {
                      "type": "I-94",
                      "number": "3287878972",
                      "countryCode": "US",
                      "id": "968961"
                  },
                  {
                      "type": "I-94",
                      "number": "3287878972",
                      "countryCode": "US",
                      "id": "968961"
                  },
                  {
                      "type": "I-94",
                      "number": "3287878972",
                      "countryCode": "US",
                      "id": "968961"
                  },
                  {
                      "type": "I-94",
                      "number": "3287878972",
                      "countryCode": "US",
                      "id": "968961"
                  },
                  {
                      "type": "I-94",
                      "number": "3287878972",
                      "countryCode": "US",
                      "id": "968961"
                  },
                  {
                      "type": "I-94",
                      "number": "3287878972",
                      "countryCode": "US",
                      "id": "968961"
                  }
               ],
               "lookoutList": [
                  {
                      "type": "TSDB",
                      "matchType": "POSITIVE"
                  },
                  {
                      "type": "TSDB CARGO",
                      "matchType": "POSITIVE"
                  },
                  {
                      "type": "TSDB CIS/ICE",
                      "matchType": "POSITIVE"
                  }
               ],
               "ipAddressList": [
                  "546546544",
                  "46546654",
                  "6845155"
               ],
               "maritalStatus": "MARRIED",
               "personType": "TSDB",
               "type": "PERSON",
               "id": "809799",
               "locationList": [
                  {
                      "address": {
                          "addressLine": "886 CENTRE STBLDG 7",
                          "city": "NEWTON CENTRE",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "02459-1234"
                      },
                      "position": [
                         -71.19204385,
                         42.34165
                      ],
                      "type": "Service",
                      "id": "415870"
                  },
                  {
                      "address": {
                          "addressLine": "96 CONTENT ST",
                          "city": "SOMERSET",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "02725-2109"
                      },
                      "position": [
                         -71.166787,
                         41.725555
                      ],
                      "type": "Home",
                      "id": "415844"
                  },
                  {
                      "address": {
                          "addressLine": "886 CENTRE STBLDG 7",
                          "city": "NEWTON CENTRE",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "02459-1234"
                      },
                      "position": [
                         -71.19204385,
                         42.34165
                      ],
                      "type": "Service",
                      "id": "415870"
                  },
                  {
                      "address": {
                          "addressLine": "96 CONTENT ST",
                          "city": "SOMERSET",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "02725-2109"
                      },
                      "position": [
                         -71.166787,
                         41.725555
                      ],
                      "type": "Home",
                      "id": "415844"
                  },
                  {
                      "address": {
                          "addressLine": "886 CENTRE STBLDG 7",
                          "city": "NEWTON CENTRE",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "02459-1234"
                      },
                      "position": [
                         -71.19204385,
                         42.34165
                      ],
                      "type": "Service",
                      "id": "415870"
                  },
                  {
                      "address": {
                          "addressLine": "96 CONTENT ST",
                          "city": "SOMERSET",
                          "state": "MASSACHUSETTS",
                          "countryCode": "US",
                          "postalCode": "02725-2109"
                      },
                      "position": [
                         -71.166787,
                         41.725555
                      ],
                      "type": "Home",
                      "id": "415844"
                  }
               ]
           }
        ],
        "status": "OPEN",
        "id": "841894",
        "createdBy": "kingman",
        "createdPort": "9900",
        "requestingPort": "0114",
        "priority": "MEDIUM",
        "modeOfEntry": "IST-Inspections - Truck",
        "direction": "INBOUND",
        "assignedUser": "kingman",
        "assignedPort": "9900",
        "internalRemarks": "Test from Visualization team.",
        "assignedUnit": "OIT"
    }

    it("should be able to create a a payload for an event entity", function () {

        var space = fo.ws.makeModelWorkspace('steve');
        var model = space.rootModel;
        expect(model).toBeDefined();

        var makeEvent = fo.ModelDeepPersist.newEventExtract;
        var makePerson = fo.ModelDeepPersist.newPersonExtract;
        var makeLocation = fo.ModelDeepPersist.newLocationExtract;
        var makeAddress = fo.ModelDeepPersist.newAddressExtract;


        var event = makeEvent(eventData);
        model.capture(event);
        
        if (eventData.locationList) {

            var geo = fo.ModelDeepPersist.newGeographicExtract(eventData);
            event.capture(geo, 'geographic');


            var list = eventData.locationList.map(function (item) {
                var location = makeLocation(item)
                location.address = makeAddress(item.address);
                geo.capture(location);
                location.address.myParent = geo;
                return location;
            });

            geo.locationList = list;
        }

        if (eventData.tfEntityList) {
            eventData.tfEntityList.forEach(function (entity) {
                if (entity.type.matches('person')) {
                    var person = makePerson(entity);
                    model.capture(person);

                    if (entity.locationList) {
                        entity.locationList.forEach(function (location) {
                            person.capture(makeLocation(location));
                        });
                    }
                }
            });
        }


        try {
            var payload = space.currentModelToPayload()
            expect(payload).toBeDefined();

            var result = space.payloadToCurrentModel(payload);
            expect(result).toBeDefined();

            var model = space.rootModel;
            expect(model).toBeDefined();
        }
        catch (ex) {
            expect(ex).toBeUndefined();
        }
    });
 
});