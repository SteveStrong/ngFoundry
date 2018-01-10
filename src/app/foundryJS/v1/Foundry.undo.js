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
Foundry.undo = Foundry.undo || {};

(function (ns, fo, undefined) {

    var _undoID = 0;
    var _isDoing = false;
    var _isUndoing = false;
    var _undoRing = [];

    ns.clear = function () {
        _undoRing = [];
    }

    ns.canUndo = function () {
        return _undoRing.length ? true : false;
    }

    ns.isUndoing = function () {
        return _isUndoing;
    }
    ns.isDoing = function () {
        return _isDoing;
    }

    var _doActions = {};
    var _undoActions = {};
    var _verifyKeep = {};

    ns.do = function (action, item) {
        _isDoing = true;
        var func = _doActions[action];
        var undo = { action: action, payload: item, undoID: _undoID++ }
        _undoRing.push(undo);
        undo.payload = func ? func.call(undo, item) : item;

        _isDoing = false;
        fo.publish('undoAdded', [undo]);
        return undo;
    }

    ns.unDo = function (myUnDo) {
        if (!ns.canUndo()) return;

        _isUndoing = true;
        var undo = myUnDo;
        if (undo) {
            _undoRing.removeItem(myUnDo);
        } else {
            var index = _undoRing.length - 1;
            undo = _undoRing.splice(index, 1)[0];
        }

        var item = undo.payload;
        var func = _undoActions[undo.action];
        var payload = func ? func.call(undo, item) : item;
        _isUndoing = false;
        fo.publish('undoRemoved', [undo]);
        return payload;
    }

    //if the verify function return TRUE then keep the last undo action...
    ns.verifyKeep = function (undo, item) {
        if (!undo) return true;
        var action = undo.action;
        var func = _verifyKeep[action];
        var keep = func ? func.call(undo, item, undo.payload) : true;
        if (!keep) { //remove Undo from the queue
            _undoRing.removeItem(undo); //item has been removed..
        }
        return keep; 
    }

    ns.registerActions = function (action, doFunc, undoFunc, verifyKeepFunc) {
        _doActions[action] = doFunc ? doFunc : function (p) { return p; };
        _undoActions[action] = undoFunc ? undoFunc : function (p) { return p; };
        _verifyKeep[action] = verifyKeepFunc ? verifyKeepFunc : function (p) { return true; };
    }



}(Foundry.undo, Foundry));