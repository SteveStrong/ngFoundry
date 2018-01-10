/*
    Foundry.version.js part of the FoundryJS project
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
var fo = Foundry;
Foundry.tools = Foundry.tools || {};


(function (ns,undefined) {

 
/**
 * The version string for this release.
 * @property version
 * @type String
 * @static
 **/
    ns.version = /*version*/"2.1.0"; // injected by build process

/**
 * The build date for this release in UTC format.
 * @property buildDate
 * @type String
 * @static
 **/
    ns.buildDate = /*date*/"01 May 2014 16:05:45 GMT"; // injected by build process

})(Foundry);

(function (ns, undefined) {

    ns.getNamespaceKey = function (namespace, type) {
        if (namespace && type) {
            if (type.contains('::')) return type;
            var id = namespace + '::' + type;
            return id;
        }

        if (namespace.contains('::')) {
            return namespace;
        }
        throw new Error("getNamespaceKey invalid arguments")
    }

    ns.isValidNamespaceKey = function (id) {
        if (!id) throw new Error("valid NamespaceKey is missing")

        return true;
    }

}(Foundry));