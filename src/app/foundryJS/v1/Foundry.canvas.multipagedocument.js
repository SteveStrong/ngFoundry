/*
    Foundry.canvas.document.js part of the FoundryJS project
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
Foundry.createjs = this.createjs || {};


(function (ns, fo, createjs, undefined) {

    var utils = fo.utils;
    //now define the page...

    var documentSpec = {
        drawingId: 'drawingRoot',
        pageClass: '',
        screenWidth: 800, // so you can revert to defaults
        screenHeight: 600,
        leftMargin: 0,
        rightMargin: 0,
        allowShapeDrop: true,
        allowShapePull: true,
        viewWidth: function () {
            return this.screenWidth - this.leftMargin - this.rightMargin;
        },
        topMargin: 0,
        bottomMargin: 0,
        viewHeight: function () {
            return this.screenHeight - this.topMargin - this.bottomMargin;
        },
        doZoom1To1: function () {
            var page = this.page;
            page && page.zoom1To1(page.updatePIP);
        },
        doZoomToFit: function () {
            var page = this.page;
            page && page.zoomToFit(page.updatePIP);
        },
        zoomDelta: 1.1,
        doZoomOut: function () {
            var page = this.page;
            page && page.zoomBy(1 / this.zoomDelta);
        },
        doZoomIn: function () {
            var page = this.page;
            page && page.zoomBy(this.zoomDelta);
        },
    }

    var Document = function (properties, subcomponents, parent) {
        var spec = utils.union(documentSpec, properties);

        this.base = fo.Component;
        this.base(spec, subcomponents, parent);
        this.myType = 'Document';

        return this;
    }


    Document.prototype = (function () {
        var anonymous = function () { this.constructor = Document; };
        anonymous.prototype = fo.Component.prototype;
        return new anonymous();
    })();

    ns.Document = Document;

    ns.makeDocument = function (properties, parent) {
        var result = new Document(properties, undefined, parent);

        fo.subscribe('canvasResize', function (element, width, height) {
            if (result.pageElement == element) {
                result.setScreenSize(width, height);
            }
        });

        fo.subscribe('WorkspaceClear', function (space) {
            fo.publish('previewPage', [space.currentPage()]);
        });

        fo.subscribe('WorkspaceOpenMerge', function (space) {
            fo.publish('previewPage', [space.currentPage()]);
        });

        fo.subscribe('WorkspaceExportSave', function (space) {
            fo.publish('previewPage', [space.currentPage()]);
        });

        return result;
    }

    utils.isaDocument = function (obj) {
        return obj instanceof Document ? true : false;
    };


    Document.prototype.establishCanvasElement = function (pageId) {
        var drawingId = this.drawingId;
        var pageClass = this.pageClass;

        var root = document.getElementById(drawingId);
        if (!root) root = document.getElementsByTagName("body")[0];
        if (!pageId) return;

        var canvas = document.getElementById(pageId);
        if (!canvas) {
            var canvas = document.createElement('canvas');
            canvas.id = pageId;
            pageClass && canvas.classList.add(pageClass);
            root.appendChild(canvas);
        }
        return canvas;
    }

    Document.prototype.removeCanvasElement = function (pageId) {
        var drawingId = this.drawingId;
        var root = document.getElementById(drawingId);
        if (!root) root = document.getElementsByTagName("body")[0];
        if (!pageId) return;

        var canvas = document.getElementById(pageId);
        if (canvas) {
            //SRS TODO make sure you are not creating memory leak by having
            //SRS TODO items attached to this canvas
            root.removeChild(canvas);
        }
        return canvas;
    }

    Document.prototype.setScreenSize = function (w, h) {
        var drawing = this;
        fo.runWithUIRefreshLock(function () {
            drawing.screenWidth = w;
            drawing.screenHeight = h;
            drawing.Subcomponents.forEach(function (page) {
                page.setCanvasWidth(w);
                page.setCanvasHeight(h);
            })
        });
    };

    Document.prototype.forceLayoutOfAllPages = function () {
        this.Subcomponents.forEach(function (item) {
            item.forceLayout();
        });
    }

    Document.prototype.setCurrentPage = function (page, makeActive) {
        this.page = page;
        if (makeActive) {
            this.Subcomponents.forEach(function (item) {
                item.isActive = false;
            });
            page.isActive = true;
        }
        return page;
    }

    Document.prototype.currentPage = function () {
        return this.page;
    }

    Document.prototype.isCurrentPage = function (pageId) {
        var page = this.currentPage();
        if (!page) return;
        var result = page.pageId == pageId || page == pageId;
        return result;
    }

    Document.prototype.createPage = function (pageId, properties) {
        if (!pageId) return;

        var spec = properties || {};
        //once created this value should not be smashed!!!
        this.establishCanvasElement(pageId);
        var page = ns.makePage2D(pageId, spec, this);

        this.setCurrentPage(this.addSubcomponent(page, pageId));

        page.setCanvasWidth(this.screenWidth);
        page.setCanvasHeight(this.screenHeight);
        fo.publish('PageCreated', [page]);

        return page;
    };

    Document.prototype.deletePage = function (pageId) {
        if (!pageId) return;
        //if (this.Subcomponents.count == 1) return;

        var page = this.getSubcomponent(pageId);
        this.Subcomponents.remove(page);
        fo.publish('PageDeleted', [page]);
        this.removeCanvasElement(pageId);

        return page;
    };

    Document.prototype.forEachPage = function (func) {
        var list = [];
        this.Subcomponents.forEach(function (item) {
            var value = func && func(item)
            if (value) list.push(value);
        });
        return list;
    }

    Document.prototype.showAllPages = function (style) {
        this.Subcomponents.forEach(function (item) {
            var canvas = item.pageId && document.getElementById(item.pageId);
            if (canvas) {
                canvas.style.display = style ? style : "inline";
            }
        });
    }

    Document.prototype.showPage = function (page) {
        if (!page) return;
        this.Subcomponents.forEach(function (item) {
            var canvas = item.pageId && document.getElementById(item.pageId);
            if (canvas) {
                canvas.style.display = page == item ? "block" : "none";
            }
        });
        this.setCurrentPage(page, true);
        return page;
    }

    Document.prototype.establishPage = function (pageId, properties, context) {
        if (!pageId) return;

        var page = this.getSubcomponent(pageId);
        page = page || this.createPage(pageId, properties);
        if (context) {
            page.resetContext(context);
        }

        fo.publish('PageSelected', [page]);
        fo.publish('previewPage', [page]);
        return page;
    }

    Document.prototype.findPage = function (pageid) {
        return this.getSubcomponent(pageid);
    }



    Document.prototype.firstPage = function () {
        return this.Subcomponents.first();
    }

    Document.prototype.lastPage = function () {
        return this.Subcomponents.last();
    }

    Document.prototype.nextPage = function (current) {
        var page = current ? current : this.page;

        var subcomponents = this.Subcomponents;

        var index = subcomponents.indexOf(page);
        var found = subcomponents.itemByIndex(index + 1);

        return found ? found : page;
    }

    Document.prototype.previousPage = function (current) {
        var page = current ? current : this.page;

        var subcomponents = this.Subcomponents;

        var index = subcomponents.indexOf(page);
        var found = index > 0 && subcomponents.itemByIndex(index - 1);


        return found ? found : page;
    }

    //srs
    Document.prototype.movePageForward = function (current) {
        var page = this.previousPage(current);
        if (!page || page == current) return;

        var subcomponents = this.Subcomponents;
        var index = subcomponents.indexOf(page);
        subcomponents.remove(current);
        subcomponents.insertNoDupe(index, current);
    }

    Document.prototype.movePageBackward = function (current) {
        var page = this.nextPage(current);
        if (!page || page == current) return;

        var subcomponents = this.Subcomponents;
        var index = subcomponents.indexOf(page);
        subcomponents.remove(current);
        subcomponents.insertNoDupe(index, current);
    }



}(Foundry.canvas, Foundry, Foundry.createjs));

