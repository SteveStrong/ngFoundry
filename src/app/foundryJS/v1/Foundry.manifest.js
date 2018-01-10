/*
    Foundry.manifest.js part of the FoundryJS project
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

//this module lets you send data and commands between windows
//it extends the normal pub/sub API in foundry core


(function (ns,  undefined) {


    var Manifest = function (properties) {
        var self = this;
        Object.keys(properties).forEach(function (key) {
            self[key] = properties[key];
        })
        return self;
    };

    Manifest.prototype = {
    };

    ns.Manifest = Manifest;

    ns.makeManifest = function (properties) {
        return new ns.Manifest(properties);
    }
	
}(Foundry));