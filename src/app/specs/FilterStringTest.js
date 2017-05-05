/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />
/// <reference path="../ViewModels/FiltersAndSortsVM.js" />
/// <reference path="../Foundry/Foundry.rules.filtering.js" />


describe("Filter: a String", function () {


    it("should be able to EXACT match ignoreing case", function () {
        expect("HELLO".matches("hello")).toBe(true);

        expect(".".matches(".")).toBe(true);

    });

    it("should trim", function () {
        expect("HELLO".trim().matches("hello")).toBe(true);

        expect("HELLO ".trim().matches("hello")).toBe(true);
        expect("  HELLO ".trim().matches("hello")).toBe(true);
        expect("  HELLO".trim().matches("hello")).toBe(true);
        expect("-  HELLO".trim().matches("hello")).toBe(false);

        expect("  .  ".trim().matches(".")).toBe(true);

    });

    it("should be able to check if one string is contained inside another ignoreing case", function () {
        expect("HELLO".contains("llo")).toBe(true);
        expect("HELLO".contains("el")).toBe(true);
        expect("HELLO".contains("HE")).toBe(true);
        expect("HELLO".contains("l")).toBe(true);

        expect("HELLO   Customs".contains("L")).toBe(true);
        expect("HELLO   Customs".contains("s")).toBe(true);
        expect("HELLO   Customs".contains(" c")).toBe(true);
        expect("HELLO   Customs".contains("o ")).toBe(true);

    });

    it("should match any in array simple", function () {

        var oArray = ['U',"Customs","T", " xxX"];

        expect(oArray.anyMatch("U")).toBe(true);

        expect(oArray.anyMatch("XXX")).toBe(true);

        expect(oArray.anyMatch("Zz,T")).toBe(true);

    });

    it("should match any in array sloppy", function () {

        var oArray = ['U', "Customs", "T", " xxX"];

        expect(oArray.anyMatch("XXzX,U ,Customs")).toBe(true);
    });

});