/// <reference path="../Scripts/jasmine-1.3.1/jasmine.js" />

/// <reference path="Apprentice/easeljs-0.7.0.min.js">
/// <reference path="Apprentice/tweenjs-0.5.0.min.js">

/// <reference path="../Foundry/FoundryComplete.js" />


describe("Foundry: Workspace Basics", function () {
    var noteSpace;
    var modelSpace;

    var modelName = 'dave';

    beforeEach(function () {

        var canvas = document.getElementById('mainCanvas');
        var pip = document.getElementById('PIP');
        var pz = document.getElementById('panZoomCanvas');

        if (!canvas) {
            canvas = document.createElement('canvas');
            document.body.appendChild(canvas);

            pip = document.createElement('div');
            document.body.appendChild(pip);

            pz = document.createElement('canvas');
            pip.appendChild(pz);
        }

        modelSpace = fo.ws.makeModelWorkspace(modelName);

        noteSpace = fo.ws.makeNoteWorkspace(modelName, {
            canvasId: canvas,
            panZoomCanvasId: pz,
            pipId: pip,
        });
    });
     
    it("modelSpace should be a workspace", function () {
        expect(fo.utils.isaWorkspace(modelSpace)).toBe(true);

        expect(modelSpace.myParent).toBeUndefined();
        expect(modelSpace.Subcomponents.isEmpty()).toBe(true);
        expect(modelSpace.Subcomponents.count).toEqual(0);
    });

    it("should have a rootModel", function () {
        expect(fo.utils.isaWorkspace(modelSpace)).toBe(true);

        var root = modelSpace.rootModel;
        expect(root).toBeDefined();
        expect(root.myName).toBe(modelName);
        expect(root.Subcomponents.isEmpty()).toBe(true);
        expect(root.Subcomponents.count).toEqual(0);

        expect(root.myParent).toBe(modelSpace);
        expect(fo.myWorkspace(root)).toBe(modelSpace);

    });

    it("noteSpace should be a workspace", function () {
        expect(fo.utils.isaWorkspace(noteSpace)).toBe(true);

        expect(noteSpace.myParent).toBeUndefined();
        expect(noteSpace.Subcomponents.isEmpty()).toBe(true);
        expect(noteSpace.Subcomponents.count).toEqual(0);
    });

    it("noteSpace should have a rootModel", function () {
        expect(fo.utils.isaWorkspace(noteSpace)).toBe(true);

        var root = noteSpace.rootModel;
        expect(root).toBeDefined();
        expect(root.myName).toBe(modelName);
        expect(root.Subcomponents.isEmpty()).toBe(true);
        expect(root.Subcomponents.count).toEqual(0);

        expect(root.myParent).toBe(noteSpace);
        expect(fo.myWorkspace(root)).toBe(noteSpace);

    });

    it("noteSpace should have a rootPage", function () {
        expect(fo.utils.isaWorkspace(noteSpace)).toBe(true);

        var root = noteSpace.rootPage;
        expect(root).toBeDefined();
        expect(root.myName).toBe('Page');
        expect(root.Subcomponents.isEmpty()).toBe(true);
        expect(root.Subcomponents.count).toEqual(0);

        //expect(root.myParent).toBe(noteSpace);
        expect(fo.myWorkspace(root)).toBe(noteSpace);

    });

});