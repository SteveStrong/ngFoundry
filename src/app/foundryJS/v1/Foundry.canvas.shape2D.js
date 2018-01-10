/*
    Foundry.undo.js part of the FoundryJS project
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

//Shape2D
(function (ns, fo, create, undefined) {
    var tween = create.Tween;
    var utils = fo.utils;

    ns.colorsFill = ['#FFFFFF', '#FFFF99', '#FFFF33', '#FFCC66', '#FFCC00', '#CC9900', '#996600', '#663300', '#000000', '#000000', '#000000', '#000000', '#000000'];
    ns.colorsText = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'];

    ns.standardNoteOffset = 10;
    ns.standardNoteSize = 150;
    ns.minNoteSize = 50;

    ns.updateShapeForLayout = function (shape) {

        //fo.trace.log(shape.gcsIndent(" updateShapeForLayout start " + shape.myName));

        shape.shapeDepth = shape.componentDepth();
        shape.groupDepth = shape.branchDepth();
        shape.inGroup = shape.isInGroup();

        function segmentHeight(item) {
            var depth = item.groupDepth; //
            if (depth > 0 || item.inGroup) {
                return ns.minNoteSize;
            }
            var height = item.minHeight > 0 ? item.minHeight : ns.standardNoteSize;
            return height;
        }

        function segmentWidth(item) {
            var depth = item.groupDepth; //
            if (depth <= 0) return ns.standardNoteSize;
            if (depth <= 1) return item.minWidth + depth * ns.standardNoteOffset;

            item.applyToChildren(ns.updateShapeForLayout);

            var list = item.Subcomponents;
            var total = list.sumAll('width', ns.standardNoteOffset);
            return total;
        }

        shape.segHeight = segmentHeight(shape);
        shape.segWidth = segmentWidth(shape);

        var count = ns.colorsFill.length - 1;
        var depth = shape.groupDepth;
        var colorDepth = depth > count ? count : depth;

        shape.textColor = ns.colorsText[colorDepth || 0];
        shape.fillColor = ns.colorsFill[colorDepth || 0];
        shape.strokeColor = ns.colorsFill[colorDepth + 1];

        //fo.trace.log(shape.gcsIndent(" updateShapeForLayout done " + shape.myName));

        return shape;
    }

    var shape2DSpec = {
        pinX: function () {
            var offset = ns.standardNoteOffset;
            var depth = this.mySiblingsMaxValue('groupDepth', 0);
            if (this.groupDepth == 0 && depth == 0) return offset;

            //horizontal location is based on position in subcomponents collection
            var list = this.mySiblingsBefore();
            var total = list.sumAll('width', offset);
            return total;
        },
        pinY: function () {
            var offset = ns.minNoteSize;
            //var count = this.myParent && this.myParent.Subcomponents.count;
            if (this.groupDepth > 0) return offset;
            var depth = this.mySiblingsMaxValue('groupDepth', 0);
            if (this.groupDepth == 0 && depth > 0) return offset;

            //vertical location is based on position in subcomponents collection
            var list = this.mySiblingsBefore();
            var total = list.sumAll('height', offset);
            return total;
        },
        locX: function () { return 0.0 * this.width; },
        locY: function () { return 0.0 * this.height; },
        minWidth: function () { return ns.standardNoteSize; },
        minHeight: function () { return ns.minNoteSize; },
        width: function () {
            this.context; //take a dependency on the context...
            var result = Math.max(this.segWidth, this.minWidth);
            if (isNaN(result)) result = ns.standardNoteSize
            return result;
        },
        height: function () {
            this.context; //take a dependency on the context...
            var result = Math.max(this.segHeight || this.minHeight);
            if (isNaN(result)) result = ns.standardNoteSize
            return result;
        },
        headerText: function () {
            var context = this.context;
            if (!context) return this.myName;
            return context.headerText || context.myName;
        },
        headline: function () {
            return create.createText('', "bold 12px Arial", ns.colorsText[0]);
        },
        background: function () { return create.createShape(); },
        selected: function () { return create.createShape(); },
        dropTarget: function () { return create.createShape(); },
        geom: function () {
            var container = create.createContainer();
            container && container.addChild(this.background, this.dropTarget, this.selected, this.headline);
            return container;
        },
        update: function () {
            var container = this.geom;
            if (!container) {
                return false;
            }

            var self = this;
            if (self.myParent && !self.myParent.update) {
                return false;
            }
            ns.updateShapeForLayout(self);

            
            var shapeWidth = this.width;
            var shapeHeight = this.height;

          
            var g = this.background.graphics.clear();

            fo.suspendDependencies(function () {
                var fill = self.fillColor;
                var stroke = self.strokeColor;
                g.beginFill(fill).beginStroke(stroke).setStrokeStyle(1).drawRect(0, 0, self.width, self.height).endStroke().endFill();
            });

            g = this.selected.graphics.clear();
            g.beginStroke("blue").setStrokeStyle(5).drawRect(3, 3, shapeWidth - 6, shapeHeight - 6).endStroke();

            g = this.dropTarget.graphics.clear();
            g.beginStroke("green").setStrokeStyle(5).drawRect(2, 2, shapeWidth - 4, shapeHeight - 4).endStroke();

            var headline = this.headline;

            headline.flowText(this.headerText, 21, 3); //char not size //width);

            headline.textAlign = "center";
            headline.textBaseline = "top";
            headline.lineWidth = shapeWidth - 10;
            headline.x = shapeWidth / 2;

            var height = headline.getMeasuredHeight();
            headline.y = (shapeHeight - height) / 2;

            fo.suspendDependencies(function () {
                headline.color = self.textColor;
                container.setTransform(self.pinX, self.pinY);
                self.selected.alpha = self.isSelected ? .5 : 0;
                self.dropTarget.alpha = self.isActiveTarget || self.isComplete ? .5 : 0;
            });
            return true;
        }
    }


    var Shape2D = function (properties, subcomponents, parent) {
        this.base = ns.Shape;
        //protect this spec from having the formulas for pinX and PinY being replaced with a value
        //this might be a good example of adding a guard() function like in visio
        var pinX = properties && properties.pinX;
        if (pinX && !fo.utils.isFunction(pinX)) {
            delete properties.pinX;
        }
        else {
            pinX = undefined;
        }

        var pinY = properties && properties.pinY;
        if (pinY && !fo.utils.isFunction(pinY)) {
            delete properties.pinY;
        }
        else {
            pinY = undefined;
        }

        this.base(utils.union(shape2DSpec, properties), subcomponents, parent);
        this.myType = (properties && properties.myType) || 'Shape2D';

        this.setXY(pinX, pinY)

        return this;
    };

    Shape2D.prototype = (function () {
        var anonymous = function () { this.constructor = Shape2D; };
        anonymous.prototype = ns.Shape.prototype;
        return new anonymous();
    })();

    ns.Shape2D = Shape2D;
    utils.isaShape2D = function (obj) {
        return obj instanceof Shape2D ? true : false;
    };

    Shape2D.prototype.setDefaultXY = function (point) {
        return this.setXY(point[0], point[1]);
    }

    Shape2D.prototype.setXY = function (x, y) {
        //assumes no rotation this will take time to do right
        if (!isNaN(x)) {
            this.pinX = this.locX + x;
        }
        if (!isNaN(y)) {
            this.pinY = this.locY + y;
        }
        return this;
    }


    ns.makeShape2D = function (properties, subcomponents, parent) {
        var shape = new Shape2D(properties, subcomponents, parent);

        //shape.tracePropertyLifecycle('geom');
        //shape.tracePropertyLifecycle('update')
        //shape.tracePropertyLifecycle('pinX')

        var prop = shape.getProperty('isVisible')
        prop.onValueSet = function (value, formula, owner) {
            owner.geom.isVisible = value;
        }

        shape.setVisualState = function (state, rule, duration, onComplete) {

            if (rule && duration && onComplete) {
                var geom = shape.geom;
                shape.MorphTo(geom, rule, duration, create.Ease.linear, onComplete);
                return;
            }

            if (state.matches('isActiveTarget') || state.matches('isComplete')) {
                var alpha = shape.isActiveTarget || shape.isComplete ? .5 : 0;
                var dropTarget = shape.dropTarget;
                if (!dropTarget || dropTarget.alpha == alpha) return;

                shape.MorphTo(dropTarget, { alpha: alpha }, 10, create.Ease.linear, function () {
                    dropTarget.alpha = alpha;
                    // ns.trace && ns.trace.info("dropTarget: " + shape.myName + '  alpha = ' + alpha);
                });
                return;
            }

            if (state.matches('isSelected')) {
                var alpha = shape.isSelected ? .5 : 0;
                var selected = shape.selected;
                if (!selected || selected.alpha == alpha) return;

                shape.MorphTo(selected, { alpha: alpha }, 10, create.Ease.linear, function () {
                    selected.alpha = alpha;
                    //ns.trace && ns.trace.info("Selected: " + shape.myName + '  alpha = ' + alpha);
                });
                return;
            }

            if (state.matches('canPullFromGroup')) {
                //shape.MorphTo(container, { skewY: 10, skewX: 10 }, 100, createjs.Ease.linear, function () {  //backInOut
                //    container.skewY = 0;
                //    container.skewX = 0;
                //});
                var container = shape.geom;
                if (!container ) return;

                shape.MorphTo(container, { skewY: 2 }, 100, create.Ease.linear, function () {  //backInOut
                    container.skewY = 0;
                });
                return;
            }
        }

        return shape;
    };

}(Foundry.canvas, Foundry, Foundry.createjs));

//noteShape2D
(function (ns, fo, create, undefined) {

    var tween = create.Tween;
    var utils = fo.utils;

    var noteShape2D =  {
        noteText: function () {
            return this.context ? this.context.noteText : this.headerText;
        },
        note: function () {
            return create.createText('', "10px Arial", ns.colorsText[0]);
        },
        isTextDifferent: function () {
            if (this.headerText == this.noteText) return false;
            if (!this.headerText || !this.noteText) return false;
            return !this.headerText.matches(this.noteText);
        },
        height: function () {
            this.context; //take a dependency on the context...
            var result = Math.max(this.segHeight || this.minHeight);
            if (isNaN(result)) result = ns.standardNoteSize;
            if (!this.isTextDifferent) return result;
            var hasMembers = this.hasGroupMembers();
            var inGroup = this.isInGroup();
            if (hasMembers || inGroup) return result;
            result = ns.standardNoteSize;
            return result;
        },
        bitmap: function () {
            var context = this.context;
            if (!context) return;

            //http://stackoverflow.com/questions/13494746/canvas-cross-domain-pixel-error
            if (context.imageUri) {
                var imageWidth = this.minWidth;
                var bitmap = create.createBitmap(context.imageUri);
                var image = bitmap.image;
                image.onload = function () {
                    bitmap.loaded = true;
                    var ratio = bitmap.image.width / bitmap.image.height;
                    if (bitmap.image.width > imageWidth) {
                        var scale = imageWidth / bitmap.image.width;
                        bitmap.scaleX = scale
                        bitmap.scaleY = scale;
                    }
                }
                return bitmap;
            }
            if (context.dataUri) {
                var bitmap = create.createBitmap(context.dataUri);
                var ratio = bitmap.image.width / bitmap.image.height;

                var maxWidth = 400;
                if (bitmap.image.width > maxWidth) {
                    var scale = maxWidth / bitmap.image.width;
                    bitmap.scaleX = scale
                    bitmap.scaleY = scale;
                }
                return bitmap;
            }
        },
        geom: function () {
            var container = create.createContainer();
            container && container.addChild(this.background, this.bitmap, this.dropTarget, this.selected, this.note, this.headline);
            return container;
        },
        update: function () {
            if (!this.geom) return false;

            var self = this;
            ns.updateShapeForLayout(self);

            var container = this.geom;

            var shapeWidth = this.width;
            var shapeHeight = this.height;

            this.note.lineWidth = shapeWidth - (2 * ns.standardNoteOffset);
            this.headline.lineWidth = shapeWidth - ns.standardNoteOffset;

            var g = this.background.graphics.clear();
            fo.suspendDependencies(function () {
                var fill = self.fillColor;
                var stroke = self.strokeColor;
                g.beginFill(fill).beginStroke(stroke).setStrokeStyle(1).drawRect(0, 0, self.width, self.height).endStroke().endFill();
            });

            //var fill = this.fillColor;
            //var stroke = this.strokeColor;
            //g.beginFill(fill).beginStroke(stroke).setStrokeStyle(1).drawRect(0, 0, shapeWidth, shapeHeight).endStroke().endFill();

            g = this.selected.graphics.clear();
            g.beginStroke("blue").setStrokeStyle(5).drawRect(3, 3, shapeWidth - 6, shapeHeight - 6).endStroke();

            g = this.dropTarget.graphics.clear();
            g.beginStroke("green").setStrokeStyle(5).drawRect(2, 2, shapeWidth - 4, shapeHeight - 4).endStroke();

            var context = this.context;
            var note = this.note;
            var headline = this.headline;

            var hasMembers = this.hasGroupMembers();
            var inGroup = this.isInGroup();

            if (context) {

                headline.flowText(context.headerText, 21, 3); //char not size //width);

                headline.textAlign = "center";
                headline.textBaseline = "top";
                headline.x = shapeWidth / 2;

                var headlineHeight = headline.getMeasuredHeight();
                headline.y = (shapeHeight - headlineHeight) / 2;


                note.flowText(context.noteText, 25, 15); //char not size //width);

                note.x  = (shapeWidth - note.lineWidth) / 2;

                note.textAlign = "left";
                note.textBaseline = "top";

                var noteHeight = note.getMeasuredHeight();
                 note.y = ns.minNoteSize;

                if (hasMembers || inGroup) {
                    note.visible = false;
                }
                else  {
                    note.visible = this.isTextDifferent;
                    if (note.visible) {
                        headline.y = (ns.minNoteSize - headlineHeight) / 2;
                    }
                }             
            }

            fo.suspendDependencies(function () {
                headline.color = self.textColor;
                container.setTransform(self.pinX, self.pinY);
                self.selected.alpha = self.isSelected ? .5 : 0;
                self.dropTarget.alpha = self.isActiveTarget || self.isComplete ? .5 : 0;
            });

            return true;
        },
    };


    ns.makeNoteShape2D = function (properties, subcomponents, parent) {
        var customSpec = utils.union(noteShape2D, properties);
        var shape = ns.makeShape2D(customSpec, subcomponents, parent);

        return shape;
    };


}(Foundry.canvas, Foundry, Foundry.createjs));


//noteShape1D
(function (ns, fo, create, undefined) {

    var tween = create.Tween;
    var utils = fo.utils;

 


    ns.makeShape1D = function (properties, subcomponents, parent) {
        var shape = ns.makeShape2D({}, subcomponents, parent);
        return shape;
    };


}(Foundry.canvas, Foundry, Foundry.createjs));



//TableShape
(function (ns, fo, create, undefined) {
    var tween = create.Tween;
    var utils = fo.utils;


    var tableShape2DSpec = {
        pinX: function () {
            var offset = ns.standardNoteOffset;
            var depth = this.mySiblingsMaxValue('groupDepth', 0);
            if (this.groupDepth == 0 && depth == 0) return offset;

            //horizontal location is based on position in subcomponents collection
            var list = this.mySiblingsBefore();
            var total = list.sumAll('width', offset);
            return total;
        },
        pinY: function () {
            var offset = ns.minNoteSize;
            //var count = this.myParent && this.myParent.Subcomponents.count;
            if (this.groupDepth > 0) return offset;
            var depth = this.mySiblingsMaxValue('groupDepth', 0);
            if (this.groupDepth == 0 && depth > 0) return offset;

            //vertical location is based on position in subcomponents collection
            var list = this.mySiblingsBefore();
            var total = list.sumAll('height', offset);
            return total;
        },
        locX: function () { return 0.0 * this.width; },
        locY: function () { return 0.0 * this.height; },
        minWidth: function () { return ns.standardNoteSize; },
        minHeight: function () { return ns.minNoteSize; },
        width: function () {
            this.context; //take a dependency on the context...
            var result = Math.max(this.segWidth, this.minWidth);
            if (isNaN(result)) result = ns.standardNoteSize
            return result;
        },
        height: function () {
            this.context; //take a dependency on the context...
            var result = Math.max(this.segHeight || this.minHeight);
            if (isNaN(result)) result = ns.standardNoteSize
            return result;
        },
        headerText: function () {
            var context = this.context;
            if (!context) return this.myName;
            return context.headerText || context.myName;
        },
        headline: function () {
            return create.createText('', "bold 12px Arial", ns.colorsText[0]);
        },
        background: function () { return create.createShape(); },
        selected: function () { return create.createShape(); },
        dropTarget: function () { return create.createShape(); },
        geom: function () {
            var container = create.createContainer();
            container && container.addChild(this.background, this.dropTarget, this.selected, this.headline);
            return container;
        },
        update: function () {
            var container = this.geom;
            if (!container) {
                return false;
            }

            var self = this;
            if (self.myParent && !self.myParent.update) {
                return false;
            }
            ns.updateShapeForLayout(self);


            var shapeWidth = this.width;
            var shapeHeight = this.height;


            var g = this.background.graphics.clear();

            fo.suspendDependencies(function () {
                var fill = 'yellow';
                var stroke = 'black';
                g.beginFill(fill).beginStroke(stroke).setStrokeStyle(1).drawRect(0, 0, self.width, self.height).endStroke().endFill();
            });

            g = this.selected.graphics.clear();
            g.beginStroke("blue").setStrokeStyle(5).drawRect(3, 3, shapeWidth - 6, shapeHeight - 6).endStroke();

            g = this.dropTarget.graphics.clear();
            g.beginStroke("green").setStrokeStyle(5).drawRect(2, 2, shapeWidth - 4, shapeHeight - 4).endStroke();

            var headline = this.headline;
            headline.textAlign = "center";
            headline.textBaseline = "top";
            headline.lineWidth = shapeWidth - 10;
            headline.x = shapeWidth / 2;

            var height = headline.getMeasuredHeight();
            headline.y = (shapeHeight - height) / 2;

            fo.suspendDependencies(function () {
                headline.color = self.textColor;
                container.setTransform(self.pinX, self.pinY);
                self.selected.alpha = self.isSelected ? .5 : 0;
                self.dropTarget.alpha = self.isActiveTarget || self.isComplete ? .5 : 0;
            });
            return true;
        }
    }


    var TableShape2D = function (properties, subcomponents, parent) {
        this.base = ns.Shape;
        //protect this spec from having the formulas for pinX and PinY being replaced with a value
        //this might be a good example of adding a guard() function like in visio
        var pinX = properties && properties.pinX;
        if (pinX && !fo.utils.isFunction(pinX)) {
            delete properties.pinX;
        }
        else {
            pinX = undefined;
        }

        var pinY = properties && properties.pinY;
        if (pinY && !fo.utils.isFunction(pinY)) {
            delete properties.pinY;
        }
        else {
            pinY = undefined;
        }

        this.base(utils.union(tableShape2DSpec, properties), subcomponents, parent);
        this.myType = (properties && properties.myType) || 'TableShape2D';

        this.setXY(pinX, pinY)

        return this;
    };

    TableShape2D.prototype = (function () {
        var anonymous = function () { this.constructor = TableShape2D; };
        anonymous.prototype = ns.Shape.prototype;
        return new anonymous();
    })();

    ns.TableShape2D = TableShape2D;
    utils.isaTableShape2D = function (obj) {
        return obj instanceof TableShape2D ? true : false;
    };

    TableShape2D.prototype.setDefaultXY = function (point) {
        return this.setXY(point[0], point[1]);
    }

    TableShape2D.prototype.setXY = function (x, y) {
        //assumes no rotation this will take time to do right
        if (!isNaN(x)) {
            this.pinX = this.locX + x;
        }
        if (!isNaN(y)) {
            this.pinY = this.locY + y;
        }
        return this;
    }


    ns.makeTableShape2D = function (properties, subcomponents, parent) {
        var shape = new TableShape2D(properties, subcomponents, parent);

        //shape.tracePropertyLifecycle('geom');
        //shape.tracePropertyLifecycle('update')
        //shape.tracePropertyLifecycle('pinX')

        var prop = shape.getProperty('isVisible')
        prop.onValueSet = function (value, formula, owner) {
            owner.geom.isVisible = value;
        }

        shape.setVisualState = function (state, rule, duration, onComplete) {

            if (rule && duration && onComplete) {
                var geom = shape.geom;
                shape.MorphTo(geom, rule, duration, create.Ease.linear, onComplete);
                return;
            }

            if (state.matches('isActiveTarget') || state.matches('isComplete')) {
                var alpha = shape.isActiveTarget || shape.isComplete ? .5 : 0;
                var dropTarget = shape.dropTarget;
                if (!dropTarget || dropTarget.alpha == alpha) return;

                shape.MorphTo(dropTarget, { alpha: alpha }, 10, create.Ease.linear, function () {
                    dropTarget.alpha = alpha;
                    // ns.trace && ns.trace.info("dropTarget: " + shape.myName + '  alpha = ' + alpha);
                });
                return;
            }

            if (state.matches('isSelected')) {
                var alpha = shape.isSelected ? .5 : 0;
                var selected = shape.selected;
                if (!selected || selected.alpha == alpha) return;

                shape.MorphTo(selected, { alpha: alpha }, 10, create.Ease.linear, function () {
                    selected.alpha = alpha;
                    //ns.trace && ns.trace.info("Selected: " + shape.myName + '  alpha = ' + alpha);
                });
                return;
            }

            if (state.matches('canPullFromGroup')) {
                //shape.MorphTo(container, { skewY: 10, skewX: 10 }, 100, createjs.Ease.linear, function () {  //backInOut
                //    container.skewY = 0;
                //    container.skewX = 0;
                //});
                var container = shape.geom;
                if (!container) return;

                shape.MorphTo(container, { skewY: 2 }, 100, create.Ease.linear, function () {  //backInOut
                    container.skewY = 0;
                });
                return;
            }
        }

        return shape;
    };

}(Foundry.canvas, Foundry, Foundry.createjs));

(function (ns, cv, undefined) {
    if (!ns.establishType) return;

    ns.establishType('Shape2D', {}, cv.makeShape2D);
    ns.establishType('noteShape2D', {}, cv.makeNoteShape2D);
    ns.establishType('tableShape2D', {}, cv.makeTableShape2D);
    ns.establishType('Shape1D', {}, cv.makeShape1D);

}(Foundry, Foundry.canvas));
