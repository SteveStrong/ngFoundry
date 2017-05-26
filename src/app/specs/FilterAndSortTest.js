/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../Apprentice/Foundry.decision.js" />
/// <reference path="../Apprentice/MathForFiltersAndSorts.js" />

/// <reference path="FiltersAndSortsVM.js" />

describe("Apprentice: Filters And Sorts", function () {
    var obj;


    beforeEach(function () {
        var spec = {
            lookupData: function () {
                var data = {};
                data.GetLookup = function (name) {
                    if (name.matches('Gender')) {
                        var table = {};
                        table['M'] = { Code: 'M', Description: 'Male', Value: 1 }
                        table['F'] = { Code: 'F', Description: 'Female', Value: 2 }
                        table['U'] = { Code: 'U', Description: 'Unknown', Value: 3 }
                        return table;
                    }
                };
                return data;
            },
        };
        spec.listDefinition = [
            { Name : "Hotlist IMT", Code : "IMT"},
            { Name : "Hotlist PIMT", Code : "PIMT" },
            { Name : "Hotlist T-URH", Code : "T-URH"},
        ];

        spec.metaData = {
            FilterDefinition: [
                {
                    "title": "Port",
                    "propertyName": "PortCode",
                    "filterType": "PortFilter",
                    "lookupNameValidate": "Port"
                },
                {
                    "title": "Arrival Port",
                    "propertyName": "ArrivalLocationCode",
                    "filterType": "TypeInFilter",
                    "lookupNameValidate": "Port"
                },
                {
                    "title": "Departure Port",
                    "propertyName": "DepartureLocationCode",
                    "filterType": "TypeInFilter",
                    "lookupNameValidate": "Port"
                },
                {
                    "title": "Boarding Status",
                    "propertyName": "BoardingStatus",
                    "filterType": "TypeInFilter"
                },
                {
                    "title": "Carrier",
                    "propertyName": "CarrierCode",
                    "filterType": "TypeInFilter",
                    "lookupNameValidate": "Carrier"
                },
                {
                    "id": "GENDER_CODE",
                    "title": "Gender",
                    "propertyName": "GenderCode",
                    "filterType": "MultiSelectFilter",
                    "lookupName": "Gender"
                },
                {
                    "id": "LAST_NAME",
                    "title": "Last Name",
                    "propertyName": "LastName",
                    "filterType": "TypeInFilter"
                },
            ],
            SortDefinition: [
                {
                    "title": "Arrival Port",
                    "propertyName": "ArrivalLocationCode"
                },
                {
                    "title": "Departure Port",
                    "propertyName": "DepartureLocationCode"
                },
                {
                    "title": "Arrival Time",
                    "propertyName": "ArrivalTime"
                },
                {
                    "title": "Boarding Status",
                    "propertyName": "BoardingStatus"
                },
                {
                    "title": "Carrier",
                    "propertyName": "CarrierCode"
                },


                {
                    "title": "Departure Time",
                    "propertyName": "DepartureTime",
                    "defaultEnabled": "true",
                    "defaultDirection": "Ascending"
                },

                {
                    "title": "Date Of Birth",
                    "propertyName": "DateOfBirth"
                },

                {
                    "title": "Last Name",
                    "propertyName": "LastName"
                },

                {
                    "title": "Mins to Departure",
                    "propertyName": "TimeTillDepartureInMinutes",
                    "defaultDirection": "Asc"
                },
            ]
        };

        obj = viewModels.makeListFilterSortVM(spec);    
        return obj;
    });

    it("can create a view model", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);
    });

    it("it will have a LIST subcomponent", function () {
        expect(fo.utils.isaComponent(obj.LIST)).toBe(true);
    });

    it("it will have a FILTER subcomponent", function () {
        expect(fo.utils.isaComponent(obj.FILTER)).toBe(true);
    });

    it("it will have a SORT subcomponent", function () {
        expect(fo.utils.isaComponent(obj.SORT)).toBe(true);
    });

    it("it will have data to support the model", function () {
        expect(obj.LIST.lists.count).toEqual(3);
        expect(obj.FILTER.filters.count).toEqual(7);
        expect(obj.SORT.sorts.count).toEqual(9);
    });

});
