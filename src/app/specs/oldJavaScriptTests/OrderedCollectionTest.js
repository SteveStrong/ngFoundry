/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Foundry: Ordered Collection", function () {

    var SortDefinition = [
   {
       "id": "ARRIVAL_LOCATION_CODE",
       "displayName": "Arrival Port",
       "propertyName": "ArrivalLocationCode"
   },
   {
       "id": "DEPARTURE_LOCATION_CODE",
       "displayName": "Departure Port",
       "propertyName": "DepartureLocationCode"
   },
   {
       "id": "ARRIVAL_TIME",
       "displayName": "Arrival Time",
       "propertyName": "ArrivalTime"
   },
   {
       "id": "BOARDING_STATUS",
       "displayName": "Boarding Status",
       "propertyName": "BoardingStatus"
   },
   {
       "id": "CARRIER_CODE",
       "displayName": "Carrier",
       "propertyName": "CarrierCode"
   },
   {
       "id": "LAST_OPEN",
       "displayName": "Recently Open",
       "propertyName": "LastOpened",
       "defaultDirection": "Decending"
   },
   {
       "id": "MANUAL_CHANGE_CODE",
       "displayName": "IMOD",
       "propertyName": "IMODSequence",
       "defaultEnabled": "true",
       "defaultDirection": "Ascending"
   },
   {
       "id": "CONVEYANCE_TYPE_CODE",
       "displayName": "Conveyance Type",
       "propertyName": "ConveyanceSequence",
       "defaultEnabled": "true",
       "defaultDirection": "Ascending"
   },
   {
       "id": "DEPARTURE_TIME",
       "displayName": "Departure Time",
       "propertyName": "DepartureTime",
       "defaultEnabled": "true",
       "defaultDirection": "Ascending"
   },
   {
       "id": "COUNTRY_OF_CITIZENSHIP_CODE",
       "displayName": "Country Of Citizenship",
       "propertyName": "CountryOfCitizenshipCode"
   },
   {
       "id": "REFERREDCONFIRMED_STATUS_CODE",
       "displayName": "Referred/Confirmed",
       "propertyName": "ImodCode"
   },
   {
       "id": "CROSSING_DIR_CODE",
       "displayName": "Crossing Direction (I,O,T)",
       "propertyName": "CrossingStatusCode"
   },
   {
       "id": "DATE_OF_BIRTH",
       "displayName": "Date Of Birth",
       "propertyName": "DateOfBirth"
   },
   {
       "id": "DOCUMENT_COUNTRY",
       "displayName": "Document Country",
       "propertyName": "DocumentCountry"
   },
   {
       "id": "DOCUMENT_NUMBER",
       "displayName": "Document Number",
       "propertyName": "DocumentNumber"
   },
   {
       "id": "DOCUMENT_TYPE_CODE",
       "displayName": "Document Type",
       "propertyName": "DocumentTypeCode"
   },
   {
       "id": "GIVEN_NAMES",
       "displayName": "Given Names",
       "propertyName": "GivenNames"
   },
   {
       "id": "HIT_TYPE_CODES",
       "displayName": "Hit Type",
       "propertyName": "HitTypeSequence",
       "defaultDirection": "Descending"
   },
   {
       "id": "LAST_NAME",
       "displayName": "Last Name",
       "propertyName": "LastName"
   },
   {
       "id": "REVIEW_STATUS_CODE",
       "displayName": "Review Status",
       "propertyName": "StatusSequence"
   },
   {
       "id": "SWEEP_CODES",
       "displayName": "Hotlist Source",
       "propertyName": "SweepCodeSequence"
   },
   {
       "id": "REFERRALS_CODE",
       "displayName": "Referrals",
       "propertyName": "ReviewReferCode"
   }
    ];


    var sortSpec = {
        displayName: '',
        debugName: function () {
            return "{1} of {2}: {0}".format(this.displayName, this.sortOrder + 1, this.myParent.selectedSorts.count);
            //return "{0}".format(this.displayName, this.sortOrder + 1, this.myParent.selectedSorts.count);
        },
        isSelected: false,
        defaultEnabled: false,
        defaultDirection: "ASC",
        sortOrder: 0,
        sortPercent: function () {
            var count = this.myParent.selectedSorts.count;
            return count <= 1 ? -1 : this.sortOrder / (count - 1);
        },
        isASC: function () {
            return this.defaultDirection.matches("ASC");
        },
        isDEC: function () {
            return this.defaultDirection.matches("DEC");
        },
        canMoveUp: function () {
            return this.sortPercent >= 0 && this.sortPercent !== 0;
        },
        canMoveDown: function () {
            return this.sortPercent >= 0 && this.sortPercent !== 1;
        },
    }

    var sortSetSpec = {
        title: "Sort by...",
        uponCreation: function () {
            return fo.makeCollectionSpec(SortDefinition.sortOn('displayName'), sortSpec);
        },
        sorts: function () {
            return this.Subcomponents;
        },
        selectedSorts: function () {
            //get current set without setting up dependency on property 'isSelected'
            var list = this.sorts.copyWhere(function (item) { return item.getProperty('isSelected').value });
            var result = fo.makeOrderedCollection(list, this, 'sortOrder');
            return result;
        },
        toggleSelection: function (item) {
            var list = this.selectedSorts;
            item.isSelected = !item.isSelected;
            item.isSelected ? list.addItem(item) : list.removeItem(item);
            //this.getProperty('selectedSorts').smash();
        },
        setAscending: function (item) {
            item.defaultDirection = "ASC";
        },
        setDecending: function (item) {
            item.defaultDirection = "DEC";
        },
        moveUp: function (item) {
            var list = this.selectedSorts;
            list.swapItemTo(item, item.sortOrder - 1);
        },
        moveDown: function (item) {
            var list = this.selectedSorts;
            list.swapItemTo(item, item.sortOrder + 1);
        },
    }


    var component;

    beforeEach(function() {
        component = fo.makeComponent(sortSetSpec);
    });

    it("should start correctly", function() {
        expect(component.Properties.count).toBeGreaterThan(0);
        expect(component.Subcomponents.count).toBeGreaterThan(0);

        expect(component.selectedSorts.isEmpty()).toEqual(true);
    });

    it("should be able to select an item", function () {
        expect(component.Properties.count).toBeGreaterThan(0);
        expect(component.Subcomponents.count).toBeGreaterThan(0);

        expect(component.selectedSorts.count).toEqual(0);

        var item = component.sorts.first();
        expect(item.isSelected).toEqual(false);

        item.getProperty('toggleSelection',true).doCommand(item)
        expect(item.isSelected).toEqual(true);
        expect(component.selectedSorts.count).toEqual(1);


        expect(component.selectedSorts.isEmpty()).toEqual(false);
    });

    it("should be able to select an item and unselect", function () {
        expect(component.selectedSorts.count).toEqual(0);

        var item1 = component.sorts.last();
        expect(item1.isSelected).toEqual(false);

        item1.getProperty('toggleSelection', true).doCommand(item1)
        expect(item1.isSelected).toEqual(true);
        expect(component.selectedSorts.count).toEqual(1);


        var item2 = component.selectedSorts.first();
        expect(item2.isSelected).toEqual(true);
        expect(component.selectedSorts.count).toEqual(1);
        item2.getProperty('toggleSelection', true).doCommand(item2)

        expect(component.selectedSorts.count).toEqual(0);

    });


});