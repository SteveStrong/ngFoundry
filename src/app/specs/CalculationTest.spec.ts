import { Tools } from '../foundry/foTools'
import { foComponent } from '../foundry/foComponent.model'



xdescribe("Foundry: Calculation", function () {
    var obj;
    var firstname= "George";
    var lastname = "Washington";

    var nameSpec = {
        fname: "George",
        lname: "Washington",
        fullname: function () {
            return this.fname + ' ' + this.lname
        },
    };

    beforeEach(function() {
        obj = new foComponent(nameSpec);
    });

    it("should be able to compute", function() {
        expect(obj.fname).toEqual(firstname);
        expect(obj.lname).toEqual(lastname);
        expect(obj.fullname).toEqual(firstname + ' ' + lastname);
    });

    it("store managed properties in the component", function () {
        expect(obj.fname).toBeDefined();
        expect(obj.lname).toBeDefined();
        expect(obj.fullname).toBeDefined();

        expect(obj._fname).toBeDefined();
        expect(obj._lname).toBeDefined();
        expect(obj._fullname).toBeDefined();
    });

    it("change the status of the calculation when computed", function () {
        expect(obj._fullname.status).toBeUndefined();
        expect(obj.fullname).toBeDefined();
        expect(obj._fullname.status).toBeDefined();
        expect(obj._fullname.status).toEqual('calculated');
    });

    it("should smash to undefined and recompute on demand", function () {
        expect(obj.fullname).toBeDefined();
        expect(obj._fullname.status).toEqual('calculated');

        var differentlastname = "Plimpton";
        obj.lname = differentlastname;
        expect(obj._fullname.status).toBeUndefined();

        expect(obj.fullname).toEqual(firstname + ' ' + differentlastname);
        expect(obj._fullname.status).toEqual('calculated');
    });

    it("should allow the computed to be overridden and recompute on smashing", function () {
        expect(obj.fullname).toEqual(firstname + ' ' + lastname);

        var newName = "Bill Clinton";
        obj.fullname = newName;
        expect(obj.fullname).toEqual(newName);

        var differentlastname = "Plimpton";
        obj.lname = differentlastname;
        expect(obj.fullname).toEqual(newName);

        obj.getProperty('fullname').smash();
        expect(obj._fullname.status).toBeUndefined();

        expect(obj.fullname).toEqual(firstname + ' ' + differentlastname);


    });

});