/*
    Foundry.workapace.multipage.js part of the FoundryJS project
    Copyright (C) 2012 Steve Strong  http://foundryjs.azurewebsites.net/

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


var Foundry = Foundry || {};
Foundry.canvas = Foundry.canvas || {};
Foundry.workspace = Foundry.workspace || {};
Foundry.ws = Foundry.workspace;

(function (ns, fo, cv, undefined) {

	var utils = fo.utils;

	var mutlipageWorkspaceSpec = {

	}

	var MultipageWorkspace = function (properties, subcomponents, parent) {
	    this.base = ns.Workspace;
		this.base(utils.union(mutlipageWorkspaceSpec, properties), subcomponents, parent);
		this.myType = (properties && properties.myType) || 'MultipageWorkspace';
		return this;
	};

	MultipageWorkspace.prototype = (function () {
		var anonymous = function () { this.constructor = MultipageWorkspace; };
		anonymous.prototype = ns.Workspace.prototype;
		return new anonymous();
	})();

	ns.MultipageWorkspace = MultipageWorkspace;
	utils.isaMultipageWorkspace = function (obj) {
		return obj instanceof MultipageWorkspace ? true : false;
	};

	MultipageWorkspace.prototype.payloadToCurrentModelGenerateDrawing = function (payload) {
	    if (!payload) return;

	    var spec = fo.parsePayload(payload);

	    return this.specToModelSyncGenerateDrawing(spec);
	};

	MultipageWorkspace.prototype.specToModelSyncGenerateDrawing = function (spec, modifyModelTypeFn, modifyShapeTypeFn) {
	    if (!spec) return;

	    this.localData = fo.utils.mixin(this.localData, spec.localData);
	    var rootModel = this.rootModel;
	    var rootPage = this.rootPage;
	    var drawing = this.drawing;

	    var space = this;
	    space.modelDictionary = space.modelDictionary || {};
	    space.pageDictionary = space.pageDictionary || {};

	    //temp for this version;
	    fo.modelDictionary = space.modelDictionary;
	    fo.pageDictionary = space.pageDictionary;


	    try {
	        if (spec.document) {
	            space.copyDocumentSpecFrom(spec.document);
	        }

	        var modelPage = rootModel.getSubcomponent(rootPage.myName);
	        space.establishPage(rootPage.myName, {}, modelPage);

	        var localModel = rootModel.rehydrate(modelPage, spec.model, space.modelDictionary, modifyModelTypeFn);

	        //lets verify that rootModel has no duplicate keys..
	        var list = {};
	        rootModel.selectComponents().forEach(function (item) { //this is everything
	            if (!list[item.myName]) {
	                list[item.myName] = item;
	            } else { //lets force a name change
	                item.myName = utils.generateUUID();
	                list[item.myName] = item;
	            }
                //maybe I will not need this in the future
	            //item.uniqueID = item.myName;
	        });



	        function syncModelCreateDrawing(model, parent, parentShape) {
	            //create shape for model,  add that to parent and page, and then call for your subcomponents...
	            var uuid = model.myName;
	            var type = model.myType + 'Shape';
	            //you should verify that this type exist with 'Shape' appended to it...

	            var shape = rootPage.getSubcomponent(uuid);
	            shape = shape || fo.makeInstance(type, { myName: uuid }, parentShape);
	            shape.resetContext(model);

	            parent.addSubcomponent(model);
	            parentShape.addSubcomponent(shape);
	            model.Subcomponents.forEach(function (part) {
	                syncModelCreateDrawing(part, model, shape);
	            })
	        };

	        fo.utils.loopForEachValue(localModel, function (key, value) {
	            if (!value.myType || value.myType.matches('Component')) return;
	            syncModelCreateDrawing(value, modelPage, rootPage);
	        });

	        return localModel;

	    } catch (e) {
	        throw new Error('specToModelSyncCreateDrawing: ' + e.message)
	    }

	    return {
	        command: spec.command,
	        document: spec.document,
	    }
	}

	ns.makeMultipageWorkspace = function (name, properties, modelSpec, enableDragDrop) {

		var spaceSpec = {
			localStorageKey: name + 'Session',
		}

		var space = new MultipageWorkspace(utils.union(spaceSpec, properties));

		//setup root model
		var defaultTemplate = {
			myName: name,
			spec: modelSpec,
			Subcomponents: {},
		};

		if (!space.rootModel) {
			space.rootModel = fo.makeModel(defaultTemplate, space);
			//done in function above   space.rootModel.myParent = space;
		}

		//create drawing;
		var drawingId = properties && properties.drawingId;
		space.drawing = cv.makeDocument(properties, space);

		if (enableDragDrop) {
			fo.enableFileDragAndDrop(drawingId);
		}


		function insurePage(pageId) {
			if (fo.utils.isString(pageId)) {
				return space.drawing.findPage(pageId);
			}
			else if (fo.utils.isaComponent(pageId)) {
				return pageId;
			}
		}

		function insurePageId(page) {
			if (fo.utils.isString(page)) {
				return page;
			}
			else if (fo.utils.isaComponent(page)) {
				return page.myName;
			}
		}

		space.activatePage = function (pageId) {
			var page = insurePage(pageId);
			space.rootPage = page;
			space.pages().forEach(function (item) {
				item.setAnimationsOn(false);
			})
			if (space.rootPage) {
				space.rootPage.setAnimationsOn(true);
				space.rootPage.updateStage();
				fo.publish('PageActivated', [space.rootPage]);
				fo.publish('previewPage', [space.rootPage]);
			}
			return space.rootPage;
		}

		space.activateDrawing = function () {
		    var page = space.rootPage || space.drawing.firstPage();
		    space.activatePage(page);
		    space.drawing.showPage(page);
		    return page;
		}

		space.forEachPage = function (func) {
			return space.drawing.forEachPage(func);
		}

		space.showCurrentPage = function () {
			space.drawing.showPage(space.rootPage);
			return space.rootPage;
		}

		space.isCurrentPage = function (page) {
		    var found = (space.rootPage === insurePage(page));
			return found;
		}

		space.showThisPage = function (page) {
		    space.rootPage = space.drawing.showPage(insurePage(page));
			return space.rootPage;
		}

		space.showAllPages = function () {
			return space.drawing.showAllPages();
		}

		space.hideAllPages = function () {
		    space.drawing.showAllPages('none');
		    return space.rootPage;
		}

		space.deletePage = function (page) {
			var nextPage = space.nextPage(space.rootPage, true);
			var pageId = insurePageId(page);
			var deletedPage = space.drawing.deletePage(pageId);
			return deletedPage;
		}

		space.nextPage = function (current, loop) {
			var page = space.drawing.nextPage(current);
			if (loop && page == current) page = space.drawing.firstPage();
			space.activatePage(page);
			return page;
		}

		space.pages = function () {
			return space.drawing.Subcomponents;
		}

		space.previousPage = function (current, loop) {
			var page = space.drawing.previousPage(current);
			if (loop && page == current) page = space.drawing.lastPage();
			space.activatePage(page);
			return page;
		}


		space.firstPage = function () {
			var page = space.drawing.firstPage();
			return page;
		}

		space.lastPage = function () {
			var page = space.drawing.lastPage();
			return page;
		}

		space.movePageForward = function (page) {
		    return space.drawing.movePageForward(page);
		}

		space.movePageBackward = function (page) {
		    return space.drawing.movePageBackward(page);
		}

		space.saveCanvasAsBlob = function (name, ext) {
			var canvas = space.rootPage.canvas;
			//var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			//var blob = new Blob([image]);
			//fo.writeBlobFile(blob, name, ext);
			////Canvas2Image.saveAsPNG(canvas);
			canvas.toBlob(function (blob) {
				fo.writeBlobFile(blob, name, ext);
			});

		}

		space.syncronizeDocumentViaPosition = function () {

		    var drawingKeys = {}
		    var drawingItems = space.drawing.selectComponents();
		    drawingItems.forEach(function (item) {
		        drawingKeys[item.myName] = item;
		    });


		    function syncDrawingAndModelSubcomponents(model, shape) {
		        //is the parents are the same try the children
		        if (shape && model.myName == shape.myName) {
		            //keep a tally did we get them all?
		            delete drawingKeys[shape.myName];
		            delete modelKeys[model.myName];

		            var total = model.Subcomponents.count;
		            if (!total) return;

		            var models = model.Subcomponents.elements;
		            var shapes = shape.Subcomponents.elements;

		            for (var i = 0; i < total; i++) {
		                var subModel = models[i];
		                var subShape = shapes[i];

		                var text = subModel.headerText;

		                if (subShape && subShape.myName != subModel.myName) {

		                    //this item is corrected
		                    delete drawingKeys[subShape.myName];
		                    delete modelKeys[subModel.myName];

		                    subShape.myName = subModel.myName;
		                    subShape.uniqueID = subModel.uniqueID;
		                    subShape.context = subModel;
		                }

		                syncDrawingAndModelSubcomponents(subModel, subShape);
		            }
		        }
		    };

		    //at the root loop through children carefully
		    var modelKeys = {}
		    var model = space.rootModel.selectComponents();
		    model.forEach(function (item) {
		        modelKeys[item.myName] = item;
		    });

		    var modelitems = space.rootModel.Subcomponents.members();
		    modelitems.forEach(function (item) {
		        var key = item.myName;
		        var shape = drawingKeys[key];
		        shape && syncDrawingAndModelSubcomponents(item, shape);
		    });


		    var keys = Object.keys(drawingKeys);
		    //look like some objects are misplaced
		    keys.forEach(function (key) {
		        var targetShape = space.drawing.getSubcomponent(key, true);
		        var targetModel = space.rootModel.getSubcomponent(key, true);
		        if (targetShape && targetModel) {

		            var parentShape = targetShape.myParent;
		            var parentModel = space.rootModel.getSubcomponent(parentShape.myName, true);
		            if (parentModel) {
		                delete drawingKeys[targetShape.myName]; //keep a tally did we get them all?
		                delete modelKeys[targetModel.myName]; //keep a tally did we get them all?
		                parentModel.capture(targetModel);
		                targetShape.resetContext && targetShape.resetContext(targetModel);
		            }
		        }
		    });


		    //ok if we have left over keys then we will create notes for them
		    keys = Object.keys(drawingKeys);
		    keys.forEach(function (key) {
		        var targetShape = space.drawing.getSubcomponent(key, true);
		        if (targetShape) {
		            var parentShape = targetShape.myParent;
		            var parentModel = space.rootModel.getSubcomponent(parentShape.myName, true);
		            if (parentModel) {
		                delete drawingKeys[targetShape.myName]; //keep a tally did we get them all?
		                var targetModel = fo.makeInstance(parentModel.myType, {}, parentModel);
		                parentModel.capture(targetModel, targetShape.myName);
		                targetShape.resetContext && targetShape.resetContext(targetModel);
		            }
		        }
		    });

		    var models = Object.keys(modelKeys);
		    keys = Object.keys(drawingKeys);
		    space.updateAllViews();
		    return keys;
		}


		space.syncronizeDocumentViaOutlinePath = function () {
			var modelKeys = {}
			var modelItems = space.rootModel.selectComponents();
			modelItems.forEach(function (item) {
				var key = "0." + item.outlinePath();
				modelKeys[key] = item;
			});

			var drawingKeys = {}
			var drawingItems = space.drawing.selectComponents();
			drawingItems.forEach(function (item) {
				var key = item.outlinePath();
				drawingKeys[key] = item;
			});

			fo.utils.loopForEachValue(drawingKeys, function (key, value) {
				var model = modelKeys[key];
				if (!model) return;

				if (model.myName == value.myName) {
					//value.uniqueID = model.uniqueID;
				} else {
					value.myName = model.myName;
					//value.uniqueID = model.uniqueID;
				};
			});

		}

		space.doSessionPurge = function () {
			var self = this;
			self.saveSession("", self.localStorageKey, function () {
				fo.publish('sessionPurge', [0, 0]);
			});
		};

		space.doSessionSave = function () {
			var self = this;
			//fo.publish('info', ['Saving Session']);
			var payload = self.currentModelToPayload({}, true, true);
			self.saveSession(payload, self.localStorageKey, function () {
				//fo.publish('success', ['Session Saved']);
				fo.publish('sessionStorage', [payload.length, 0]);
				fo.publish('sessionSaved', [payload]);
			});
		};

		space.doSessionRestore = function () {
			var self = this;
			self.restoreSession(self.localStorageKey, function (payload) {
				//fo.publish('info', ['Restoring Session']);
				//I think cording a clear here is bad and unnecessary   self.clear();
				self.digestLock(function () {
					self.payloadToCurrentModel(payload);
					fo.publish('sessionStorage', [0, payload.length]);
					fo.publish('sessionRestored', [payload]);
					//fo.publish('success', ['Session Restored']);
				});
			});
		};

		space.payloadToLocalData = function (name, payloadCSV) {
			if (!payloadCSV) return;

			var self = this;
			self.localData = self.localData || {};

			var payload = fo.convert.csvToJson(payloadCSV);
			var json = fo.parsePayload(payload);
			self.localData[name] = json;
			return json;
		};


		space.activatePage(space.drawing.page);

		return space;
	};

	ns.makeNoteWorkspace = function (name, properties, modelSpec, enableDragDrop) {
	    var space = ns.makeMultipageWorkspace(name, properties, modelSpec, enableDragDrop);
	    var canvasId = properties && properties.canvasId;
	    space.establishPage(canvasId);
	    return space;
	}


}(Foundry.workspace, Foundry, Foundry.canvas));
