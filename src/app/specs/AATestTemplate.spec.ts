
import { Tools } from '../foundry/foTools'
import { foComponent } from '../foundry/foComponent.model'

describe("Foundry: Test Template", function () {
    var obj;

    beforeEach(function () {
        obj = fo.makeComponent({});
        return obj;
    });
     
    it("should be a component", function () {
        expect(fo.utils.isaComponent(obj)).toBe(true);

        expect(obj.myName).toBeUndefined();
        expect(obj.myParent).toBeUndefined();

        expect(obj.Properties.isEmpty()).toBe(true);
        expect(obj.Properties.count).toEqual(0);

        expect(obj.Subcomponents.isEmpty()).toBe(true);
        expect(obj.Subcomponents.count).toEqual(0);
    });

});