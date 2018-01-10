
var Foundry = Foundry || {};
Foundry.tools = Foundry.tools || {};



//define spec for object 'realte'
(function (ns, tools, undefined) {

    //this must be extended to keep related pairs intact
    var _relation = {};

    var RelationshipSpec = function (spec) {
        this.spec = {};
        this.alpha = undefined;
        this.omega = undefined;
        return this;
    }

    tools.isaRelationship = function (obj) {
        return obj && obj instanceof RelationshipSpec;
    };

    RelationshipSpec.prototype = {
        getSpec: function () {
            return this.spec;
        },
        apply: function (target, source, onComplete) {
            var alpha = this.alpha;
            var result = alpha.apply(target, source);
            onComplete && onComplete(result);

            fo.publishNoLock && fo.publishNoLock('relate', [alpha, target, source]);
            return result;
        },
        undo: function (target, source, onComplete) {
            var alpha = this.alpha;
            var result = alpha.undo(target, source);
            onComplete && onComplete(result);

            fo.publishNoLock && fo.publishNoLock('unrelate', [alpha, target, source]);
            return result;
        },
    }


    var RelateSpecData = function (spec, parent) {
        this.myParent = tools.isFunction(parent) ? parent() : parent;
        this.spec = {};

        var self = this;
        var completeSpec = tools.mixin(this.spec, spec);

        this.relationBuild = function (source, target, applyInverse) {
            var linkerFn = completeSpec.linkerFn ? completeSpec.linkerFn : ns.makeRelation;
            var result = linkerFn && linkerFn.call(this, source, completeSpec.myName, target);
            if (applyInverse && completeSpec.myInverse) {
                var parent = self.myParent;
                var inverse = parent[completeSpec.myInverse].relationBuild;
                inverse.call(this, target, source)
            }
            return result;
        }

        this.relationBuild.unDo = function (source, target, applyInverse) {
            var unlinkerFn = completeSpec.unlinkerFn ? completeSpec.unlinkerFn : ns.unMakeRelation;
            var result = unlinkerFn && unlinkerFn.call(this, source, completeSpec.myName, target);
            if (applyInverse && completeSpec.myInverse) {
                var parent = self.myParent;
                var inverse = parent[completeSpec.myInverse].relationBuild;
                inverse.unDo.call(this, target, source)
            }
            return result;
        }
        return this;
    }

    RelateSpecData.prototype = {
        getSpec: function () {
            return this.spec;
        },
        getBuilder: function () {
            return this.relationBuild;
        },
        getUnDoBuilder: function () {
            return this.relationBuild.unDo;
        },
        getMeta: function() {
            var id = this.spec.myType;
            return fo.meta && fo.meta.findMetadata(id);
        },
        apply: function (target, source, onComplete) {
            var result = this.relationBuild.call(this, target, source, true);
            onComplete && onComplete(result);
            return result;
        },
        undo: function (target, source, onComplete) {
            var result = this.relationBuild.unDo.call(this, target, source, true);
            onComplete && onComplete(result);
            return result;
        },
        //toJSON: function () {
        //    return {
        //        myType: this.myType,
        //    };
        //}
    }



    function registerSpec(id, spec, linker, unlinker) {
        if (!id) return;
        var typeId = tools.splitNamespaceType(id);

        var extend = {
            myType: id,
            mySelf: spec && spec.self,
            myInverse: spec && spec.inverse,
            myName: typeId.name,
            namespace: typeId.namespace,
            linkerFn: linker,
            unlinkerFn: unlinker,
        }
        var myParent = spec && spec.parent;
        delete spec.parent;
        var completeSpec = tools.mixin(extend, spec);

        var result = new RelateSpecData(completeSpec, myParent);
        result.myType = id;
        return result;
    }



    ns.findRelationship = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;
        return _relation[id];
    }

    ns.establishRelationship = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;
        if (_relation[id]) return _relation[id];

        var split = id.split('|');

        var alpha = split[0];
        var omega = split.length == 2 ? split[1] : undefined;
        var relationship = new RelationshipSpec();
        
        relationship.alpha = registerSpec(alpha, { self: alpha, inverse: omega, parent: relationship });
        relationship.omega = registerSpec(omega, { self: omega, inverse: alpha, parent: relationship });
        if (relationship.alpha) relationship[alpha] = relationship.alpha;
        if (relationship.omega) relationship[omega] = relationship.omega;

       _relation[id] = relationship;
        return _relation[id];
    }

    ns.removeRelationship = function (id) {
        if (!ns.isValidNamespaceKey(id)) return;

        if (_relation[id]) {
            _relation[id] = undefined;
        }
    }

    ns.relationDictionaryKeys = function () {
        return Object.keys(_relation);
    }

    ns.relationDictionaryWhere = function (func) {
        var result = tools.applyOverKeyValue(_relation, function (key, value) {
            if (!value) return undefined; //removed items are undefined
            return !func || func(key, value) ? value : undefined;
        });
        return result;
    }

    ns.getAllRelations = function () {
        //for sure you do not want to give then the array, they might destory it.
        var types = tools.mapOverKeyValue(_relation, function (key, value) {

            function relationDetails(key,value) {
                return {
                        myName: key,
                        myType: key,
                        namespace: tools.getNamespace(value),
                        name: tools.getType(value),
                        specData: value,
                        spec: value.getSpec(),
                        //builder: value.getBuilder(),
                        meta: value.getMeta(),
                    }
            }

            if (!value) return;

            var alpha = value.alpha && relationDetails(value.alpha.myType, value.alpha);
            var omega = value.omega && relationDetails(value.omega.myType, value.omega);

            return {
                myName: key,
                myType: key,
                namespace: key,
                name: key,
                alpha: alpha,
                omega: omega,
                members: [alpha, omega]
            }
        });
        return types;
    }

    ////////////////////////////////////////////////



    ns.relate = function (id, source, target, onComplete) {
        var relate = tools.isaRelationship(id) ? id : ns.findRelationship(id);
        if (!relate) return;
        var result = relate.apply(source, target, onComplete)
        return result;
    }

    ns.unrelate = function (id, source, target, onComplete) {
        var relate = tools.isaRelationship(id) ? id : ns.findRelationship(id);
        if (!relate) return;
        var result = relate.undo(source, target, onComplete)
        return result;
    }

}(Foundry, Foundry.tools));
