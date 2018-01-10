var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};
Foundry.workspace = Foundry.workspace || {};
Foundry.ws = Foundry.workspace;

(function (ns, tools, ws, undefined) {

    // Feature detect + local reference
    var storage = (function () {
        var uid = new Date;
        var result;
        try {
            localStorage.setItem(uid, uid);
            result = localStorage.getItem(uid) == uid;
            localStorage.removeItem(uid);
            return result && localStorage;
        } catch (exception) { }
    }());

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
        documentExt: '',
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
    }

    //in prep for prototype pattern...
    var Workspace = function (properties, subcomponents, parent) {
        //"use strict";

        this.base(properties, subcomponents, parent);

        this.myType = 'Workspace';

        return this;
    }


    Workspace.prototype = (function () {
        var anonymous = function () {
            this.constructor = Workspace;
            this.base = ns.Node;
        };
        anonymous.prototype = ns.Node.prototype;
        return new anonymous();
    })();

    ns.Workspace = Workspace;
    ns.makeWorkspace = function (properties, subcomponents, parent) {
        return new ns.Workspace(properties, subcomponents, parent);
    };

    tools.isaWorkspace = function (obj) {
        return obj && obj.isInstanceOf(Workspace);
    };

    ns.myWorkspace = function (obj) {
        if (tools.isaWorkspace(obj)) return obj;
        if (obj && obj.myParent) return fo.myWorkspace(obj.myParent);
    }



    //Prototype defines functions using JSON syntax
    tools.mixin(Workspace.prototype, {

        specToModelSync: function (spec, modifyModelTypeFn, modifyShapeTypeFn) {
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
        },
 
        modelToSpec: function (command, persist, keepSelection) {

            if (this.rootPage && !keepSelection) {
                this.rootPage.selectShape(undefined, true);
                this.rootPage.selectDropTarget(undefined, true);
            }

            var model = !this.rootModel ? [] : this.rootModel.mySubcomponents().map(function (item) {
                var result = item.dehydrate(true);
                return result;
            });

            var drawing = !this.drawing ? [] : this.drawing.mySubcomponents().map(function (item) {
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
        },

        saveSession: function (syncPayload, sessionName, onComplete) {
            var self = this;
            self.sessionStorageDate = Date.now();
            var key = self.documentName || sessionName || this.localStorageKey;
            if (storage) {
                storage.setItem('currentSession', key);
                storage.setItem(key, key ? syncPayload : '');
            }
            if (storage) {
                storage.setItem(sessionName || this.localStorageKey, syncPayload);
            }
            onComplete && onComplete();
            fo.publish('workspaceSessionSaved', [self])
        },

        restoreSession: function (sessionName, syncToModelFn) {
            var self = this;
            var syncPayload;
            if (sessionStorage) {
                if (storage) {
                    var key = storage.getItem('currentSession');
                    syncPayload = key ? storage.getItem(key) : undefined;

                    //uncomment this code to flush the local store
                    //storage.setItem(key, '');
                    //storage.setItem('currentSession', '');
                    //storage.setItem(this.localStorageKey, syncPayload);
                }
                if (storage && !syncPayload) {
                    syncPayload = storage.getItem(sessionName || this.localStorageKey);
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
        },

        payloadExportSave: function (payload, name, ext) {
            var self = this;
            self.isDocumentSaved = true;
            self.documentName = name;
            self.documentExt = ext;

            var resut = this.payloadSaveAs(payload, name, ext);
            fo.publish('WorkspaceExportSave', [self])

            return resut;
        },

        payloadOpenMerge: function (payload, name, ext) {
            var self = this;
            self.isDocumentSaved = true;
            self.documentName = name;
            self.documentExt = ext;

            var result = this.payloadToCurrentModel(payload);
            fo.publish('WorkspaceOpenMerge', [self])

            return result;
        },

        payloadToCurrentModel: function (payload) {
            if (!payload) return;

            var spec = fo.parsePayload(payload);
            return this.specToModelSync(spec);
        },

        currentModelToPayload: function (command, persist, keepSelection) {
            var spec = this.modelToSpec(command, persist, keepSelection);

            return tools.stringifyPayload(spec);
        },

        modelAsPayload: function () {
            var spec = this.modelToSpec();
            return tools.stringifyPayload(spec, undefined, 3);
        },

        syncModelPagesToRootModel: function () {
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
        },

        syncRootModelToModelPages: function () {
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


    });

    ns.makeModel = function (template, parent) {
        var model = ns.makeComponent(template.spec, template.Subcomponents, parent);
        model.myName = template.myName;
        model.myParent = parent; //models should be aware of their workspace
        return model;
    };

    //SRS new stuff
    ns.makeModelWorkspace = function (name, properties, modelSpec) {

        var spaceSpec = {
            localStorageKey: name + 'Session',
        }

        var space = new Workspace(tools.union(spaceSpec, properties));

        //setup root model
        var defaultTemplate = {
            myName: name,
            spec: modelSpec,
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



}(Foundry, Foundry.tools, Foundry.ws));
