/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />


describe("fo.utils: API Validation", function () {
    var obj;

    beforeEach(function () {
        obj = fo.utils;
        return obj;
    });

    it("should define replaceAll", function () {
        expect(obj.replaceAll).toBeDefined();

        var text = "hello";
        var result = obj.replaceAll.call(text, 'l', 'L');
        expect(result).toEqual('heLLo');
    });

    it("should define createID", function () {
        expect(obj.createID).toBeDefined();

        var result = obj.createID.call(undefined, 'Steve');
        expect(result).toBeDefined();
    });

    it("should define generateUUID", function () {
        expect(obj.generateUUID).toBeDefined();

        var result = obj.generateUUID.call(undefined);
        expect(result).toBeDefined();
    });

    it("should define removeCRLF", function () {
        expect(obj.removeCRLF).toBeDefined();

        var text = "he\rllo";

        var result = obj.removeCRLF.call(undefined, text);
        expect(result).toEqual('he llo');
    });

    it("should define removeExtraSpaces", function () {
        expect(obj.removeExtraSpaces).toBeDefined();

        var text = "he ll    o";

        var result = obj.removeExtraSpaces.call(undefined, text);
        expect(result).toEqual('he ll o');
    });

    it("should define capitaliseFirstLetter", function () {
        expect(obj.capitaliseFirstLetter).toBeDefined();

        var text = "steve";
        var result = obj.capitaliseFirstLetter.call(undefined, text);

        expect(result).toEqual('Steve');

        var result = obj.capitaliseFirstLetter.call(undefined, undefined);

        expect(result).toEqual('');
    });

    it("should define asString", function () {
        expect(obj.asString).toBeDefined();

        var text = "steve";
        var result = obj.asString.call(undefined, text);

        expect(result).toEqual(text);

        result = obj.asString.call(undefined, 100);
        expect(result).toEqual('100');

        result = obj.asString.call(undefined, undefined);
        expect(result).toEqual('');
    });

    it("should define isArray", function () {
        expect(obj.isArray).toBeDefined();
    });
    it("should define isFunction", function () {
        expect(obj.isFunction).toBeDefined();
    });
    it("should define isString", function () {
        expect(obj.isString).toBeDefined();
    });
    it("should define isNumber", function () {
        expect(obj.isNumber).toBeDefined();
    });
    it("should define isObject", function () {
        expect(obj.isObject).toBeDefined();
    });

    it("should define isComment", function () {
        expect(obj.isComment).toBeDefined();
    });

    it("should define comment", function () {
        expect(obj.comment).toBeDefined();
    });

    it("should define unComment", function () {
        expect(obj.unComment).toBeDefined();
    });

    it("should define bindingStringToObject", function () {
        expect(obj.bindingStringToObject).toBeDefined();
    });


    it("should define stylingStringToObject", function () {
        expect(obj.stylingStringToObject).toBeDefined();
    });

    it("should define queryStringToObject", function () {
        expect(obj.queryStringToObject).toBeDefined();
    });

    it("should define hashStringToArray", function () {
        expect(obj.hashStringToArray).toBeDefined();
    });

    it("should define objectToQueryString", function () {
        expect(obj.objectToQueryString).toBeDefined();
    });

    it("should define getOwnPropertyValues", function () {
        expect(obj.getOwnPropertyValues).toBeDefined();
    });

    it("should define extend", function () {
        expect(obj.extend).toBeDefined();
    });

    it("should define mixin", function () {
        expect(obj.mixin).toBeDefined();
    });

    it("should define union", function () {
        expect(obj.union).toBeDefined();
    });

});