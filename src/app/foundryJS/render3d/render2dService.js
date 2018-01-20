
var Foundry = Foundry || {};

(function (app, fo, tools, undefined) {

    app.service('renderSpec', function () {
        var self = this;

        var RenderSpec = function (spec) {
            tools.mixin(this, spec);
            this.existWhen = function () { return true; }
            return this;
        }

        //Prototype defines functions using JSON syntax
        tools.mixin(RenderSpec.prototype, {
            extendSpec: function (spec) {
                var target = this;
                for (var name in spec) {
                    if (!target[name]) {
                        target[name] = spec[name];
                    }
                    tools.mixin(target[name], spec[name]);
                }
                return this;
            },
            existWhenRule: function (rule) {
                this.existWhen = rule ? rule : function () { return true; }
                return this;
            },
            canExist: function (obj) {
                return this.existWhen.call(obj, obj);
            }
        });


        var _renderSpec = {};
        function registerRenderSpec(id, spec) {
            if (_renderSpec[id]) throw new Error("a RenderSpec already exist for " + id);

            _renderSpec[id] = new RenderSpec(spec);
            return _renderSpec[id];
        }
        function unregisterRenderSpec(id) {
            if (_renderSpec[id]) {
                _renderSpec[id] = undefined;
            }
            return true;
        }

        self.renderSpecDictionaryKeys = function () {
            return Object.keys(_renderSpec);
        }

        self.renderSpecDictionaryWhere = function (func) {
            if (!func) return {};
            var result = tools.applyOverKeyValue(_renderSpec, function (key, value) {
                if (!value) return undefined; //removed items are undefined
                return !func || func(key, value) ? value : undefined;
            });
            return result;
        }

        self.renderSpecDictionaryClear = function (copy) {
            //this will return a copy and clear the original
            var result = {};
            if (copy) {
                result = tools.applyOverKeyValue(_renderSpec, function (key, value) {
                    return value;
                });
            }
            _renderSpec = {}; //this clears the original
            return result;
        }


        self.findRenderSpec = function (id) {
            var definedSpec = _renderSpec[id];
            return definedSpec;
        }

        self.defineRenderSpec = function (id, spec) {
            var completeSpec = tools.union(spec, { myType: id });
            var result = registerRenderSpec(id, completeSpec);
            return result;
        }

        self.extendRenderSpec = function (id, spec) {
            if (!_renderSpec[id]) return;

            //for meta data I want to mix and extend,  so add properties that do not 
            //exist, and if they do then mix in there values

            var found = _renderSpec[id];
            if (found) {
                found.extendSpec(spec);
            }

            return found;
        }

        self.establishRenderSpec = function (id, spec) {
            try {
                return self.defineRenderSpec(id, spec);
            }
            catch (ex) {
                return self.extendRenderSpec(id, spec);
            }
        }

        self.removeRenderSpec = function (id) {
            return unregisterRenderSpec(id);
        }

    });

 
    app.service('render2DService', function (renderSpec) {
        var network;
        var self = this;

        renderSpec.establishRenderSpec('defaultEdge', {
            color: 'gray',
        });

        function createEdgeSpec(name, links) {
            var found = renderSpec.findRenderSpec(name);
            if (!found) {
                found = tools.union(renderSpec.findRenderSpec('defaultEdge'), { label: name });
                renderSpec.establishRenderSpec(name, found);
            }
            var spec = tools.union(links, found);
            return spec;
        }

        renderSpec.establishRenderSpec('defaultNode', {
            color: 'gray',
        });

        function createNodeSpec(name, links) {
            var found = renderSpec.findRenderSpec(name);
            if (!found) {
                found = tools.union(renderSpec.findRenderSpec('defaultNode'), { label: name });
                renderSpec.establishRenderSpec(name, found);
            }
            var spec = tools.union(links, found);
            return spec;
        }

        function canRender(name, obj) {
            var found = renderSpec.findRenderSpec(name);
            if (found) {
                return found.canExist(obj);
            }
            return false;
        }

 
        // create an array with nodes
        var nodes = new vis.DataSet([
          //{ id: 1, label: 'Node 1' },
          //{ id: 2, label: 'Node 2' },
          //{ id: 3, label: 'Node 3' },
          //{ id: 4, label: 'Node 4' },
          //{ id: 5, label: 'Node 5' }
        ]);

        // create an array with edges
        var edges = new vis.DataSet([
          //{ from: 1, to: 3 },
          //{ from: 1, to: 2 },
          //{ from: 2, to: 4 },
          //{ from: 2, to: 5 }
        ]);

        function removeNodeById(id) {
            nodes.remove({ id: id });
        }

        function removeNode(obj) {
            if (!obj.id || !obj.myGuid) return;
            removeNodeById(obj.id || obj.myGuid);
        }

        self.networkOptions = function () {
            return {
                //layout: {
                //    hierarchical: {
                //        direction: "UD",
                //        sortMethod: "directed"
                //    }
                //},
                //layout: {
                //    hierarchical: {
                //        direction: "UD",
                //        sortMethod: "directed"
                //    }
                //},
                interaction: { dragNodes: true },
                physics: {
                    forceAtlas2Based: {
                        gravitationalConstant: -26,
                        centralGravity: 0.005,
                        springLength: 230,
                        springConstant: 0.18
                    },
                    maxVelocity: 146,
                    solver: 'forceAtlas2Based',
                    timestep: 0.35,
                    stabilization: {
                        enabled: true,
                        iterations: 20,
                        updateInterval: 25
                    }
                },
            };
        }


        self.doDrawNetwork = function (elementId) {
            // create a network
            self.destroyNetwork();

            var container = document.getElementById(elementId);
            var data = {
                nodes: nodes,
                edges: edges
            };

            network = new vis.Network(container, data, self.networkOptions());
            network.on("stabilizationProgress", function (params) {
                var maxWidth = 496;
                var minWidth = 20;
                var widthFactor = params.iterations / params.total;
                var width = Math.max(minWidth, maxWidth * widthFactor);

               // document.getElementById('bar').style.width = width + 'px';
               // document.getElementById('text').innerHTML = Math.round(widthFactor * 100) + '%';
            });
            network.once("stabilizationIterationsDone", function () {
               // document.getElementById('text').innerHTML = '100%';
               // document.getElementById('bar').style.width = '496px';
               // document.getElementById('loadingBar').style.opacity = 0;
                // really clean the dom element
               // setTimeout(function () { document.getElementById('loadingBar').style.display = 'none'; }, 500);
            });
            network.on("selectNode", function (params) {
                if (params.nodes.length == 1) {
                    if (network.isCluster(params.nodes[0]) == true) {
                        network.openCluster(params.nodes[0]);
                    }
                }
            });
            network.stabilize();
        }

        self.destroyNetwork = function () {
            if (network) {
                network.destroy();
                network = undefined;
            }
        }


        //function doClustering() {
        //    var names = Object.keys(owners);

        //    var clusterOptionsByData;
        //    for (var i = 0; i < names.length; i++) {
        //        var name = names[i];
        //        clusterOptionsByData = {
        //            joinCondition: function (childOptions) {
        //                return childOptions.parentId == name;
        //            },
        //            processProperties: function (clusterOptions, childNodes, childEdges) {
        //                var totalMass = 0;
        //                for (var i = 0; i < childNodes.length; i++) {
        //                    totalMass += 1; // childNodes[i].mass;
        //                }
        //                clusterOptions.mass = totalMass;
        //                return clusterOptions;
        //            },
        //            clusterNodeProperties: { id: name, borderWidth: 3, shape: 'database', color: owners[name], label: name }
        //        };
        //        network.cluster(clusterOptionsByData);
        //    }

        //    network.cluster(clusterOptionsByData);
        //}

        //http://visjs.org/examples/network/data/datasets.html

        var nextNode = 1;
        function addPropertyNode(obj) {
            if (obj.id) return;
            obj.id = nextNode++;
            var guid = obj.owner ? obj.owner.myGuid : 'NO OWNER';
            var type = obj.owner ? obj.owner.myType : 'NO TYPE';
            var name = obj.myName ? obj.myName : '';

            guid = guid || 'THERE IS NO GUID'

            var tag = guid.substring(guid.length - 4);
            var color = type.startsWith('3d') ? 'lime' : 'pink';

            var label = name + '@' + tag;
            label += '\n' + type;

            var spec = createNodeSpec('property', {
                id: obj.id,
                label: label,
                color: color,
                parentId: tag,
            })

            try {
                nodes.add(spec);
            } catch (ex) {
                nodes.update(spec);
            }
        }

        function addComponentNode(obj) {
            if (!canRender(obj.myType, obj)) {
                return false;
            }


            var guid = obj.myGuid || 'THERE IS NO GUID';
            var type = obj.myType;
            var name = obj.myName ? obj.myName : '';
            var tag = guid.substring(guid.length - 4);

            var label = name + '@' + tag;
            label += '\n' + type;

            var spec = createNodeSpec(type, {
                id: obj.myGuid,
                label: label,
                group: type,
            })

            try {
                nodes.add(spec);
            } catch (ex) {
                nodes.update(spec);
            }
            return true;
        }




        //http://visjs.org/examples/network/edgeStyles/arrows.html

        self.trackDependendsOn = function (track) {
            function nowInforms (a, b) {
                addPropertyNode(a);
                addPropertyNode(b);

                edges.add(createEdgeSpec('nowInforms', {
                    from: a.id,
                    to: b.id,
                }));
            }
            function noLongerDependsOn(a, b) {
                removeNode(a);
                removeNode(b);
            };
            if (track) {
                fo.subscribe('nowInforms', nowInforms);
                fo.subscribe('noLongerDependsOn', noLongerDependsOn);
            } else {
                fo.unsubscribe('nowInforms', nowInforms);
                fo.unsubscribe('noLongerDependsOn', noLongerDependsOn);
            }
        }


        self.addComponent = addComponentNode;

        self.renderSubcomponents = function (parent) {
            var self = this;
            parent.mySubcomponents().forEach(function (child) {
                self.addSubcomponent(parent, child, true);
            })
        }




        self.addSubcomponent = function (parent, child, deep) {
            if (!addComponentNode(parent.unique())) return;
            if (!addComponentNode(child.unique())) return;

            edges.add(createEdgeSpec('parent', {
                from: parent.myGuid,
                to: child.myGuid,
            }));

            if (deep) {
                child.mySubcomponents().forEach(function (obj) {
                    self.addSubcomponent(child, obj);
                })
            }
        }

        self.relateComponent = function (parent, relation, child) {
            if (!addComponentNode(parent.unique())) return;
            if (!addComponentNode(child.unique())) return;

            edges.add(createEdgeSpec(relation, {
                from: parent.myGuid,
                to: child.myGuid,
            }));
        }

    });

})(foApp, Foundry, Foundry.tools);
