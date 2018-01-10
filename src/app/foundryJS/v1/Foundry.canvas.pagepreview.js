/*
    Foundry.canvas.pagepreview.js part of the FoundryJS project
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

    var panning = false;

    var PagePreviewWindow = function (properties, subcomponents, parent) {

        //define a hit testable object to render and represent the true drawing size
        var viewWindowSpec = {
            geom: function () {
                var geom = new createjs.Shape();
                geom.alpha = .2;
                return geom;
            },
        }

        var panAndZoomSpec = {
            title: 'pan zoom',
            canvasWH: function () {
                var width = this.canvasWidth;
                var height = this.canvasHeight;
                return 'w:{0}  h:{1}'.format(width, height)
            },
            percentMargin: -0.02,
            percentSize: .25,
            draggable: true,
            canDoWheelZoom: false,
            //parentScale: function() {
            //    return this.myParent ?  this.myParent.scale : 1.0;
            //},
            //scaleFactor: function () {
            //    return this.scale / this.parentScale;
            //},
            drawingGeom: function () {
                var result = new createjs.Shape();
                return result;
            },
            viewWindowShape: function () {
                var result = ns.makeShape(viewWindowSpec, {}, this);
                this.addSubcomponent(result);
                return result;
            },
            viewWindowGeom: function () {
                var geom = this.viewWindowShape.geom;
                return geom;
            },
            canvasElement : '',
            pipElement: '',
            isVisible: true,
            doTogglePanZoomWindow: function () {
                if (this.pipElement) {
                    this.isVisible = !this.isVisible;
                    this.pipElement.style.display = this.isVisible ? "block" : "none";
                    this.smashProperty('isPanZoomWindowOpen');
                }
            },
            isPanZoomWindowOpen: function () {
                return this.pipElement ? this.isVisible : false;
            }
        };

        this.base = ns.Page2DCanvas;
        this.base(utils.union(panAndZoomSpec, properties), subcomponents, parent);
        this.myType = 'PagePreviewWindow';
        return this;
    }


    PagePreviewWindow.prototype = (function () {
        var anonymous = function () { this.constructor = PagePreviewWindow; };
        anonymous.prototype = ns.Page2DCanvas.prototype;
        return new anonymous();
    })();

    ns.PagePreviewWindow = PagePreviewWindow;

    ns.makePagePreviewWindow2D = function (id, pipId, spec, parent) {
        var element = fo.utils.isString(id) ? document.getElementById(id) : id;
        var pipElement = fo.utils.isString(pipId) ? document.getElementById(pipId) : pipId;
        var canvasElement = (spec && spec.canvasElement) || element || document.createElement('canvas');

        var properties = spec || {};
        properties.canvasElement = canvasElement;
        properties.pipElement = pipElement;
        var pzSelf = new PagePreviewWindow(properties, {}, parent);
        var space = parent;


        fo.subscribe('previewPage', function (page) {
            pzSelf.isVisible &&  pzSelf.draw(page, 'black');
            fo.publish('pip', ['update']);
        });

        fo.subscribe('PageResized', function (page) {
            var drawing = space.drawing;
            if (drawing) {
                pzSelf.setSize(drawing.screenWidth, drawing.screenHeight, page);
            }
        });

        //this must be called or the page will not scale
        var pageToView = space.currentPage();
        fo.publish('PageResized', [pageToView]);


        fo.subscribe('ShapeReparented', function (child, oldParent, newParent, loc) {
            //fo.publish('info', ['ShapeReparented']);
            var page = newParent.rootPage();
            pzSelf.isVisible && pzSelf.draw(page, 'black');
            fo.publish('pip', ['reparent']);
        });


        fo.subscribe('ShapeMoved', function (uuid, model, shape) {
            //if model is undefined then you are panning
            //so just repaint in black
            panning = false;

            //fo.publish('info', ['ShapeMoved']);
            var page = shape.rootPage();
            model && pzSelf.isVisible && pzSelf.draw(page, 'black');
            fo.publish('pip', ['moved']);
        });

        //this is used to move the small redish window that pans the drawing surface
        fo.subscribe('ShapeMoving', function (page, shape, ev) {
            if (!shape || !page) return;

            //adjust the pan on the page
            // fo.publish('info', ['ShapeMoving']);

            if (page == pzSelf && shape == pzSelf.viewWindowShape) {
                var viewWindowGeom = pzSelf.viewWindowGeom;
                var parent = space.currentPage();
                var scale = parent.scale;
                var panX = viewWindowGeom.x * scale;
                var panY = viewWindowGeom.y * scale;
                parent.setPanTo(-panX, -panY);
                pzSelf.isVisible && pzSelf.draw(parent, 'black');
                panning = true;
            }
            else if (!panning) {
                pzSelf.isVisible && pzSelf.draw(page, 'black');
            }
            fo.publish('pip', ['moving']);
        });


        return pzSelf;
    };

    utils.isaPagePreviewWindow = function (obj) {
        return obj instanceof PagePreviewWindow ? true : false;
    };


    PagePreviewWindow.prototype.draw = function (page, color) {

        function renderPageOutline(g, obj, x, y) {
            obj.Subcomponents.forEach(function (item) {
                var geom = item.geom;
                var locX = x + geom.x;
                var locY = y + geom.y;
                g.drawRect(locX, locY, item.width, item.height);

                if (item.Subcomponents.count) {
                    renderPageOutline(g, item, locX, locY);
                }
            });
        }

        var pzSelf = this;
        var stage = pzSelf.stage;

        var drawingGeom = pzSelf.drawingGeom;
        pzSelf.establishChild(drawingGeom);

        var psScale = pzSelf.scale;
        var viewWindowShape = pzSelf.viewWindowShape;
        var viewWindowGeom = pzSelf.viewWindowGeom;


        var g = drawingGeom.graphics;
        g.clear();

        //do all the to draw the gray page outline
        //SRS mod draw the page size and location
        var x = pzSelf.drawingMargin;
        var y = pzSelf.drawingMargin;
        var w = pzSelf.drawingWidth;
        var h = pzSelf.drawingHeight;
        g.beginFill("gray").drawRect(x, y, w, h).endFill();

        if (page && page.Subcomponents.count) {
            g.beginFill(color ? color : "black");
            renderPageOutline(g, page, 0, 0);
            g.endFill();
        }



        //do all the to draw the redish window
        //maybe manage this geometry the same way as a 2D Shape
        pzSelf.establishChild(viewWindowGeom);

        //this is an anti scale pattern
        if (page) {
            var scale = page.scale;
            var pinX = page.panX / scale;
            var pinY = page.panY / scale;
            var width  = page.canvasWidth / scale;
            var height = page.canvasHeight / scale;

            viewWindowShape.width = width;
            viewWindowShape.height = height;

            viewWindowGeom.x = -pinX;
            viewWindowGeom.y = -pinY;
        }

        var g = viewWindowGeom.graphics;
        g.clear();
        g.beginFill("red").drawRect(0, 0, width, height).endFill();

        stage.update();
    };


    PagePreviewWindow.prototype.computeViewPortOffset = function (x, y) {
        var viewPort = this.selected;
        var offset = viewPort.globalToLocal(x, y);
        return offset;
    }

    PagePreviewWindow.prototype.adjustPanUsingView = function (x, y, offset) {
        var viewPort = this.selected;
        var scale = -1.0 * this.scale / this.sizeFactor;

        var pt = viewPort.globalToLocal(x, y);

        viewPort.x += pt.x - offset.x;
        viewPort.y += pt.y - offset.y;
        return viewPort;
    }

    PagePreviewWindow.prototype.computePanUsingView = function () {
        var viewPort = this.selected;
        var scale = -1.0 * this.scale / this.sizeFactor;

        return { x: (viewPort.x * scale), y: (viewPort.y * scale) };
    }

    PagePreviewWindow.prototype.isViewPortHit = function (gX, gY) {
        var viewPort = this.selected;

        var obj = this;
        var parent = obj.myParent;
        var sizeFactor = obj.sizeFactor;
        var scale = obj.scale;

        var viewPortLeft = obj.panX * sizeFactor / scale;
        var viewPortTop = obj.panY * sizeFactor / scale;
        var viewPortWidth = parent.canvasWidth * sizeFactor / scale;
        var viewPortHeight = parent.canvasHeight * sizeFactor / scale;

        var pt1 = viewPort.localToGlobal(0, 0);
        if (gX < pt1.x) return false;
        if (gY < pt1.y) return false;

        var pt2 = viewPort.localToGlobal(viewPortWidth, viewPortHeight);
        if (gX > pt2.x) return false;
        if (gY > pt2.y) return false;

        if (gY >= pt1.y && gY <= pt2.y) {
            return true;
        }
    }

    PagePreviewWindow.prototype.setSize = function (width, height, page) {
        var pzSelf = this;
        var element = pzSelf.pipElement;
        element.style.width = 10 + (width * pzSelf.percentSize) + 'px';
        element.style.height = 10 + (height * pzSelf.percentSize) + 'px';

        pzSelf.setCanvasWidth(width * pzSelf.percentSize);
        pzSelf.setCanvasHeight(height * pzSelf.percentSize);
        pzSelf.zoomToFit(function () {
            page && pzSelf.draw(page);
        });
        fo.publish('pip', ['resize']);
    };

    PagePreviewWindow.prototype.setPosition = function (width, height) {
        var pzSelf = this;
        var element = pzSelf.pipElement;

        element.style.width = 10 + (width * pzSelf.percentSize) + 'px';
        element.style.height = 10 + (height * pzSelf.percentSize) + 'px';

        element.style.position = 'absolute';
        element.style.left = (width) + 'px';
        element.style.top = (height) + 'px';
        fo.publish('pip', ['repositioned']);
    };

}(Foundry.canvas, Foundry, Foundry.createjs));

