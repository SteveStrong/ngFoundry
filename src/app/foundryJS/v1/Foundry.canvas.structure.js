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

//Structure management for shapes...
(function (ns, fo, undefined) {

    var utils = fo.utils;
    //now define the page...

    fo.digestLockCount = 0;
    fo.globalDigestLock = function (cnt) {
        fo.digestLockCount = fo.digestLockCount + cnt;
        if (fo.digestLockCount == 0) {
            return fo.digestLockCount;
        }
        return fo.digestLockCount;
    };

    var digestMap = {}


    var prototype = ns.FoundryShape.prototype;

    prototype.doRepaint = function () {
        var prop = this._update;
         prop.smash();
         this.updateStage();
    }

    prototype.doUpdate = function (callback) {
        var prop = this._update;
        var id = prop.getID();
        fo.digestLock(undefined, function () {
            prop.smash();
            digestMap[id] = prop;
            callback && callback();
        });

        if (fo.digestLockCount == 0) {
            this.updateStage();
            //fo.publish('updatePanZoom', []);
        }
    }

    prototype.capture = function (shape, name, join) {
        var oldParent = this.captureSubcomponent(shape, name, join);

        //var note = shape.getID() + ' is now child of ' + this.getID();
        //fo.trace.warn(this.gcsIndent(note));

        if (fo.digestLockCount == 0) {
            shape.updateStage();
            //fo.publish('updatePanZoom', []);
        }
        return oldParent;
    }



    prototype.fxMod = function (extra) {
        if (!this.myParent || utils.isaDocument(this.myParent)) return;
        if (utils.isa2DCanvas(this.myParent)) {
            this.smashProperties(["height","width","update"]);
        }
        else {
            this.smashProperties(["height", "width", "pinX", "pinY", "update"]);
        }
        extra && this.smashProperties(extra);
    }

    prototype.markForUpdate = function () {
        var prop = this._update;
        var id = prop.getID();

        if (!digestMap[id]) {
            digestMap[id] = prop;
            //fo.trace.info(this.gcsIndent(prop.asLocalReference()) + " is marked for digest update");
        }

        this.fxMod();
    }

    prototype.forceLayout = function () {
        var scope = this;
        if (scope && scope.applyToSelfAndChildren) {
            scope.applyToSelfAndChildren(function () {
                if ( !this.fxMod ) {
                    return;
                }
                
               this.fxMod();
            }, true);
            scope.applyToSelfAndChildren(ns.updateShapeForLayout, true);
        }
        scope.render();
    }






    //you cannot assume a geom property exist on this object or the child
    prototype.unParentGeom = function (oldChild) {
        var oldParent = this;

        var parentGeom = oldParent.getProperty('geom');
        if (parentGeom && parentGeom.isValueKnown()) {

            var childGeom = oldChild.getProperty('geom');
            if (childGeom && childGeom.isValueKnown()) {
                parentGeom.getValue().removeChild(childGeom.getValue());
                return true;
            }
        }
    }

    prototype.reParentGeom = function (oldChild) {
        var oldParent = this;

        var parentGeom = oldParent.getProperty('geom');
        if (parentGeom && parentGeom.isValueKnown()) {

            var childGeom = oldChild.getProperty('geom');
            if (childGeom && childGeom.isValueKnown()) {
                parentGeom.getValue().addChild(childGeom.getValue());
                return true;
            }
        }
    }

    prototype.captureSubcomponent = function (subShape, name, join) {
        var newParent = this;
        var oldParent = subShape.myParent;

        if (name) subShape.myName = name;

        if (newParent.canCaptureSubcomponent(subShape)) {
            fo.digestLock(newParent,function () {

                if (oldParent && utils.isa2DCanvas(oldParent)) {
                    oldParent.removeSubcomponent(subShape);
                    oldParent.unParentGeom(subShape);

                    if (join) delete oldParent[name];

                    //only smash if shape is not new
                    subShape.fxMod();
                }
                else if (oldParent) {
                    //var oldname = oldParent.myName;
                    oldParent.removeSubcomponent(subShape);
                    oldParent.unParentGeom(subShape);

                    if (join) delete oldParent[name];

                    //oldParent.applyToSelfAndParents(ns.updateShapeForLayout);
                    oldParent.markForUpdate();

                    //only smash if shape is not new
                    subShape.fxMod();
                }

                //var myname = subShape.myName;
                //ns.updateShapeForLayout(subShape);

                if (newParent && utils.isa2DCanvas(newParent)) {
                    newParent.addSubcomponent(subShape);
                    newParent.reParentGeom(subShape);

                    if (join) newParent[name] = component;

                }
                else if (newParent) {
                    //var newname = newParent.myName;
                    newParent.addSubcomponent(subShape);
                    newParent.reParentGeom(subShape);

                    if (join) newParent[name] = component;

                    subShape.fxMod();
                    //newParent.applyToSelfAndChildren(ns.updateShapeForLayout);
                    newParent.markForUpdate();
                }

                subShape.markForUpdate();
            });
            return oldParent;
        }
    }

    prototype.captureInsertSubcomponent = function (index, subShape, name) {
        var newParent = this;
        var oldParent = subShape.myParent;

        if (name) subShape.myName = name;

        if (newParent.canCaptureSubcomponent(subShape)) {
            fo.digestLock(newParent,function () {

                if (oldParent && utils.isa2DCanvas(oldParent)) {
                    oldParent.removeSubcomponent(subShape);
                    oldParent.unParentGeom(subShape);

                    //only smash if shape is not new
                    subShape.fxMod();
                }
                else if (oldParent) {
                    //var oldname = oldParent.myName;
                    oldParent.removeSubcomponent(subShape);
                    oldParent.unParentGeom(subShape);

                    //oldParent.applyToSelfAndParents(ns.updateShapeForLayout);
                    oldParent.markForUpdate();

                    //only smash if shape is not new
                    subShape.fxMod();
                }

                   
                
                if (newParent && utils.isa2DCanvas(newParent)) {
                        newParent.insertSubcomponent(index, subShape);
                        newParent.reParentGeom(subShape);

                    }
                    else if (newParent) {
                        //var newname = newParent.myName;
                        newParent.insertSubcomponent(index, subShape);
                        newParent.reParentGeom(subShape);

                        subShape.fxMod();
                        //newParent.applyToSelfAndChildren(ns.updateShapeForLayout);
                        newParent.markForUpdate();
                    }

            });
            return oldParent;
        }
    }




    fo.globalDigestRefresh = function (scope, onChange) {
        var lock = fo.globalDigestLock(0);
        if (lock) return;

        var members = utils.getOwnPropertyValues(digestMap)

        if (members.length > 0) {  //0 is so we make sure complete fires..
            digestMap = {};

            members.forEach(function (prop) {
                if (!prop.isValueKnown()) {
                   var owner = prop.owner;
                   // fo.trace.log(owner.gcsIndent(prop.asLocalReference()) + " must be refreshed");

                    var result = prop.getValue();
                    //fo.trace.log(owner.gcsIndent(prop.asLocalReference()) + " is now refreshed " + result);
                }
            });
            onChange && onChange();
        }
    }






    //make sure things are run in content?
    fo.digestLock = function (scope, callback, onComplete) {
        var start = fo.globalDigestLock(1);
        var result = callback();
        var end = fo.globalDigestLock(-1);
        if (end == 0) {
            if (scope && scope.forceLayout) {
                scope.forceLayout();
            }
            fo.globalDigestRefresh(scope); //true or false on complete should run
            if (onComplete) {
                onComplete();
            }
        }
        return result;
    };


    function syncVisible (field, list, map) {
        var mapCopy = utils.union(map);
        var currentMap = fo.filtering.applyMapping(list, field);
        for (var key in mapCopy) {
            if (!currentMap[key]) {
                var item = mapCopy[key];
                item.isVisible = false;
            }
        }
        return currentMap;
    }




}(Foundry.canvas, Foundry));


