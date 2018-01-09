
var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};

(function (ns, tools, undefined) {

    //in prep for prototype pattern...
    var DTO = function (properties) {
        //"use strict";

        this.myType = 'DTO';

        this.mergeProperties(properties);

        return this;
    }

    ns.DTO = DTO;
    DTO.make = function (properties, subcomponents, parent) {
        return new ns.DTO(properties, subcomponents, parent);
    };
    ns.makeDTO = DTO.make;


    tools.isaDTO = function (obj) {
        return obj && obj.isInstanceOf(DTO);
    };

    //http://www.oranlooney.com/static/functional_javascript/owl_util.js
    // This version of clone was inspired by the MochiKit clone function.
    // A clone of an object is an empty object with a prototype reference to the original.
    // As such, you can access the current properties of the original through the clone.
    // If you set a clone's property, it will override the orignal's property, and
    // not affect the orignal. You can use the delete operator on the clone's overridden 
    // property to return to the earlier lookup behavior.



    //Prototype defines functions using JSON syntax
    DTO.prototype = {
        /**
         * 
         */
        asReference: function () {
            if (!this.myGuid) {
                this.myGuid = tools.generateUUID();
            }
            return this.myGuid;
        },
        unique: function () {
            this.asReference();
            return this;
        },
        /**
         * 
         */
        toString: function () {
            return tools.stringify(this)
        },
        /**
         * 
         */
        isInstanceOf: function (type) {
            return this instanceof type ? true : false;
        },
        /**
         * 
         */
        isType: function (type) {
            if (type === this.myType) return true;
            if (!this.myType) return false;
            //remember a type may be preceeded with a namespace  knowtshare::note
            return type && type.matches(this.myType);
        },
        /**
         * 
         */
        isOfType: function (type) {
            var found = this.isType(type);
            if (found) return true;
            var myType = tools.getType(this);
            return type && type.matches(myType);
        },
        /**
         * 
         */
        mergeProperties: function (spec) {
            tools.mixin(this, spec);
            return this;
        },

    }

}(Foundry, Foundry.tools));
