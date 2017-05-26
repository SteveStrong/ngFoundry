/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="../Foundry/Foundry.trace.js" />
/// <reference path="../Foundry/Foundry.core.js" />
/// <reference path="../Foundry/Foundry.rules.factory.js" />

describe("Apprentice: Dynamic Component", function () {

    var obj;

    beforeEach(function () {
        var spec = {
            userNickName: 'unknown',
            user: function () {
                var userSpec = { userName: this.userNickName };
                return fo.makeComponent(userSpec, undefined, this);
            },
        };
        obj = fo.makeComponent(spec);
        return obj;
    });

    it("should be a Component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);
    });

    it("should have default author as unknown", function () {
        expect(obj.userNickName).toEqual('unknown');
    });

    it("should have default userName as unknown", function () {
        expect(obj.user.userName).toEqual('unknown');
    });

    it("should have default author that can change", function () {
        expect(obj.user.userName).toEqual('unknown');

        obj.userNickName = "Steve Strong";
        expect(obj.user.userName).toEqual('Steve Strong');
    });
});