/*
    Foundry.modelManager.core.js part of the FoundryJS project
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


(function (ns, undefined) {

    //in prep for prototype pattern...
    var Component = function (properties, subcomponents, parent) {
        //"use strict";

        this.myName = undefined;
        this.myParent = parent;
        this.myType = 'Component';

        this.withDependencies = true;


        var uponCreation = properties && properties.uponCreation;
        if (uponCreation) delete properties.uponCreation;

        this.establishCollection("Properties", this.createParameters(properties));
        this.simpleProperty('myType');
        this.simpleProperty('myName');
        this.establishCollection("Subcomponents", this.createSubparts(subcomponents)); // you need to make this observable and dynamic

        if (uponCreation) {
            properties.uponCreation = uponCreation;
            var creationSpec = ns.utils.isFunction(uponCreation) ? uponCreation.call(this) : uponCreation;

            if (ns.utils.isaCollectionSpec(creationSpec)) {
                creationSpec.createSubcomponents(this); //necessary to maintain observablilty
            }
        }
        return this;
    }


    var _rootComputestack = new Array();

    //Prototype defines functions using JSON syntax
    Component.prototype = {
        //toString: function () {
        //    var text = this.myName ? this.myName : "";
        //    text = text ? text += "| type: " + this.myType : this.myType;
        //    return  this.getID() + ", |" + text;
        //},


        outlinePath: function () {
            var depth = this.componentDepth();
            if (depth == 0 || !this.myParent) return '';
            var index = (this.myIndex() + 1).toString();
            if (this.myParent.componentDepth() == 0) return index;
            var root = this.myParent.outlinePath();

            var result = root ?  root + "." + index : index;
            return result;
        },

        //code to support dependency tracking
        globalComputeStack: function () {
            return _rootComputestack;
        },

        currentComputingProperty: function () {
            return _rootComputestack && _rootComputestack.peek();
        },

        isType: function (type) {
            if (type === this.myType) return true;
            if (!this.myType) return false;
            //remember a type may be preceeded with a namespace  knowtshare::note
            return type && type.matches(this.myType);
        },

        isOfType: function (type) {
            var found = this.isType(type);
            if (found) return true;
            var myType = this.myType.split('::');
            myType = myType.length == 2 ? myType[1] : myType[0];
            return type && type.matches(myType);
        },



        createProperty: function (name, init) {
            var property = new ns.Property(this, name, init);
            return property;
        },

        createParameters: function (obj) {
            var parameters = [];
            if (obj !== undefined) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        var init = obj[key];
                        var property = this.createProperty.call(this, key, init);
                        parameters.push(property);
                    }
                }
            }
            return parameters;
        },

        createSubparts: function (listSpec) {
            var subparts = [];
            if (ns.utils.isArray(listSpec)) {
                var parent = this;
                subparts = listSpec.map(function (childSpec) {
                    var component;

                    if (fo.utils.isaComponent(childSpec)) {
                        childSpec.removeFromModel();
                        component = childSpec;
                    } else {
                        var spec = childSpec.spec ? childSpec.spec : undefined;
                        var subcomponentSpec = childSpec.Subcomponents ? childSpec.Subcomponents : undefined;
                        var dependencies = childSpec.dependencies ? childSpec.dependencies : undefined;

                        //if you were clever about evaluation here you could apply exist rules...
                        //but you would need to create as a subpart first before it is expanded and 
                        //reaches Subcomponent status...
                        component = ns.makeComponent(spec, subcomponentSpec, parent);
                        if (childSpec.myName) component.myName = childSpec.myName;
                        component.withDependencies = dependencies ? dependencies : parent.withDependencies;
                    }

                    return component;
                });

            }
            return subparts;
        },

        // you need to make this observable and dynamic, then does that
        establishCollection: function (name, init, spec) {
            var collection = this[name];
            if (!ns.utils.isaCollection(collection)) {
                collection = ns.makeCollection(init, this, spec); //this is observable
                collection.withDependencies = this.withDependencies;
                collection.myName = name;
                this[name] = collection;
            };
            return collection;
        },



        rootComponent: function (name) {
            if (name && this[name]) {
                return this[name];
            }
            var parent = this.myParent;
            return parent === undefined ? this : parent.rootComponent(name);
        },

        getID: function () {
            if (this.guid) return this.guid;
            this.guid = ns.utils.createID(this.myName);
            return this.guid;
        },

        setName: function (name, title) {
            this.myName = name;
            return this;
        },

        componentDepth: function () {
            if (this.myParent) {
                return 1 + this.myParent.componentDepth();
            }
            return 0;
        },

        branchDepth: function () {
            var first = this.Subcomponents.first();
            if (!first) return 0;

            var maxDepth = first.branchDepth();
            this.Subcomponents.forEach(function (item) {
                maxDepth = Math.max(item.branchDepth(), maxDepth);
            });

            return 1 + maxDepth;
        },
        //http://msdn.microsoft.com/en-us/library/ie/dd548687(v=vs.94).aspx

        createSlots: function (owner, list) {
            var slots = [];
            if (list != undefined) {
                for (var key in list) {
                    if (this.getProperty(key)) {
                        //redefine as simple slot?
                    }
                    else { //should I test is function and add that to prototype
                        this[key] = list[key];
                        slots.push(key);
                    }
                }
            }
            return slots;
        },

        getProperty: function (name, search) {
            var sPrivate = "_" + name;
            var p = this[sPrivate];
            return p ? p : search && this.myParent ? this.myParent.getProperty(name, search) : p;
        },

        smashProperty: function (name, search) {
            var property = this.getProperty(name, search);
            if (property && property.status) {
                property.smash();
            }
            return property;
        },

        smashPropertyTree: function (name) {
            var property = this.smashProperties(name);
            var parent = this.myParent;
            return parent ? parent.smashPropertyTree(name) : property;
        },

        smashPropertyBranch: function (name) {
            this.smashProperties(name);

            this.Subcomponents.forEach(function (item) {
                item.smashPropertyBranch(name);
            });
        },

        smashProperties: function (names, search) {
            var obj = this;
            var list = fo.utils.isArray(names) ? names : names.split(',');
            list.forEach(function (name) {
                obj.smashProperty(name, search);
            });

            return obj;
        },

        deleteProperty: function (name) {
            var sPrivate = "_" + name;
            var property = this[sPrivate];
            if (property) {
                property.smash();

                //SRS add code to remove from Properties Collection also
                this.Properties.remove(property);

                delete this[sPrivate];
                delete this[name];
            }
        },

        establishProperty: function (name, init, onSmash) {
            var p = this.getProperty(name);
            if (p === undefined) {
                p = this.createProperty(name, init);
                p.onValueSmash = onSmash;
            }
            return p;
        },

        simpleProperty: function (name, init) {
            var p = this.getProperty(name);
            if (p !== undefined) {
                var newValue = init ? init : p.getValue();
                this.deleteProperty(name);
                this[name] = newValue;
            }
            else if (init) {
                this[name] = init;
            }
        },




        asReference: function () {
            if (this.myParent === undefined) {
                return "root";
            }
            return this.myName + "." + this.myParent.asReference();
        },




        superior: function (name) {
            if (name.matches(this.myName)) return this;
            if (this.myParent) return this.myParent.superior(name);
        },

        findParentWhere: function (func) {
            if (func.call(this, this)) return this;
            if (this.myParent) return this.myParent.findParentWhere(func);
        },

        getValueOf: function (name, defaultValue) {
            var property = this.getProperty(name, true);
            var result = property ? property.getValue() : undefined;
            return result ? result : defaultValue;
        },

        resolveSuperior: function (reference, meta) {
            var obj = this;
            if (ns.utils.isSelf(reference)) return obj;

            var result = this.getProperty(reference);
            if (result) return result.getValue(meta);

            //if no result was found look for a simple unmanaged property
            result = this[reference];

            if (!result && this.myParent) return this.myParent.resolveSuperior(reference, meta);
            //the search for a value has failed
            return result;
        },

        resolveReference: function (reference) {
            var obj = this;
            if (ns.utils.isSelf(reference)) return obj;
            //for now assume you are looking for subcomponents...
            var ref = reference.split('@');
            if (ref.length == 2 && ref[1] != '') return this.resolveReference(ref[1]);

            var path = ref[0].split('.');

            var result = undefined;
            for (var i = 0; i < path.length; i++) {
                var name = path[i];  //or you can look it up in the properties collection...
                result = obj.getSubcomponent(name);

                if (result === undefined) {
                    result = obj.getProperty(name);
                    if (result === undefined) {
                        obj = obj[name];  //now looking for collection or component
                    }
                }
                else {
                    obj = result;
                }
            }
            return result;
        },

        //this is the simple reference BETWEEN the Dots .Prop.
        //pass in trimed string only please
        resolvePropertyReference: function (reference) {
            var result = {};

            if (reference.begins('(') && reference.ends(')')) { //is function
                var refFunc = "return {0}; ".format(reference);
                result.formula = new Function(refFunc);
                return result;
            }

            if (reference.begins('{') && reference.ends('}')) { //is JSON
                result['JSON'] = JSON.parse(reference);
                return result;
            }

            var obj = this;
            if (reference.startsWith('@')) { //upward reference to property
                var found = this.resolveReference(reference);

                if (ns.utils.isaCollection(found)) {
                    result.collection = found;
                }
                else if (ns.utils.isaComponent(found)) {
                    result.component = found;
                }
                else if (ns.utils.isaProperty(found)) {
                    result.property = found;
                }
                else if (found) {
                    result.found = found;
                }
                return result;
            }

            if (reference.endsWith('@')) { //upward reference to property
                var refProp = reference.substring(0, reference.length - 1);
                var parent = obj.myParent;
                var property = obj.getProperty(refProp);
                while (property === undefined && parent) {
                    property = parent.getProperty(refProp);
                    parent = parent.myParent;
                }
                result.property = property;
                return result;
            }


            if (reference.containsString('#')) {
                var ref = reference.split('#')
                result = this.resolvePropertyReference(ref[0]);
                result.meta = ref[1];
                return result;
            }
            if (reference.startsWith('_')) { //peeking a true property
                var found = obj[reference];
                if (found) result.propertyPeek = found;
                return result;
            }


            //now it is probably just a property and we may need to peek at the value
            var property = obj.getProperty(reference);
            var found = undefined; //now looking for collection or component

            if (property === undefined) {
                found = obj[reference]; //now looking for collection or component
            }
            else {
                result.property = property;  //peek at value 
                if (property.status) found = property.value;
            }

            if (ns.utils.isaCollection(found)) {
                result.collection = found;
            }
            else if (ns.utils.isaComponent(found)) {
                result.component = found;
            }
            else if (found) {
                result.slot = found;
            }
            return result;
        },

        resolveProperty: function (reference) {
            if (reference.ends('?')) {  //if not found UI will ignore binding
                return this.resolveProperty(reference.substring(0, reference.length - 1));
            }
            else if (reference.begins('?')) { //if not found UI will hide element
                return this.resolveProperty(reference.substring(1));
            }

            if (reference.begins('(') || reference.begins('{')) {
                return this.resolvePropertyReference(reference);
            }
            else if (!reference.containsString('.')) {
                return this.resolvePropertyReference(reference);
            }

            var result = undefined;
            var refPath = reference.split('.');

            //this is tricker and requires that we walk the tree, and maybe even eval some 
            var obj = this;
            for (var i = 0; i < refPath.length; i++) {
                var ref = refPath[i].trim();
                result = obj.resolvePropertyReference ? obj.resolvePropertyReference(ref) : undefined;
                if (result === undefined) {
                    obj = obj[ref];  //get value of property
                }
                else if (result.component) {
                    obj = result.component;
                }
                else if (result.collection) {
                    obj = result.collection;
                }
                else if (result.property && result.property.status) {
                    obj = result.property.getValue();
                }
                else if (ns.utils.isaComponent(obj)) {
                    result.component = obj.getSubcomponent(ref); //walk the subcomponent tree
                    obj = result.component ? result.component : obj[ref];  //get value of property
                }
                else {
                    obj = obj[ref];  //get value of property
                }
            }
            return result;
        },

        //removeFromModel: function () {
        //    var obj = this;
        //    obj.myParent && obj.myParent.removeSubcomponent(obj);
        //    obj.purgeBindings(true);
        //    return obj;
        //},

        //deleteAndPurge: function () {
        //    var obj = this;
        //    obj.removeFromModel();
        //    add extra code to destroy this object and the memory it holds
        //},

        //purgeBindings: function (deep) {
        //    var result = false;
        //    this.Properties.forEach(function (item) {
        //        result = item.purgeBindings(deep) || result;
        //    });

        //    this.Subcomponents.forEach(function (item) {
        //        result = item.purgeBindings(deep) || result;
        //    });
        //    return result;
        //},

        stringify: function (obj) {
            var target = obj || this;

            function resolveCircular(key, value) {
                switch (key) {
                    case 'owner':
                    case 'myParent':
                    case 'source':
                    case 'target':
                        return value ? value.asReference() : value;
                    case 'thisValueDependsOn':
                    case 'thisInformsTheseValues':
                    case 'uiBindings':
                    case 'onRefreshUi':
                        return undefined;
                }

                return value;
            }

            return JSON.stringify(target, resolveCircular, 3);
        },

        rehydrate: function (root, specArray, resultDictionary, modifyType) {
            var context = this;

            var localResults = {};
            specArray.forEach(function (item) {
                var uuid = item.uniqueID ? item.uniqueID : item.myName;
                item.myType = modifyType ? modifyType(item) : item.myType;

                var parentHydrateId = item.parentHydrateId;
                delete item.parentHydrateId;
                delete item.uniqueID; // I do now wat 2 unique ID  myName is the source of truth

                var subparts = item["Subcomponents"];
                if (subparts) delete item["Subcomponents"];


                var parent = context;
                var child = parent.getSubcomponent(uuid);
                if (!child && parentHydrateId) {
                    parent = root.getSubcomponent(parentHydrateId, true);
                    if (parent) {
                        child = parent.getSubcomponent(uuid);
                    } else {
                        parent = context;
                    }
                }
                if (!child) {
                    child = fo.make(item, parent);
                    if (parent.getSubcomponent(uuid)) {
                        alert("rehydrateing: We have a problem");
                    }
                    parent.addSubcomponent(child, uuid);
                }

                resultDictionary[uuid] = localResults[uuid] = child;

                if (!subparts) return;

                try {
                    child.rehydrate(root, subparts, resultDictionary, modifyType);
                } catch (e) {
                    fo.trace && fo.trace.exception('rehydrate', e);
                }
            });

            //if syncSubcomponents subcomponents that remove missing items
            return localResults;
        },

        dehydrate: function (deep, modify) {
            var context = this;

            var spec = context.myType ? { myType: context.myType } : {};
            if (context.myName) spec.myName = context.myName;
            if (context.myParent && context.myParent.myName) {
                spec.parentHydrateId = context.myParent.myName;
            }

            var filter = modify ? Object.keys(modify) : [];

            context.Properties.forEach(function (mp) {
                var name = mp.myName;
                var isFiltered = filter.contains(name);
                if (isFiltered && !modify[name]) return;

                var notExist = 'given'.matches(mp.status) ? false : mp.formula !== undefined;
                if (notExist && !mp.canExport) return;

                //you do not want to send commands right?
                //and because mp.value contains the last computed value it should be undefined
                var value = mp.value;
                //if (!value || ns.utils.isaComponent(value) || ns.utils.isaCollection(value)) return;
                if (ns.utils.isaComponent(value) || ns.utils.isaCollection(value)) return;

                spec[name] = value;

            });

            if (deep && context.Subcomponents.count > 0) {
                var results = context.Subcomponents.map(function (item) {
                    return item.dehydrate(deep, modify);
                });
                spec["Subcomponents"] = results;
            }
            return spec;
        },

        makePartOfSpec: function (key, init) {
            // Add an accessor property to the object.
            var sPrivate = '_' + key;
            if (this[sPrivate]) {
                this[sPrivate].canExport = init ? init : true;
            }
        },

        exportValues: function () {
            var result = {};
            for (var key in this) {
                if (key.startsWith('_')) continue;
                var obj = this[key];
                if (!fo.utils.isObject(obj)) {
                    result[key] = this[key];
                }
            }
            return result;
        },

        //this spec should be an honst way to recreate the component
        getInputs: function () {
            var inputs = {};

            this.Properties.forEach(function (mp) {
                var notExist = 'given'.matches(mp.status) ? false : mp.formula !== undefined;
                if (notExist && !mp.canExport) return;

                spec = spec || {};
                var value = mp.value;
                if (ns.utils.isaComponent(value) || ns.utils.isaCollection(value)) {
                    value = value.getSpec(deep);
                }
                var name = mp.myName;
                if (value !== undefined) {
                    spec[name] = value;
                }
                else if (mp.canExport) { //we must have a value if marked as exporting
                    spec[name] = mp.getValue();
                }
            });

            return inputs;
        },


        //this spec should be an honst way to recreate the component
        getSpec: function (deep) {
            var spec = this.myType ? { myType: this.myType } : {};
            if (this.myName) spec.myName = this.myName;

            //do I need to code a reference to the parent?
            //if (this.myParent) spec.myParent = this.myName;

            this.Properties.forEach(function (mp) {
                var notExist = 'given'.matches(mp.status) ? false : mp.formula !== undefined;
                if (notExist && !mp.canExport) return;

                spec = spec || {};
                var value = mp.value;
                if (ns.utils.isaComponent(value) || ns.utils.isaCollection(value)) {
                    value = value.getSpec(deep);
                }
                var name = mp.myName;
                if (value !== undefined) {
                    spec[name] = value;
                }
                else if (mp.canExport) { //we must have a value if marked as exporting
                    spec[name] = mp.getValue();
                }
            });


            //if (deep && this.Members) {
            //    this.Members.forEach(function (coll) {
            //        if (coll.count == 0) return;

            //        spec = spec || {};
            //        var value = coll;
            //        if (ns.utils.isaComponent(value) || ns.utils.isaCollection(value)) {
            //            value = value.getSpec(deep);
            //        }
            //        if (value) {
            //            spec[coll.myName] = value;
            //        }
            //    });
            //}

            if (deep && this.Subcomponents.count > 0) {
                var results = this.Subcomponents.map(function (item) {
                    var value = item;
                    if (ns.utils.isaComponent(value) || ns.utils.isaCollection(value)) {
                        value = value.getSpec(deep);
                    }
                    return value;
                });
                spec["SubSpec"] = results;
            }
            return spec;
        },



        doCommand: function (callbackOrPropertyName, context) {
            if (ns.utils.isFunction(callbackOrPropertyName)) {
                return ns.runWithUIRefreshLock(callbackOrPropertyName);
            }
            else {
                var property = this.getProperty(callbackOrPropertyName, true);
                var target = context ? context : this;
                return property && property.doCommand(target);
            }
        },

        redefine: function (key, init) {
            // Add an accessor property to the object.
            var sPrivate = '_' + key;
            if (this[sPrivate]) {
                this[sPrivate].redefine(init)
            }
            else {
                var property = this.createProperty.call(this, key, init);
                this.Properties.push(property);
            }
        },

        createView: function (view) {
            var result = this.Properties.map(function (prop) {
                return prop.createView(view);
            });
            return result;
        },

        extendUi: function (list, view) {
            var target = this;
            //if (view && this[view] === undefined) {
            //    target = this[view] = { dataContext: this };
            //    this.establishCollection("views").addItem(target);
            //} else {
            //    this.dataContext = this;
            //}

            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    target[key] = list[key];
                }
            }
            return this;
        },

        extendWith: function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this.redefine(key, obj[key]);
                }
            }
            return this;
        },

        extendProperties: function (list) {
            var result = [];
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    var prop = this.getProperty(key);
                    if (prop) {
                        var extensions = ns.utils.asArray(list[key]);
                        extensions.forEach(function (item) { prop.extendWith(item); });
                        result.push(prop);
                    }
                }
            }
            return result;
        },

        subscribeToCommands: function (regexPattern) {
            //subscribe to any do* of goto* messages...
            var self = this;
            var keys = Object.keys(self);
            keys.forEach(function (key) {
                if (key.startsWith('do') || key.startsWith('goto')) {
                    fo.subscribe(key, function () {
                        self[key];
                    });
                }
            });
        },

        definePropertyViews: function (list) {
            var result = [];
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    var prop = this.getProperty(key);
                    if (prop) {
                        var extensions = ns.utils.asArray(list[key]);
                        extensions.forEach(function (item) {
                            for (var view in item) {
                                if (item.hasOwnProperty(view)) {
                                    prop.extendUi(item[view], view);
                                }
                            }
                        });
                    }
                }
            }
            return result;
        },



        //do the work of creation//
        establishManagedProperty: function (name, init) {
            var property = this.getProperty(name);
            if (!property) return this.replaceManagedProperty(name, init);
            property.redefine(init);
            return property;
        },

        //do the work of creation//
        replaceManagedProperty: function (name, init) {
            this.deleteProperty(name)
            var property = this.createProperty(name, init);
            this.Properties && this.Properties.push(property);
            return property;
        },

        establishManagedProperties: function (obj) {
            var params = this.createParameters(obj);
            return this.establishCollection("Properties", params);
        },


        doSubcomponentRefresh: function (deep) {
            var prop = this.Subcomponents.getProperty('count');
            prop.updateBindings();
            if (deep) {
                this.Subcomponents.forEach(function (item) {
                    item.doSubcomponentRefresh();
                });
            }
        },

        onPropertyRefresh: function (name, callback) {
            var property = this.getProperty(name);
            if (property) property.onRefreshUi = callback;
            return property;
        },

        onPropertySmash: function (name, callback) {
            var property = this.getProperty(name);
            if (property) property.onValueSmash = callback;
        },

        onPropertyValueSet: function (name, callback) {
            var property = this.getProperty(name);
            if (property) property.onValueSet = callback;
        },

        addOnRefresh: function (name, callback) {
            var property = this.onPropertyRefresh(name, callback);
            if (property) ns.markForRefresh(property);
            return property;
        },

        addPropertyConstraint: function (spec) {
            var constraintSpec = spec;

            function applyMEConstraint(newValue, fun, obj) {
                if (!newValue) return;
                var prop = this;

                for (var key in constraintSpec) {
                    if (!prop.myName.matches(key)) {
                        obj[key] = false;
                    }
                }
            }

            for (var key in constraintSpec) {
                this.onPropertyValueSet(key, applyMEConstraint);
            }
        },

        addBinding: function (name, binding) {
            var property = this.getProperty(name);
            //var cnt = property.uiBindings ? property.uiBindings.length : 0;
            return property ? property.addBinding(binding, true) : property;
        },

        applyToSelfAndParents: function (funct) {
            var result = funct.call(this, this);
            var parent = this.myParent;
            parent && parent.applyToSelfAndParents(funct);
            return result;
        },

        applyToSelfAndChildren: function (funct, deep) {
            var result = funct.call(this, this);
            this.applyToChildren(funct, deep);
            return result;
        },

        applyToChildren: function (funct, deep) {
            this.Subcomponents.forEach(function (item) {
                funct.call(item, item)
                deep && item.applyToChildren(funct, deep);
            });
        },

        applyToSiblings: function (funct, deep) {
            var self = this;
            var parent = this.myParent;
            parent.Subcomponents.forEach(function (item) {
                if (self != item) {
                    funct.call(item, item);
                    deep && item.applyToChildren(funct, deep);
                }
            });
            return self;
        },

        applyToSelfAndSiblings: function (funct, deep) {
            var parent = this.myParent;
            parent.Subcomponents.forEach(function (item) {
                funct.call(item, item);
                deep && item.applyToChildren(funct, deep);
            });
        },

        capture: function (component, name, join) {
            var oldParent = this.captureSubcomponent(component, name, join);
            return oldParent;
        },

        //canCaptureSubcomponent: function (component) {
        //    if (!ns.utils.isaComponent(component)) return false;
        //    return true;
        //    var parent = component.myParent;
        //    if (!parent) return true;
        //    //var index = parent.Subcomponents.indexOf(component);
        //    //var result = index == -1 ? true : false;
        //    return true;
        //},

        captureSubcomponent: function (component, name, join) {
            var newParent = this;
            var oldParent = component.myParent;
            if (newParent.canCaptureSubcomponent(component)) {
                //ns.runWithUIRefreshLock(function () {
                    if (name) {
                        component.myName = name;
                        if (join) newParent[name] = component;
                    }
                    if (oldParent && oldParent != newParent) {
                        oldParent.removeSubcomponent(component);
                        if (join) delete oldParent[name];
                    }
                    newParent.addSubcomponent(component);
                //});
                return oldParent;
            }
        },

        pushSubcomponent: function (component, name) {
            component.myParent = this;
            if (name) component.myName = name;
            this.Subcomponents.push(component);
            return component;
        },

        addSubcomponent: function (component, name, prepend) {
            if (ns.utils.isaComponent(component)) {
                component.myParent = this;
                if (name) component.myName = name;
                if (prepend)
                    this.Subcomponents.prependNoDupe(component);
                else
                    this.Subcomponents.addNoDupe(component);
                return component;
            }
        },

        insertSubcomponent: function (index, component, name) {
            if (ns.utils.isaComponent(component)) {
                component.myParent = this;
                if (name) component.myName = name;
                this.Subcomponents.insertNoDupe(index, component);
                return component;
            }
        },

        captureInsertSubcomponent: function (index, component, name) {
            var newParent = this;
            var oldParent = component.myParent;
            if (newParent.canCaptureSubcomponent(component)) {
                ns.runWithUIRefreshLock(function () {
                    if (name) component.myName = name;
                    if (oldParent) oldParent.removeSubcomponent(component)
                    newParent.insertSubcomponent(index, component);
                });
                return oldParent;
            }
        },

        removeSubcomponent: function (component) {
            if (ns.utils.isaComponent(component)) {
                if (component.myParent === this) {
                    component.myParent = undefined;
                }
                this.Subcomponents.remove(component);
                return component;
            }
        },

        removeAllSubcomponents: function () {
            if (this.Subcomponents.count == 0) return;
            var list = this.Subcomponents.elements.duplicate();

            list.forEach(function (item) {
                if (item.myParent === this) item.myParent = undefined;
            });

            this.Subcomponents.clear();
            return list;
        },

        moveSubcomponentsTo: function (component) {
            if (ns.utils.isaComponent(component)) {
                var list = this.Subcomponents.elements.duplicate();
                list.forEach(function (item) {
                    component.addSubcomponent(item);
                });
                this.Subcomponents.clear();
                return component;
            }
        },

        createSubcomponent: function (properties, dependencies) {
            var component = ns.makeComponent(properties, undefined, this);
            component.withDependencies = dependencies ? dependencies : this.withDependencies;
            this.addSubcomponent(component);
            return component;
        },

        getSubcomponent: function (name, deep) {
            var result = this.Subcomponents.findByName(name);
            if (result || !deep || !name) return result;

            if (name.matches(this.myName)) return this;

            for (var i = 0; i < this.Subcomponents.count ; i++) {
                var comp = this.Subcomponents.item(i);
                var found = comp.getSubcomponent(name, deep);
                if (found) return found;
            };

        },

        //applyToSubcomponent: function (funct, deep) {
        //    var result = funct.call(this, this);
        //    if (!deep) return result;
        //    for (var i = 0; i < this.Subcomponents.count ; i++) {
        //        var comp = this.Subcomponents.item(i);
        //        result = comp.applyToSubcomponent(funct, deep);
        //    };
        //    return result;
        //},

        establishSubcomponent: function (name, properties) {
            var found = this.getSubcomponent(name);
            if (!found) {
                var component = ns.makeComponent(properties, undefined, this);
                if (!component.myName) component.myName = name;
                component.withDependencies = this.withDependencies;

                found = this.Subcomponents.addNoDupe(component);
            }
            return found;
        },

        forEachSubcomponent: function (func, shallow) {
            this.Subcomponents.forEach(function (item) {
                func.call(item, item);
                if (shallow) return;
                item.forEachSubcomponent(func, shallow);
            });
        },

        selectComponents: function (whereClause, col) {
            var list = col === undefined ? ns.makeCollection([], this) : col;

            //using Count will set up a dependency 
            if (this.Subcomponents.count > 0) {
                this.Subcomponents.copyWhere(whereClause, list);
                for (var i = 0; i < this.Subcomponents.count ; i++) {
                    var comp = this.Subcomponents.item(i);
                    comp.selectComponents(whereClause, list);
                };
            };
            return list;
        },

        membersWhere: function (whereClause, col) {
            return this.Subcomponents.membersWhere(whereClause, col);
        },

        appendTo: function (name, list) {
            var collection = this.establishCollection(name);
            var parent = this;
            var members = ns.utils.asArray(list).map(function (init) {
                var component = init;
                if (!ns.utils.isaComponent(component)) {
                    component = ns.makeComponent(init, undefined, parent);
                }
                else {
                    component.myParent = component.myParent ? component.myParent : parent;
                }
                return component;
            });
            collection.addList(members);
            return collection;
        },

        //this forces every structure to be observable out of properties
        makeMembers: function (name, list) {
            var collection = this.establishCollection(name);
            this.establishCollection('Members').addNoDupe(collection);

            var parent = this;
            var members = ns.utils.asArray(list).map(function (item) {
                var component = item;
                if (!ns.utils.isaComponent(component)) {
                    var init = ns.utils.extractSlots(item, function (val) { return !ns.utils.isArray(val); })
                    component = ns.makeComponent(init, undefined, parent); //build this one property at a time

                    var arrays = ns.utils.extractSlots(item, function (val) { return ns.utils.isArray(val); })
                    for (var key in arrays) {
                        component.makeMembers(key, arrays[key]);
                    }
                }
                component.myParent = component.myParent ? component.myParent : parent;
                return component;
            });
            collection.addList(members);
            return collection;
        },

        //functions to work with siblings
        myIndex: function () {
            if (this.mySiblingTotal() < 0) return -1;
            var index = this.myParent.Subcomponents.indexOf(this);
            return index;
        },
        mySiblingTotal: function () {
            if (!this.myParent) return -1;
            var total = this.myParent.Subcomponents.count;
            return total;
        },
        mySiblingPrevious: function () {
            var index = this.myIndex();
            if (index < 0) return undefined;
            index -= 1;
            var found = this.myParent.Subcomponents.itemByIndex(index);
            return found;
        },
        mySiblingNext: function () {
            var index = this.myIndex();
            if (index < 0) return undefined;
            index += 1;
            if (index > this.mySiblingTotal) return undefined;
            var found = this.myParent.Subcomponents.itemByIndex(index);
            return found;
        },
        mySiblingsBefore: function () {
            var index = this.myIndex();
            var result = ns.makeCollection([], this.myParent);
            if (index < 0) return result;

            var elements = this.myParent.Subcomponents.elements;
            if (index >= 0 && index < elements.length) {
                //splice would destroy the inner values
                for (var i = 0; i < index; i++) {
                    result.push(elements[i]);
                }
            }
            return result;
        },
        mySiblingsAfter: function () {
            var index = this.myIndex();
            var result = ns.makeCollection([], this.myParent);
            if (index < 0) return result;

            var elements = this.myParent.Subcomponents.elements;
            if (index >= 0 && index < elements.length) {
                //splice would destroy the inner values
                for (var i = index + 1; i < elements.length; i++) {
                    result.push(elements[i]);
                }
            }
            return result;
        },

        mySiblings: function () {
            var index = this.myIndex();
            var result = ns.makeCollection([], this.myParent);
            if (index < 0) return result;

            var elements = this.myParent.Subcomponents.elements;
            //splice would destroy the inner values
            for (var i = 0; i < elements.length; i++) {
                if (i != index) result.push(elements[i]);
            }

            return result;
        },

        mySiblingsMaxValue: function (propName, defaultValue, filterFunction) {
            var index = this.myIndex();
            if (index < 0) return defaultValue;

            var list = this.myParent.Subcomponents.filter(filterFunction);
            var max = list.maxAll(propName, defaultValue);
            return max;
        },
    };


    ns.isDialogOpen = false;
    ns.Component = Component;


    Component.prototype.tracePropertyLifecycle = function (name, search) {
        var prop = this.getProperty(name, search);

        if (prop) {
            prop.onValueDetermined = function (value, formula, owner) {
                fo.publish('info', [prop.asLocalReference(), ' onValueDetermined:' + owner.myName + '  value=' + value]);
            }
            prop.onValueSmash = function (value, formula, owner) {
                fo.publish('error', [prop.asLocalReference(), ' onValueSmash:' + owner.myName]);
            }
            prop.onValueSet = function (value, formula, owner) {
                fo.publish('warning', [prop.asLocalReference(), ' onValueSet:' + owner.myName + '  value=' + value]);
            }
            return true;
        }
    }

    //return a function the 
    function getDefault(fallback, name) {
        function searchForDefault() {
            var parent = this.myParent;
            var fallbackFn = tools.isFunction(fallback) ? fallback : function () { return fallback; }
            if (!parent) return fallbackFn.call(this);

            var current = fo.currentComputingProperty();
            var searchName = name ? name : current && current.myName;
            if (!searchName) return fallback;

            var result;
            if (parent && parent.resolveSuperior) {
                result = parent.resolveSuperior(searchName);
            }
            else if (parent && parent.hasOwnProperty(searchName)) {
                result = parent[searchName];
                return result;
            }

            if (result === undefined) {
                if (!parent.hasOwnProperty(propertyName)) {
                    return fallbackFn.call(this);
                }
            }
            return result;
        }
        return searchForDefault;
    }
    ns.getDefault = getDefault;


    ns.makeComponent = function (properties, subcomponents, parent) {
        return new ns.Component(properties, subcomponents, parent);
    };


    ns.makeModel = function (template, parent) {
        var model = ns.makeComponent(template.spec, template.Subcomponents, parent);
        model.myName = template.myName;
        model.myParent = parent; //models should be aware of their workspace
        return model;
    };

    ns.makeCollection = function (init, parent, spec) {
        return new ns.Collection(init, parent, spec);
    };

    ns.makeOrderedCollection = function (init, parent, indexName) {
        return new ns.OrderedCollection(init, parent, indexName);
    };

    ns.makeCollectionSpec = function (specs, baseClass, onCreate) {
        return new ns.CollectionSpec(specs, baseClass, onCreate);
    };

    ns.doCommand = function (name, context, onComplete) {
        if (context) {
            ns.runWithUIRefreshLock(function () {
                context.doCommand(name);
                onComplete && onComplete();
            });
            return true;
        }
    };

    ns.stringifyPayload = function (spec) {
        var payload = JSON.stringify(spec);
        //if (ns.trace) {
        //    ns.trace.clr();
        //    var pre = JSON.stringify(spec, undefined, 3);
        //    ns.trace.log(pre);
        //}
        return payload;
    }

    ns.parsePayload = function (payload) {
        var local = payload.replace(/(\r\n|\n|\r)/gm, "");
        try {
            var spec = JSON.parse(local);
            return spec;
        } catch (ex) {
            ns.trace.log(ex.message);
        }
        //if (ns.trace) {
        //    ns.trace.clr();
        //    var pre = JSON.stringify(spec, undefined, 3);
        //    ns.trace.log(pre);
        //}
    }

    var pubsubCache = {};
    function publishBegin(topic) {
        return topic + 'Begin';
    }

    function publishComplete(topic) {
        return topic + 'Complete';
    }



    ns.publishNoLock = function (/* String */topic, /* Array? */args) {
        if (pubsubCache[topic] === undefined) return true;

        var noErrors = true;
        pubsubCache[topic].forEach(function (func) {
            try {
                func.apply(topic, args || []);
            }
            catch (err) {
                ns.trace && ns.trace.log(err);
                noErrors = false;
            }
        });
        return noErrors;
    };

    ns.publish = function (/* String */topic, /* Array? */args) {
       // ns.runWithUIRefreshLock(function () {
            ns.publishNoLock(publishBegin(topic), args);
            ns.publishNoLock(topic, args);
            ns.publishNoLock(publishComplete(topic), args);
       // });
    }


    ns.subscribe = function (/* String */topic, /* Function */callback) {
        if (!pubsubCache[topic]) {
            pubsubCache[topic] = [];
        }
        pubsubCache[topic].push(callback);
        return [topic, callback]; // Array
    };


    ns.subscribeBegin = function (/* String */topic, /* Function */callback) {
        ns.subscribe(publishBegin(topic), callback);
    };

    ns.subscribeComplete = function (/* String */topic, /* Function */callback) {
        ns.subscribe(publishComplete(topic), callback);
    };

    ns.unsubscribe = function (/* Array */handle) {
        var topic = handle[0];
        pubsubCache[topic] && pubsubCache[topic].forEach(function (idx) {
            if (this == handle[1]) {
                pubsubCache[topic].splice(idx, 1);
            }
        });
    };

    ns.unsubscribeBegin = function (/* String */topic, /* Function */callback) {
        ns.unsubscribe(publishBegin(topic), callback);
    };

    ns.unsubscribeComplete = function (/* String */topic, /* Function */callback) {
        ns.unsubscribe(publishComplete(topic), callback);
    };

    ns.flushPubSubCache = function (topic) {
        delete pubsubCache[publishBegin(topic)];
        delete pubsubCache[topic];
        delete pubsubCache[publishComplete(topic)];
    };

    ns.uiRefreshLock = 0;
    ns.globalUIRefreshLock = function (cnt) {
        ns.uiRefreshLock = ns.uiRefreshLock + cnt;
        if (ns.uiRefreshLock == 0) {
            return ns.uiRefreshLock;
        }
        return ns.uiRefreshLock;
    };


    var uiRefreshStack = new Array();
    ns.markForRefresh = function (obj) {
        if (ns.uiRefreshLock > 0) {
            uiRefreshStack.addNoDupe(obj);
        }
        else {
            obj.refreshUi();
        }
    }

    ns.globalUIReleaseAndRefresh = function (onComplete) {
        var lock = ns.globalUIRefreshLock(0);
        if (lock == 0 && uiRefreshStack.length > 0) {  //0 is so we make sure complete fires..
            var members = uiRefreshStack; //.duplicate();
            uiRefreshStack = new Array();

            var self = this;
            ns.globalUIRefreshLock(1);

            members.forEach(function (member) {
                member.refreshUi();
            });
            members = undefined;
            ns.globalUIRefreshLock(-1);
        }

        if (uiRefreshStack.length == 0) {
            onComplete && onComplete();
        }
    }


    //make sure things are run in content?
    ns.runWithUIRefreshLock = function (callback, onComplete) {
        var start = ns.globalUIRefreshLock(1);
        var result = callback();
        var end = ns.globalUIRefreshLock(-1);
        if (end == 0) {
            ns.globalUIReleaseAndRefresh(onComplete);
        }
        return result;
    };



    ns.UIRefreshLock = function (obj, prop) {
        return function () {
            ns.runWithUIRefreshLock(function () {
                obj[prop];
            });
            return obj[prop];
        }
    };

    ns.writeBlobFile = function (blob, name, ext) {
        var filenameExt = name + ext;
        saveAs(blob, filenameExt);
    };

    function writeTextAsBlob(payload, name, ext) {
        var blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
        ns.writeBlobFile(blob, name, ext);
    };


    ns.writeTextFileAsync = function (payload, name, ext, onComplete) {
        writeTextAsBlob(payload, name, ext);
        if (onComplete) {
            onComplete(payload, name, ext)
            return;
        }
        fo.publish('textFileSaved', [payload, name, ext]);
    };

    fo.readTextFileAsync = function (file, ext, onComplete) {
        var reader = new FileReader();
        reader.onload = function (ev) {
            var filename = file.name;
            var name = filename.replace(ext, '');
            var payload = ev.target.result;
            if (onComplete) {
                onComplete(payload, name, ext);
                return;
            }
            fo.publish('textFileDropped', [payload, name, ext]);
        }
        reader.readAsText(file);
    };

    fo.readImageFileAsync = function (file, ext, onComplete) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            var filename = file.name;
            var name = filename.replace(ext, '');
            var payload = evt.target.result;
            if (onComplete) {
                onComplete(payload, name, ext);
                return;
            }
              fo.publish('imageFileDropped', [payload, name, ext]);
        }
        reader.readAsDataURL(file);
    }

    ////http://www.html5rocks.com/en/tutorials/file/filesystem/
    //ns.enableFileDragAndDrop = function (elementId) {
    //    function noopEvent(evt) {
    //        evt.stopPropagation();
    //        evt.preventDefault();
    //    }

    //    function drop(evt) {
    //        evt.stopPropagation();
    //        evt.preventDefault();

    //        var dt = evt.dataTransfer;
    //        var txt = dt.getData("Text");
    //        var url = dt.getData("URL");  //user dropped an link

    //        var extensionExtract = /\.[0-9a-z]+$/i;

    //        var files = dt.files;
    //        var count = files.length;
    //        var file = count > 0 && files[0];
    //        var ext = file ? file.name.match(extensionExtract) : [''];
    //        ext = ext[0];
    //        var name = file && file.name.replace(ext, '');

    //        // Only call the handler if 1 or more files was dropped.
    //        if (file && file.type.startsWith('image')) {
    //            fo.readImageFileAsync(file, ext);
    //        } else if (file && (ext.matches('.knt') || ext.matches('.csv') || ext.matches('.json') || ext.matches('.txt'))) {
    //            fo.readTextFileAsync(file, ext)
    //        } else if (url && url.startsWith('http')) {
    //            fo.publish('urlDropped', [url]);
    //        } else if (txt) {
    //            fo.publish('textDropped', [txt]);
    //        }
    //    }

    //    var content = ns.utils.isString(elementId) ? document.getElementById(elementId) : elementId;

    //    content.addEventListener("dragenter", noopEvent, false);
    //    content.addEventListener("dragexit", noopEvent, false);
    //    content.addEventListener("dragover", noopEvent, false);
    //    content.addEventListener("drop", drop, false);
    //    //content.addEventListener("ondrop", drop, false);
    //    return content;
    //}

    ns.enableFileDragAndDrop = function (elementId) {
        function noopEvent(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }

        function drop(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            var dt = evt.dataTransfer;
            var txt = dt.getData("Text");
            var url = dt.getData("URL");  //user dropped an link

            var extensionExtract = /\.[0-9a-z]+$/i;

            var fileList = dt.files ? Object.keys(dt.files).map(function (key) { return dt.files[key]; }) : [];

            // Only call the handler if 1 or more files was dropped.
            if (fileList && fileList.length > 0) {

                fileList.forEach(function (file) {
                    var ext = file.name.match(extensionExtract)[0];
                    if (file.type.startsWith('image')) {
                        fo.readImageFileAsync(file, ext);
                    } else if ((ext.matches('.knt') || ext.matches('.csv') || ext.matches('.json') || ext.matches('.txt') || ext.matches('.kap'))) {
                        fo.readTextFileAsync(file, ext)
                    }
                });

            } else if (url && url.startsWith('http')) {
                fo.publish('urlDropped', [url]);
            } else if (txt) {
                fo.publish('textDropped', [txt]);
            }
        }

        var content = ns.utils.isString(elementId) ? document.getElementById(elementId) : elementId;

        content.addEventListener("dragenter", noopEvent, false);
        content.addEventListener("dragexit", noopEvent, false);
        content.addEventListener("dragover", noopEvent, false);
        content.addEventListener("drop", drop, false);
        //content.addEventListener("ondrop", drop, false);
        return content;
    }



}(Foundry));