

describe("Foundry: GetSpec", function () {
    var obj;
    var testSpec;

    beforeEach(function () {
        testSpec = {
                    uncomputed: 1,
                    computed: function () {
                        return 1 + this.uncomputed;
                    }
                };

        obj = fo.makeComponent(testSpec);
        return obj;
    });

    it("export only uncomputed objects by default", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.Properties.count).toEqual(2);
        var spec = obj.getSpec();

        var newObj = fo.makeComponent(spec);

        expect(obj.uncomputed).toEqual(newObj.uncomputed);
    });

    it("Should be dehydratable and rehydratable", function () {
        var result = obj.dehydrate() ;

        expect(result).toBeDefined();

        expect(result.myType == 'Component').toBe(true);
        expect(result.uncomputed).toEqual(obj.uncomputed);

        //rehydrate as my own child
        var root = fo.makeComponent({});
        root.rehydrate(root, [result], {});
        var child = root.Subcomponents.item(0);

        expect(fo.utils.isaComponent(child)).toBe(true);
        expect(root).toEqual(child.myParent);

        expect(obj.uncomputed).toEqual(child.uncomputed);

    });

    it("export default and specified properties", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

 
        var spec = obj.getSpec();
        expect(obj.uncomputed).toBeDefined();

        var newSpec = fo.utils.mixin(spec, { computed: obj.computed });
        expect(newSpec.computed).toBeDefined();


        var newObj = fo.makeComponent(newSpec);

        expect(obj.uncomputed).toEqual(newObj.uncomputed);
    });

    it("export default and properties that OptIn", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        obj.makePartOfSpec('computed');

        var spec = obj.getSpec();
        expect(obj.uncomputed).toBeDefined();

        var newSpec = fo.utils.mixin(spec);
        expect(newSpec.computed).toBeDefined();


        var newObj = fo.makeComponent(newSpec);

        expect(obj.uncomputed).toEqual(newObj.uncomputed);
    });

});