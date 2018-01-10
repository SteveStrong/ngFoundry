/*
    Foundry.workspace.core.js part of the FoundryJS project
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

//the goal of this module is to manage the API for the resources
//that an app might use like saving and recovering models from 
//local storage and the cloud


(function (ns, fo, cv, undefined) {

    var utils = fo.utils;


    var workspaceSpec = {
        isVisible: true,
        rootModel: function () {
        },
        rootPage: function () {
            if (this.drawing) {
                if (this.drawing.page) return this.drawing.page;
                return this.drawing.Subcomponents.first();
            }
        },
        drawing: function () {
        },
        localStorageKey: 'FoundryLocal',
        userNickName: function () {
            return 'Anonymous';
        },
        userId: function () {
            return 'unknown';
        },
        hasUserId: function () {
            return !this.userId.matches('unknown');
        },
        sessionKey: function () {
            return 'NO_SESSION';
        },
        hasSessionKey: function () {
            var key = this.sessionKey;
            if (!key || key.length == 0) {
                this._sessionKey.smash();
                return false;
            }
            var result = !key.matches('NO_SESSION');
            return result;
        },
        sessionUrl: '',
        sessionTitle: '',
        documentName: '',
        documentExt:'',
        isDocumentSaved: false,
        documentTitle: function () {
            var result = this.documentName + this.documentExt;
            if (result && !this.isDocumentSaved) {
                result += "*";
            }
            return result;
        },
        title: function () { return this.rootModel ? this.rootModel.title : undefined },
        subTitle: function () { return this.rootModel ? this.rootModel.subTitle : undefined },

        //knowtshareSessionUrl: function () {
        //    var loc = window.location;
        //    var url = "{0}//{1}/Home/KnowtShare/{2}".format(loc.protocol, loc.host, this.sessionKey);
        //    return url; // "http://knowtsignal.azurewebsites.net/KnowtShare/{0}".format(this.sessionKey);
        //},

    }

    var Workspace = function (properties, subcomponents, parent) {
        fo.exportTypes();

        this.base = fo.Component;
        this.base(utils.union(workspaceSpec, properties), subcomponents, parent);
        this.myType = (properties && properties.myType) || 'Workspace';
        return this;
    };

    Workspace.prototype = (function () {
        var anonymous = function () { this.constructor = Workspace; };
        anonymous.prototype = fo.Component.prototype;
        return new anonymous();
    })();

    ns.Workspace = Workspace;
    utils.isaWorkspace = function (obj) {
        return obj instanceof Workspace ? true : false;
    };

    fo.myWorkspace = function (obj) {
        var type = obj && obj.myType;
        if (utils.isaWorkspace(obj)) return obj;
        if (obj && obj.myParent) return fo.myWorkspace(obj.myParent);
    }

    //thiis is used to move document data between contoler and workspace
    var copyDocumentMask = {
        documentName: true,
        documentExt: true,
        isDocumentSaved: true,
    }


    var copySessionMask = {
        sessionKey: true,
        sessionUrl: true,
        userNickName: true,
        userId: true,
    }

    function copyUsingMask(from, to, mask) {
        if (!from || !to) return;
        for (var key in mask) {
            if (mask[key]) {
                to[key] = from[key];
            }
        }
        return to;
    };

    
    Workspace.prototype.currentSessionSpec = function () {
        var spec = {};
        copyUsingMask(this, spec, copySessionMask);
        return spec;
    }
    Workspace.prototype.currentDocumentSpec = function () {
        var spec = {};
        copyUsingMask(this, spec, copyDocumentMask);
        return spec;
    }

    Workspace.prototype.attachDocumentDetails = function (details) {

        var document = fo.utils.union({
            version: fo.version,
            title: this.title,
            subTitle: this.subTitle,
            lastModified: new Date(),
        }, details);

        this.copyDocumentSpecTo(document);

        return document;
    };

    Workspace.prototype.defaultNS = function (name) {
        var id = fo.getNamespaceKey(this.myName, name);
        return id;
    }

    Workspace.prototype.stencilNS = function (name) {
        var id = fo.getNamespaceKey(this.myName, name);
        return id;
    }

    Workspace.prototype.copyDocumentSpecTo = function (target){
        return copyUsingMask(this, target, copyDocumentMask);
    }
    Workspace.prototype.copyDocumentSpecFrom = function (source) {
        return copyUsingMask(source, this, copyDocumentMask);
    }

    Workspace.prototype.clearDocumentSpec = function () {
        for (var key in copyDocumentMask) {
            if (copyDocumentMask[key]) {
                    this[key] = '';
                }
            }
            return this;
    }

    Workspace.prototype.copySessionSpecTo = function (target) {
        return copyUsingMask(this, target, copySessionMask);
    }
    Workspace.prototype.copySessionSpecFrom = function (source) {
        return copyUsingMask(source, this, copySessionMask);
    }

    Workspace.prototype.clearSessionSpec = function () {
        for (var key in copySessionMask) {
            if (copySessionMask[key]) {
                this[key] = '';
            }
        }
        return this;
    }

    Workspace.prototype.updateAllViews = function () {
        var self = this;
        if (self.drawing) {
            self.drawing.Subcomponents.forEach(function (item) {
                item.forceLayout();
            });
        }
    }

    Workspace.prototype.clean = function () {
        //make sure pages have modelpages
        //remove unused pages

        var self = this;
        var modelitems = self.rootModel.Subcomponents.members();

        //delete objects from the root that are not in the drawing at all
        modelitems.forEach(function (item) {
            if (!self.drawing.getSubcomponent(item.myName, true)) {
                item.removeFromModel();
            }
            var page = self.drawing.getSubcomponent(item.myName);
            page && page.resetContext(item);
        });

        //resync pages in the drawing to model items..
        var pages = self.drawing.Subcomponents.members();
        pages.forEach(function (page) {
            //find the page in the model and ensure that model items are attached correctly
            var modelPage = self.rootModel.getSubcomponent(page.myName);

            var shapes = page.Subcomponents.members();
            shapes.forEach(function (shape) {
                var model = self.rootModel.getSubcomponent(shape.myName);
                if (model && model.myParent != modelPage) {
                    modelPage.capture(model);
                }
            });
        });


        pages.forEach(function (item) {
            if (item.Subcomponents.count == 0) {
                self.deletePage(item);
            }
        });

    };



    Workspace.prototype.clear = function (includeDocument) {
        var self = this;
        var page = self.rootPage;
        if (page) {
            var model = self.rootModel.getSubcomponent(page.pageId);
            model && model.removeAllSubcomponents();

            page.selectShape(undefined, true);
            page.removeAllSubcomponents();
            page.updateStage(true);
        } else {
            self.rootModel.removeAllSubcomponents();
        }

        delete self.localData;
        if (includeDocument) {
            self.clearDocumentSpec();
        }
        fo.publish('PageClear', [self])
        fo.publish('info', ['Current Page Cleared']);
    }

    Workspace.prototype.clearAll = function (includeDocument) {
        var self = this;
        self.rootModel.removeAllSubcomponents();
        if (self.drawing) {
            self.drawing.Subcomponents.forEach(function (page) {
                page.selectShape(undefined, true);
                page.removeAllSubcomponents();
                page.updateStage(true);
            });

        }

        //now remove any children of modelRoot that are not associated with a page..
        self.rootModel.Subcomponents.members().forEach(function (member) {
            var found = self.drawing.getSubcomponent(member.myName);
            if (!found) {
                member.removeFromModel();
            }
        });

        delete self.localData;
        if (includeDocument) {
            self.clearDocumentSpec();
        }
        fo.publish('WorkspaceClear', [self])
        fo.publish('info', ['Workspace Cleared']);
    }

    Workspace.prototype.clearPage = function (includeDocument) {
        var self = this;
        var page = self.rootPage;
        if (page) {
            var model = self.rootModel.getSubcomponent(page.pageId);
            model && model.removeAllSubcomponents();

            page.selectShape(undefined, true);
            page.removeAllSubcomponents();
            page.updateStage(true);
        } else {
            self.rootModel.removeAllSubcomponents();
        }

        delete self.localData;
        if (includeDocument) {
            self.clearDocumentSpec();
        }
        fo.publish('PageClear', [self])
        fo.publish('info', ['Page Cleared']);
    }

    Workspace.prototype.clearAllPages = function (includeDocument) {
        var self = this;
        if (self.drawing) {
            self.drawing.Subcomponents.forEach(function (page) {
                var modelPage = self.rootModel.getSubcomponent(page.pageId);
                modelPage && modelPage.removeAllSubcomponents();
                page.selectShape(undefined, true);
                page.removeAllSubcomponents();
                page.updateStage(true);
            });

            //now remove any children of modelRoot that are not associated with a page..
            self.rootModel.Subcomponents.members().forEach(function (member) {
                var found = self.drawing.getSubcomponent(member.myName);
                if (!found) {
                    member.removeFromModel();
                }
            });

        }
        delete self.localData;
        if (includeDocument) {
            self.clearDocumentSpec();
        }
        fo.publish('WorkspaceClear', [self])
        fo.publish('info', ['All Pages Cleared']);
    }

    Workspace.prototype.activatePage = function (pageId) {
    }

    Workspace.prototype.establishPage = function (pageId, properties, context) {
        if (!context) {
            //now we should check if a page need to be created..
            var model = this.rootModel;
            context = model.getSubcomponent(pageId);
            if (!context) {
                var spec = {
                    author: this.userNickName,
                    userId: this.userId,
                    myName: pageId,
                    headerText: function () {
                        return this.myName;
                    }
                }
                context = fo.makeComponent(spec, {}, model);
                model.capture(context, pageId);
            }
        }
        if (this.drawing) {
            var page = this.drawing.establishPage(pageId, properties, context);
            this.activatePage(page);
            return page;
        }

    }

    Workspace.prototype.establishPageWithPageModel = function (pageId, title, context) {
        var page = this.establishPage(pageId, {}, context);
        if (title) {
            context = context || this.rootModel.getSubcomponent(pageId);
            context.headerText = title;
        }
        return page;
    }

    Workspace.prototype.payloadSaveAs = function (payload, name, ext, onComplete) {
        //this depends on the function saveAs exisitng
        if (!saveAs && payload) return false;
        var data = utils.isString(payload) ? payload : fo.stringifyPayload(payload);
        fo.writeTextFileAsync(data, name, ext, onComplete);
        return true;
    }

    //this assumes the use just want to save the current file maybe with an new extension name
    Workspace.prototype.userSaveFileDialog = function (onComplete, defaultExt, defaultValue) {
        fo.publish('info', ['Workspace.userSaveFileDialog', 'method missing']);
    }

    Workspace.prototype.userOpenImageDialog = function (onComplete) {
        return this.userOpenFileDialog(onComplete, 'image/*');
    }

    Workspace.prototype.userOpenFileDialog = function (onComplete, defaultExt, defaultValue) {

        //http://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful
        //accept='image/*|audio/*|video/*'
        var accept = defaultExt || '.knt,.csv';

        var fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', accept);
        fileSelector.setAttribute('value', defaultValue);
        fileSelector.setAttribute('style', 'visibility: hidden; width: 0px; height: 0px');
        //fileSelector.setAttribute('multiple', 'multiple');
        document.body.appendChild(fileSelector);

        fileSelector.onchange = function (event) {
            var extensionExtract = /\.[0-9a-z]+$/i;

            var files = fileSelector.files;
            var count = files.length;
            var file = count > 0 && files[0];
            var ext = file ? file.name.match(extensionExtract) : [''];
            ext = ext[0];
            document.body.removeChild(fileSelector);

            if (file && file.type.startsWith('image')) {
                fo.readImageFileAsync(file, ext, onComplete);
            }
            else if (file && (ext.matches('.knt') || ext.matches('.csv') || ext.matches('.json') || ext.matches('.txt'))) {
                fo.readTextFileAsync(file, ext, onComplete);
            }
        }

        if (fileSelector.click) {
            fileSelector.click();
        } else {
            $(fileSelector).click();
        }
       
    }

    Workspace.prototype.matchesSession = function (sessionKey) {
        var result = this.hasSessionKey && this.sessionKey.matches(sessionKey);
        return result;
    }

    Workspace.prototype.matchesUser = function (userID) {
        var result = this.hasUserId && this.userId.matches(userID);
        return result;
    }

    Workspace.prototype.digestLock = function (callback, onComplete) {
        var page = this.rootPage;
        fo.digestLock(page, callback, onComplete);
    }

    Workspace.prototype.specToModelSync = function (spec, modifyModelTypeFn, modifyShapeTypeFn) {
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

            //if this is a legasy document then...
            // 1) there are no model pages in this solution
            // 2) there no page page objects in space.drawing so this is when we test

            if (drawing && spec.drawing) {
                var pages = spec.drawing.filter(function (item) {
                    return !('page'.matches(item.myType) && item.pageId);
                });

                if (pages.length > 0) {  //ok a default page must be created!!
                    pages.forEach(function (item) {
                        var parentHydrateId = item.parentHydrateId;
                        var model = rootModel.getSubcomponent(parentHydrateId);
                        space.establishPage(parentHydrateId, {}, model);
                    });
                    //now modify the model so it syncs to the pages
                    var rootPage = space.rootPage;
                    spec.model.forEach(function (item) {
                        var page = drawing.getSubcomponent(item.parentHydrateId);
                        if (!page) {
                            item.parentHydrateId = rootPage.myName;
                        }
                    });
                }
            }

            rootModel.rehydrate(rootModel, spec.model, space.modelDictionary, modifyModelTypeFn);

            //establsh any pages that might be in the spec
            //check if there is a page id missmatch...
            if (drawing && spec.drawing) {

                spec.drawing.forEach(function (item) {
                    var pageId = item.pageId;
                    var element = pageId && drawing.establishCanvasElement(pageId) ;
                    if (element) {
                        var model = rootModel.getSubcomponent(pageId);
                        if (model && !model.headerText) {
                            model.establishProperty('headerText', pageId);
                        }
                        //delete item.headerText;
                        space.establishPage(pageId, item, model);
                    }
                });

                drawing.rehydrate(drawing, spec.drawing, space.pageDictionary, modifyShapeTypeFn);
            }

        } catch (e) {
            throw new Error('specToModelSync: ' + e.message)
        }

        return {
            command: spec.command,
            document: spec.document,
        }
    }

    Workspace.prototype.modelToSpec = function (command, persist, keepSelection) {

        if (this.rootPage && !keepSelection) {
            this.rootPage.selectShape(undefined, true);
            this.rootPage.selectDropTarget(undefined, true);
        }

        var model = !this.rootModel ? [] : this.rootModel.Subcomponents.map(function (item) {
            var result = item.dehydrate(true);
            return result;
        });

        var drawing = !this.drawing ? [] :  this.drawing.Subcomponents.map(function (item) {
            var result = item.dehydrate(true, { isSelected: false, isActiveTarget: false });
            return result;
        });

        var spec = {
            command: command,
            model: model,
            drawing: drawing,
        }


        if (  this.localData ) {
            spec.localData = this.localData;
        }

        if (persist) {
            spec.document = this.attachDocumentDetails();
        }

        return spec;
    };



    Workspace.prototype.saveSession = function (syncPayload, sessionName, onComplete) {
        var self = this;
        self.sessionStorageDate = Date.now();
        var key = self.documentName || sessionName || this.localStorageKey;
        if (localStorage) {
            localStorage.setItem('currentSession', key);
            localStorage.setItem(key, key ? syncPayload : '');
        }
        if (localStorage) {
            localStorage.setItem(sessionName || this.localStorageKey, syncPayload);
        }
        onComplete && onComplete();
        fo.publish('workspaceSessionSaved', [self])
    }

    Workspace.prototype.restoreSession = function (sessionName, syncToModelFn) {
        var self = this;
        var syncPayload;
        if (sessionStorage) {
            if (localStorage) {
                var key = localStorage.getItem('currentSession');
                syncPayload = key ? localStorage.getItem(key) : undefined;

                //uncomment this code to flush the local store
                //localStorage.setItem(key, '');
                //localStorage.setItem('currentSession', '');
                //localStorage.setItem(this.localStorageKey, syncPayload);
            }
            if (localStorage && !syncPayload) {
                syncPayload = localStorage.getItem(sessionName || this.localStorageKey);
            }

            try {
                var spec = syncToModelFn && syncToModelFn(syncPayload);

                //SRS write code to also update the titles from the last state,
                //olny using the session storage if local storage is not found
                if (spec && spec.document) {
                    space.copyDocumentSpecFrom(spec.document);

                    self.sessionStorageDate = spec.document.sessionStorageDate;
                }
            }
            catch (ex) {
                localStorage.setItem('currentSession', '');
            };
            fo.publish('workspaceSessionRestored', [self])
        }
        return syncPayload;
    }

    Workspace.prototype.payloadExportSave = function (payload, name, ext) {
        var self = this;
        self.isDocumentSaved = true;
        self.documentName = name;
        self.documentExt = ext;

        var resut = this.payloadSaveAs(payload, name, ext);
        fo.publish('WorkspaceExportSave', [self])

        return resut;
    };

    Workspace.prototype.payloadOpenMerge = function (payload, name, ext) {
        var self = this;
        self.isDocumentSaved = true;
        self.documentName = name;
        self.documentExt = ext;

        var result = this.payloadToCurrentModel(payload);
        fo.publish('WorkspaceOpenMerge', [self])

        return result;
    };

    Workspace.prototype.payloadToCurrentModel = function (payload) {
        if (!payload) return;

        var spec = fo.parsePayload(payload);
        return this.specToModelSync(spec);
    };

    Workspace.prototype.currentModelToPayload = function (command, persist, keepSelection) {
        var spec = this.modelToSpec(command, persist, keepSelection);

        return fo.stringifyPayload(spec);
    };

    Workspace.prototype.syncModelPagesToRootModel = function () {
        //move the model pages content back to the root model and destroy anything modelPage connected to rootModel
        var space = this;
        var model = space.rootModel;
        var drawing = this.drawing;
        var children = this.rootModel.Subcomponents.filter(function (item) {
            return space.isPageModel(item);
        })

        children.forEach(function (item) {
            var temp = item.Subcomponents.copyTo();
            temp.forEach(function (child) {
                item.removeSubcomponent(child);
                model.addSubcomponent(child);
            });
        });

        children.forEach(function (item) {
            item.removeFromModel()
        });

    }

    Workspace.prototype.syncRootModelToModelPages = function () {
        //move non pages from root to the connected page in the model and establish that page if it does not exist
        var space = this;
        var model = space.rootModel;
        var drawing = this.drawing;
        var children = this.rootModel.Subcomponents.filter(function (item) {
            return !space.isPageModel(item);
        })

        children.forEach(function (item) {

            var shape = drawing.getSubcomponent(item.myName, true);
            if (!shape) return;  //for some reason this object is not associated with a shape

            var page = shape.rootPage();
            space.establishPageWithPageModel(page.pageId);
            var modelPage = model.getSubcomponent(page.pageId);
            model.removeSubcomponent(item);
            modelPage.addSubcomponent(item);
        });
    }

    Workspace.prototype.currentPage = function () {
        return this.rootPage;
    }

    Workspace.prototype.isPageModel = function (model) {
        var pageId = model.myName;
        var found = this.drawing.Subcomponents.filter(function (page) {
            return page.pageId == pageId;
        });
        return found.count > 0;
    }

    Workspace.prototype.currentModelPage = function () {
        var model = this.rootModel;
        var page = this.currentPage();
        if (!page) return model;
        var modelPage = model.getSubcomponent(page.myName);
        return modelPage ? modelPage : model;
    }

    Workspace.prototype.currentModelTarget = function(type) {
        var found = this.rootPage && this.rootPage.selectedContext();
        //found = !found ? found : found.findParentWhere(function (item) {
        //    return item.isOfType(type || 'note')
        //});
        return found ? found : this.currentModelPage();;
    }

    Workspace.prototype.currentViewTarget = function (type) {
        var found = this.rootPage && this.rootPage.selectedShape();
        //found = !found ? found : found.findParentWhere(function (item) {
        //    return item.isOfType(type || 'note')
        //});

        return found ? found : this.currentPage();
    }


    ns.makeWorkspace = function (properties, subcomponents, parent) {
        var space = new Workspace(properties, subcomponents, parent);
        return space;
    };

    //SRS new stuff
    ns.makeModelWorkspace = function (name, properties, modelSpec) {

        var spaceSpec = {
            localStorageKey: name + 'Session',
        }

        var space = new Workspace(utils.union(spaceSpec, properties));

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


        return space;
    };



    Workspace.prototype.syncRootModelToDrawing = function (onNotFound) {
        //walk the drawing tree and  verify / move the model elements to 
        //sync up with the drawing structure,  

        var space = this;
        var model = space.rootModel;
        var drawing = this.drawing;

        drawing.Subcomponents.forEach(function (page) {
            var modelPage = model.getSubcomponent(page.myName);
            if (!modelPage) {
                space.establishPage(page.myName);
            }
        });

        var lostShapes = {};
        var allItems = fo.filtering.applyMapping(model.selectComponents(), 'myName');

        function syncLocalChildren(parentShape, parent) {
            parentShape.Subcomponents.forEach(function (shape) {
                var found = parent.getSubcomponent(shape.myName);
                //if not found look elsewhere in the model and and move that item
                if (!found) {
                    found = parent.getSubcomponent(shape.myName, true);
                    found = found || allItems[shape.myName];
                    if (found) {
                        parent.capture(found);
                    } else {
                        lostShapes[shape.myName] = shape;

                    }
                }
                if (found) {
                    delete allItems[found.myName];
                }
                //drawing is king keep looking
                syncLocalChildren(shape, found || parent);
            });

        }

        drawing.Subcomponents.forEach(function (page) {
            var modelPage = model.getSubcomponent(page.myName);
            syncLocalChildren(page, modelPage);
            delete allItems[modelPage.myName];
        });

        //one last pass on lost shapes sync up via headertext
        var shapes = fo.utils.objectToArray(lostShapes);
        var items = fo.utils.objectToArray(allItems);
        var allItems = fo.filtering.applyMapping(items, 'headerText');


        shapes.forEach(function (shape) {
            var found = allItems[shape.headerText];
            if (found) {
                //now just capture this shape correctly
                var shapeParent = shape.myParent;
                var modelParent = model.getSubcomponent(shapeParent.myName, true);

                // found.myName = shape.myName;  //now the id are in sync
                modelParent.capture(found, shape.myName);

                delete lostShapes[shape.myName];
            } else {
                //should we try and create a matching note?
                onNotFound && onNotFound(shape);
            }
        });

        return lostShapes;
    }

 
}(Foundry.workspace, Foundry, Foundry.canvas));

