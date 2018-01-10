/*
    Foundry.rules.binding.js part of the FoundryJS project
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
/// <reference path="Foundry.trace.js" />
/// <reference path="Foundry.js" />


var Foundry = Foundry || {};

(function (ns, $, undefined) {
    "use strict";

    var utils = ns.utils || {};
    var bi = ns.binding = ns.binding || {};
    ns.customBindings = ns.customBindings || {};

    function createItemDictionary(source) {
        var children = source.children;
        var length = children ? children.length : 0

        var result = {};
        for (var i = 0; i < length; i++) {
            var child = children[i];
            if (child.nodeType == 1 && child.hasAttribute("data-guid")) {
                var guid = child.getAttribute("data-guid");
                result[guid] = child;
            }
        }
        return result;
    }

    function doesItemExist(item,lookup) {
        var guidKey = item.getID ? item.getID() : item.toString();
        if (lookup[guidKey]) {
            delete lookup[guidKey];
            return true;
        }
    }

    function purgeUnusedItems(lookup) {
        for (var key in lookup) {
            if (lookup.hasOwnProperty(key)) {
                var element = lookup[key];
                $(element).remove();
            }
        }
    }



    bi.generateHtmlForSelectOptions = function(context, collection, stylingplan) {
        //dynamically generate the options and bind to property so they can recomputed
        var displayStyle = stylingplan && stylingplan.display ? stylingplan.display : 'display'; //what is shown in the drop down
        //var mode = stylingplan && stylingplan.mode ? stylingplan.mode : '';  //single: multipule
        //var defaultValue = stylingplan.defaultValue ? stylingplan.defaultValue : ''; //put something that is the default prompt
        var html = '';
        if (collection && collection.isNotEmpty()) {
            html = collection.map(function (item, index) {
                var display = displayStyle && item[displayStyle] ? item[displayStyle] : item;
                var value = index;

                var disabled = item.disabled || (context && context.isOptionValid && !context.isOptionValid(item)) ? "disabled" : "";
                var selected = item.selected ? "selected" : "";
                return "<option {0} {1} value='{2}'>{3}</option>".format(disabled, selected, value, display);
            }).join('');
        }

        var prompt = stylingplan && stylingplan.prompt ? stylingplan.prompt : 'Choose...'; //put something that is the default prompt
        if (prompt && html) html = "<option value='-1'>{0}</option>{1}".format(prompt, html);
        return html;
    }

    bi.scopeDictionary = {};
    function createScopeRule(name) {
        bi.scopeDictionary[name] = { scopeRule: name };
        return bi.scopeDictionary[name];
    }
    function findScopeRule(name) {
        return bi.scopeDictionary[name];
    }

    var managed = createScopeRule('managed');  //default for all common bindings
    managed['attribute'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var attribute = resolved.aspect;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                if (value) { //looking for a truthy value here
                    $element.attr(attribute, value);
                }
                else {
                    $element.removeAttr(attribute)
                }
            };
            property.addBinding(binding);
        },
    };

    function resolvedValue(content, resolved) {
        if ( resolved.slot ) return  resolved.slot;
        if (resolved.formula) return resolved.formula.call(context);
        return content;
    }

    var unmanaged = createScopeRule('unmanaged');
    unmanaged['text'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var result = resolvedValue(context, resolved);
            $element.text(result);
        },
    };
    unmanaged['innertext'] = unmanaged['text'];
    unmanaged['html'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var result = resolvedValue(context, resolved);
            $element.html(result);
        },
    };
    unmanaged['innerhtml'] = unmanaged['html'];
    unmanaged['value'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var result = resolvedValue(context, resolved);
            $element.val(result);
        },
    }
    unmanaged['attribute'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var result = resolvedValue(context, resolved);
            $element.attr(resolved.aspect, result);
        },
    }

    var component = createScopeRule('component');
    component['value'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                $element.val(value);
            };
            property.addBinding(binding);
        },
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var converter = resolved.converter;
            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                property.owner.doCommand(function () {
                    var val = event.target.value;
                    property.setValue(converter ? converter(val) : val);
                });
            };
            var trig = trigger || 'blur';
            $element.on(trig, eventBinding);
        },
    }

    component['text'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                $element.text(value);
            };
            var property = resolved.property || resolved.propertyPeek;
            if (property) {
                property.addBinding(binding);
            }
            else if (resolved.component) {
                binding(resolved.component);
            }
        },
    };
    component['innertext'] = component['text'];
    component['html'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                $element.html(value);
            };
            property.addBinding(binding);
        },
    };
    component['innerhtml'] = component['html'];
    component['staticHTML'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                value = window.toStaticHTML ? window.toStaticHTML(value) : value;
                $element.html(value);
            };
            property.addBinding(binding);
        },
    };
    component['click'] = {
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            if (property && resolved.reference[0] === '?') {
                $element.show();
            }

            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                var isDialogButton = event.target.id.endsWith('DialogButton')
                if (ns.isDialogOpen && !isDialogButton) {
                    return;
               }
                context.doCommand(function () {
                    var el = uiElement;
                    if (!property) property = context.resolveReference(resolved.reference).property;
                    var result = property && property.doCommand(context, meta);
                    if (result && property.status) ns.markForRefresh(property);
                    return result;
                });
            };

            $element.click(eventBinding);
        },
    };
    component['onclick'] = component['click'];

    component['blur'] = {
        readFromElement: function (context, uiElement, trigger, resolved) {

            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                context.doCommand(function () {
                    var el = uiElement;
                    if (!property) property = context.resolveReference(resolved.reference).property;
                    var result = property && property.doCommand(context, meta);
                    if (result && property.status) ns.markForRefresh(property);
                    return result;
                });
            };

            $element.blur(eventBinding);

            var pressBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                if (event.key.matches('Enter')) {
                    //eventBinding(e);
                    $element.blur();
                }
            }

            $element.keypress(pressBinding);
        },
    };
    component['onblur'] = component['blur'];


    //http://www.csharpguru.in/2013/03/javascript-to-allow-only-numbers-only.html
    //Except only numbers for Age textbox
    function onlyNumbers(event) {
        var charCode = (event.which) ? event.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;

        return true;
    }


    component['submit'] = {
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var source = context;
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                var spec = meta ? meta : source.getSpec();
                var form = event.target;
                context.doCommand(function () {
                    var result = property.doCommand(source, spec, form)
                    if (result && property.status) ns.markForRefresh(property);
                    return result;
                });
            };
            $element.submit(eventBinding);
        },
    };

    component['src'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                $element.attr(resolved.aspect, value);
            };
            property.addBinding(binding);
        },
    };

    component['attribute'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                $element.attr(resolved.aspect, value);
            };
            property.addBinding(binding);
        },
    }
    component['href'] = component['src'];
    component['show'] = {
        writeToElement: function (context, uiElement, resolved) {
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                var jElement = $(uiElement);
                return (value) ? jElement.show() : jElement.hide();
            };
            property.addBinding(binding);
        },
    };

    component['visible'] = component['show'];
    component['hide'] = {
        writeToElement: function (context, uiElement, resolved) {
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = !p.getValue(meta);
                var jElement = $(uiElement);
                return (value) ? jElement.show() : jElement.hide();
            };
            property.addBinding(binding);
        },
    };

    component['invisible'] = component['hide'];
    component['json'] = {
        writeToElement: function (context, uiElement, resolved) {
            var property = resolved.property || resolved.propertyPeek;
            var binding = function (p) {
                var value = p.getValue(resolved.meta);
                var string = value && value.stringify ? value.stringify.call(value) : JSON.stringify(value, null, 2);
                var jString = "<pre>{0}</pre>".format(string);
                $(uiElement).html(jString);
            };
            property.addBinding(binding);
        },
    };
    component['spec'] = {
        writeToElement: function (context, uiElement, resolved) {
            var property = resolved.property || resolved.propertyPeek;
            var binding = function (p) {
                var value = p.getValue(resolved.meta);
                var string = value && value.getSpec ? value.getSpec.call(value) : '';
                var jString = "<pre>{0}</pre>".format(string);
                $(uiElement).html(jString);
            };
            property.addBinding(binding);
        },
    };
    component['disabled'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                if (value) { //looking for a truthy value here
                    $element.attr("disabled", "disabled");
                } else {
                    $element.removeAttr("disabled")
                }
            };
            property.addBinding(binding);
        },
    };
    component['disable'] = component['disabled'];
    component['enabled'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                if (value) { //looking for a truthy value here
                    $element.removeAttr("disabled")
                } else {
                    $element.attr("disabled", "disabled");
                }
            };
            property.addBinding(binding);
        },
    };
    component['enable'] = component['enabled'];



    //element
    component['select'] = {
        modifyElement: function (context, uiElement, resolved) {
            uiElement.setAttribute("type", "select");

            //preview this binding plan to link option to value as lookup!!
            var sBindRule = utils.unComment(uiElement.getAttribute("data-bind"));
            var bindingPlan = utils.stylingStringToObject(sBindRule);
            if (utils.isaProperty(context)) {
                var validValuesPromise = context.getMetaDataAsync('validValues')
                validValuesPromise.whileWaiting(function () {
                }).continueWith(function (newValue) {
                    context['dynamicOptions'] = newValue;
                });
               
                return uiElement;  //somehow the property ownes the valid values
            }
            else if (bindingPlan.value && bindingPlan.options) {
                var value = context.getProperty(bindingPlan.value);
                var resolvedTo = context.resolveProperty(bindingPlan.options);
                var options = resolvedTo.collection ? resolvedTo.collection : resolvedTo.property ? resolvedTo.property : undefined;
                value['dynamicOptions'] = options;
            }
            return uiElement;
        }
    }

    //element,attribute
    component['select']['options'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var collection = resolved.collection;
            var meta = resolved.meta;

            collection = collection ? collection : property ? property.getValue(meta) : undefined;

            var sOptionRule = uiElement.getAttribute("data-option");
            var stylingplan = utils.stylingStringToObject(sOptionRule);
            //
            //  options should also remark the selected item if the value changes from and outside force
            //  like being set programtically  maybe notify with pub-sub?
            //


            var binding = function (context) {
                //assume the metaData always returns a promise that May execure right away..
                var value = collection ? collection : context ? context.getValue(meta) : undefined;

                if (utils.isArray(value)) {
                    //dynamically create collection just for UI, attach to property object 
                    collection = context['dynamic_collection'];
                    collection = collection ? collection : new ns.Collection([], context.owner); //special case
                    collection.reset(value);
                    context['dynamic_collection'] = collection;
                }
                else if (utils.isaCollection(value)) {
                    collection = value;
                }
 
                var validValuesPromise = collection ? collection.getMetaDataAsync() : context.getMetaDataAsync('validValues')

                validValuesPromise.whileWaiting(function () {
                    //go ahead and create it even if you are just going to replace or update it later
                    var html = "<option value='-1'>Loading...</option>";
                    $element.html(html); //this is a Select element
                }).continueWith(function (newValue) {
                    ///var xxx = context.getMetaData('validValues');  //this could be processed again
                    var html = bi.generateHtmlForSelectOptions(context, newValue, stylingplan);
                    $element.html(html); //this is a Select element
                });
            };

            if (utils.isaCollection(collection)) {
                collection.getProperty('count').addBinding(binding);
            }
            if (utils.isaProperty(property)) {
                property.addBinding(binding);
            }

            //? subscribe to value change using pub sub 
            // subscribe("value change", function() { binding(property) } so options rerender?
            //var id = $element.attr('id');
            //if (id === undefined && property) {  //establish ID for pub sub
            //    id = "{0}{1}".format(property.myName, new Date().getUTCMilliseconds());
            //    $element.attr('id', id);
            //}

            //ns.subscribe('SelectRefreshOptions', function (selectID) {
            //    if (selectID == id) {
            //        binding(property);
            //    }
            //});
        },

    }

    component['select']['value'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            var sOptionRule = uiElement.getAttribute("data-option");
            var stylingplan = utils.stylingStringToObject(sOptionRule);


            var valueStyle = stylingplan && stylingplan.value ? stylingplan.value : 'value'; //what is used to set the value
            valueStyle = property.getMetaData('validValuesKey', valueStyle);

            //this event sets the control value when it changes
            var binding = function () {
                var uiValue = $element.val();
                var newValue = property.getValue();

                var dynamicOptions = property['dynamicOptions'];
                var validValues = utils.isaProperty(dynamicOptions) ? dynamicOptions.getValue() : dynamicOptions;
                var valueLookup = validValues && validValues.indexOfFirst && validValues.itemByIndex ? validValues : undefined;

                if (newValue) {
                    if (valueLookup) {  //kinda test for array or collection
                        //first dereference the value if necessary
                        var index = parseInt(uiValue);
                        var valueIndex = valueLookup.indexOfFirst(function (item) {
                            var value = valueStyle && item[valueStyle] ? item[valueStyle] : item;
                            //might need a smarter equals for arrays , objects and such
                            return value == newValue;
                        });
                        if (index != valueIndex) {
                            $element.val(valueIndex);
                        }
                    }
                    else { //assume that there is no value lookup
                        if (uiValue != newValue) {
                            $element.val(newValue);
                        }
                    }
                }
                else {  //publish that bound value was smashed
                    //var id = $element.attr('id');
                    //ns.publish('SelectRefreshOptions', [id]);
                }
            };


            property.addBinding(binding);
        },

        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            var sOptionRule = uiElement.getAttribute("data-option");
            var stylingplan = utils.stylingStringToObject(sOptionRule);


            var valueStyle = stylingplan && stylingplan.value ? stylingplan.value : 'value'; //what is used to set the value
            valueStyle = property.getMetaData('validValuesKey', valueStyle);


            $element.on('change', function () {
                var uiValue = $(this).val();

                var dynamicOptions = property['dynamicOptions'];
                var validValues = utils.isaProperty(dynamicOptions) ? dynamicOptions.getValue() : dynamicOptions;
                var valueLookup = validValues && validValues.indexOfFirst && validValues.itemByIndex ? validValues : undefined;

                ns.runWithUIRefreshLock(function () {
                    if (valueLookup) {  //kinda test for array or collection
                        var index = parseInt(uiValue);
                        if (index >= 0) { //could be NAN or something googy
                            var value = valueLookup.itemByIndex(index); //might return undefined if out of range
                            var newValue = value && valueStyle && value[valueStyle] ? value[valueStyle] : value;
                            property.setValue(newValue);
                        }
                        else {
                            property.smash();
                        }
                    }
                    else {
                        property.setValue(uiValue);
                    }
                });
            });
        },
    }

    //element
    component['input'] = {
        modifyElement: function (context, uiElement, resolved) {
            return uiElement;
        }
    }

    //element, attribute
    component['input']['value'] = {        
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                var currentValue = $element.val();
                if (value != currentValue) {
                    $element.val(value);
                }
            };
            property.addBinding(binding);
        },
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var converter = resolved.converter;
            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                property.owner.doCommand(function () {
                    var val = event.target.value;
                    property.setValue(converter ? converter(val) : val);
                });
            };
            var trigger = trigger || 'blur';
            $element.on(trigger, eventBinding);
            $element.on('paste', eventBinding);
        },
    }

    //element, attribute
    component['textarea'] = {
        modifyElement: function (context, uiElement, resolved) {
            return uiElement;
        }
    }

    component['textarea']['value'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                var currentValue = $element.val();
                if (value != currentValue) {
                    $element.val(value);
                }
            };
            property.addBinding(binding);
        },
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var converter = resolved.converter;
            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                property.owner.doCommand(function () {
                    var val = event.target.value;
                    property.setValue(converter ? converter(val) : val);
                });
            };
            var trigger = trigger || 'blur';
            $element.on(trigger, eventBinding);
            $element.on('paste', eventBinding);
        },
    }

    //element, attribute
    component['input']['placeholder'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var value = p.getValue(meta);
                $element.attr('placeholder', value);
            };
            property.addBinding(binding);
        },
    }


    component['input']['button'] = {};
    component['input']['button']['value'] = {
        writeToElement: component['input']['value'].writeToElement,
    }

    component['input']['range'] = {};
    component['input']['range']['value'] = {
        writeToElement: component['input']['value'].writeToElement,
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var converter = resolved.converter ? resolved.converter : function (val) { return parseInt(val) };
            var eventBinding = function (e) {
                var event = e || window.event;
                event.cancelBubble = true;
                property.owner.doCommand(function () {
                    var val = event.target.value;
                    property.setValue(converter ? converter(val) : val);
                });
            };
            var trigger = trigger || 'change';
            $element.on(trigger, eventBinding);
        },
    }

    //element, type, attribute
    component['input']['radio'] = {};
    component['input']['radio']['value'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            var binding = function (p) {
                var currentValue = p.getValue(meta);
                //looking for a truthy value here
                var value = $element.val();
                $element.prop('checked', currentValue == value);
            };
            property.addBinding(binding);
        },
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            $element.on('change', function () {
                var value = $(this).val();
                //property.setValue(value);
                ns.runWithUIRefreshLock(function () {
                    property.setValue(value);
                });
            });
        },
    }

    //element, type, attribute
    component['input']['checkbox'] = {};
    component['input']['checkbox']['value'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;

            var binding = function (p) {
                var currentValue = p.getValue(meta);
                //looking for a truthy value here
                var value = $element.is(':checked');
                if (value !== currentValue) $element.prop('checked', currentValue);
            };
            property.addBinding(binding);
        },
        readFromElement: function (context, uiElement, trigger, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            $element.on('change', function () {
                var value = $(this).is(':checked');
                ns.runWithUIRefreshLock(function () {
                    property.setValue(value);
                });
            });
        },
    }



    var collection = createScopeRule('collection');
    collection['foreach'] = {
        writeToElement: function (context, uiElement, resolved) {
            var collection = resolved.collection;
            var binding = bi.createCollectionForeachBindingFunction(context, resolved, uiElement);
            if (utils.isaCollection(collection)) {
                collection.getProperty('count').addBinding(binding);
            }
        },
    };

    collection['innerhtml'] = component['innerhtml'];
    collection['select'] = {
        modifyElement: function (context, uiElement, resolved) {
            uiElement.setAttribute("type", "select");

            //preview this binding plan to link option to value as lookup!!
            var sBindRule = utils.unComment(uiElement.getAttribute("data-bind"));
            var bindingPlan = utils.stylingStringToObject(sBindRule);

            if (bindingPlan.value && bindingPlan.options) {
                var value = context.getProperty(bindingPlan.value);
                var options = context[bindingPlan.options];
                value['dynamicOptions'] = options;
            }
            return uiElement;
        }
    }
    collection['select']['options'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var collection = resolved.collection;
            var property = resolved.property || resolved.propertyPeek;

            var sOptionRule = uiElement.getAttribute("data-option");
            var stylingplan = utils.stylingStringToObject(sOptionRule);
 
            var binding = function (p) {
                //assume the metaData always returns a promise that May execure right away..
                var html = bi.generateHtmlForSelectOptions(context, collection, stylingplan);
                $element.html(html); //this is a Select element
            };
            if (utils.isaCollection(collection)) {
                collection.getProperty('count').addBinding(binding);
            }
            if (utils.isaProperty(property)) {
                property.addBinding(binding);
            }
        },
    }


    var property = createScopeRule('property');
    property['attribute'] = managed['attribute'];
    property['text'] = component['text'];
    property['innertext'] = component['innertext'];
    property['select'] = component['select'];
    property['select']['options'] = component['select']['options'];

    property['input'] = component['input'];
    property['input']['value'] = component['input']['value'];
    property['input']['placeholder'] = component['input']['placeholder'];

    var propertyPeek = createScopeRule('propertyPeek');
    propertyPeek['disabled'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var newValue = p.status !== undefined && p.value !== undefined;
                var oldValue = p.status === undefined && p.value !== undefined;
                var noValue = p.status === undefined && p.value === undefined;

                if (newValue) { //looking for a truthy value here
                    $element.attr("disabled", "disabled");
                } else if (oldValue || noValue) {
                    $element.removeAttr("disabled")
                }
            };
            property.addBinding(binding);
        },
    };

    propertyPeek['enabled'] = {
        writeToElement: function (context, uiElement, resolved) {
            var $element = $(uiElement);
            var property = resolved.property || resolved.propertyPeek;
            var meta = resolved.meta;
            var binding = function (p) {
                var oldValue = p.status === undefined && p.value !== undefined;
                var noValue = p.status === undefined && p.value === undefined;

                if (p.value == undefined || p.value == 0) { //looking for a truthy value here
                    $element.removeAttr("disabled")
                } else if (oldValue || noValue) {
                    $element.attr("disabled", "disabled");
                }
            };
            property.addBinding(binding);
        },
    };
   

    ns.computeBindingScope = function (context, uiElement, aspect, resolvedTo) {

        var elementName = uiElement.localName;
        var bindingScope = findScopeRule('component'); //the default scope is assume primitive bindings

        //remember to call modifyElement if it exist...
        if (utils.isaProperty(resolvedTo.propertyPeek)) {
            bindingScope = findScopeRule('propertyPeek');
        }
        else if (utils.isaComponent(context)) {
            bindingScope = findScopeRule('component');
        }
        else if (utils.isaCollection(context)) {
            bindingScope = findScopeRule('collection');
        }
        else if (utils.isaProperty(context)) {
            bindingScope = findScopeRule('property');
        }


        //hard rule...
        if (!resolvedTo.property) {
            if (resolvedTo.formula && utils.isManaged(context)) {
                //Maybe if not necessary to compute property  var result = resolvedValue(context, resolved);

                var tempName = utils.createID('temp_');
                var property = context.createProperty(tempName, resolvedTo.formula);
                resolvedTo.property = property;
            }
            else if (resolvedTo.slot) {
                bindingScope = findScopeRule('unmanaged');
            }
        }



        //last rule only goto element if it contains the aspect you are looking for

        //could this be details about an element? check and modify
        var detailBindingScope = bindingScope[elementName];
        if ( utils.hasAspect(detailBindingScope,aspect) ) {
            if (detailBindingScope.modifyElement) {
                detailBindingScope.modifyElement(context, uiElement, resolvedTo)

                //look for type attribute..
                var type = uiElement.hasAttribute('type') ? uiElement.getAttribute('type') : undefined;
                if (type && detailBindingScope[type]) {
                    var typedBindingScope = detailBindingScope[type];
                    if (typedBindingScope.modifyElement) {
                        typedBindingScope.modifyElement(context, uiElement, resolvedTo)
                    }

                    if (utils.hasAspect(typedBindingScope,aspect)) {
                        return typedBindingScope;
                    }
                }
            }
            return detailBindingScope;
        }
        
        return bindingScope;
    }

    ns.managedBinding = function (context, reference, uiElement, aspect) {

        if (reference && reference[0] === '?') {
            $(uiElement).hide();
        }

        var resolvedTo = context.resolveProperty(reference);
        if (Object.keys(resolvedTo).length == 0 ) {
            return false;
        }

        resolvedTo.reference = reference;
        resolvedTo.aspect = aspect;

        var bindingScope = ns.computeBindingScope(context, uiElement, aspect, resolvedTo);

        //first verify that the binding scope supports the aspect...
        var details = utils.getAspectOrDefault( bindingScope, aspect);
        details = details ? details : uiElement.hasAttribute(aspect) ? bindingScope['attribute'] : undefined;

        if (aspect.startsWith('data_')) {
            resolvedTo.aspect = 'data-' + aspect.substring(5);
            details = bindingScope['attribute'];
        }

        if (details === undefined) {
            var error = "Cannot find binding rule\n Context: {0}\n Scope: {1}\n Aspect: {2}\n Reference: {3}\n Element {4}";
            var source = utils.isManaged(context) ? context.myName : JSON.stringify(context);
            error = error.format(source, bindingScope.myName, aspect, reference, uiElement.toString());
            //throw Error(error);
            return false;
        }



        if (details.writeToElement) {
            details.writeToElement(context, uiElement, resolvedTo)
        }

        if (details.readFromElement) {
            var trigger = uiElement.getAttribute("data-update");
            details.readFromElement(context, uiElement, trigger, resolvedTo);
            var speech = uiElement.getAttribute("x-webkit-speech");
            if (speech) {
                details.readFromElement(context, uiElement, 'onChange', resolvedTo);
            }
        }
        return true;
    }

    ns.unmanagedBinding = function (context, reference, uiElement, aspect) {

        var bindingScope = findScopeRule('unmanaged'); //the default scope is assume primitive bindings
        //first verify that the binding scope supports the aspect...
        

        var details = bindingScope[aspect.toLowerCase()];
        if (details === undefined) {
            details= bindingScope['attribute'];
            //report that bindingScope does not know how to link to this aspect of an element
            return false;
        }

        var resolvedTo = {}; //(reference);

        if (details.writeToElement) {
            details.writeToElement(context, uiElement, resolvedTo)
        }

        if (details.readFromElement) {
            var trigger = uiElement.getAttribute("data-update");
            details.readFromElement(context, uiElement, trigger, resolvedTo)
        }
        return true;
    }

    ns.customBinding = function (context, reference, uiElement, aspect) {

        var custom = ns.customBindings[aspect];  //rename custom binding or directive??
        if (custom === undefined) return false;

       var resolvedTo = context.resolveProperty(reference);

        if (resolvedTo.property) {
            var property = resolvedTo.property;
            custom.init(uiElement, property, reference);
            var binding = function () { custom.update(uiElement, property, reference) };
            property.addBinding(binding);
            return true;
        }
    }



    var generic = createScopeRule('generic');
    generic['context'] = {
        writeToElement: function (context, uiElement, resolved, html) {
            var property = resolved.property;
            var component = resolved.component;

            var binding = bi.createContextBindingFunction(context, resolved, uiElement, html);
            if (utils.isaProperty(property)) {
                property.addBinding(binding);
            }
            if (component) {
                binding();
            }
        },
    };
    generic['repeater'] = {
        writeToElement: function (context, uiElement, resolved, html) {
            //ns.trace && ns.trace.funcTrace(arguments, 'writeToElement');

            var property = resolved.property;
            var collection = resolved.collection;
            var component = resolved.component;

            var binding = bi.createRepeaterBindingFunction(context, resolved, uiElement, html);

            //bind to collection if exist as value of propertu
            collection = collection ? collection : property ? property.getValue(resolved.meta) : undefined;


            if (utils.isaCollection(collection)) {
                var refresh = !utils.isaProperty(property);
                collection.getProperty('count').addBinding(binding, refresh);
            }
            if (utils.isaProperty(property)) {
                property.addBinding(binding);
            }
            if (component) {
                binding();
            }
        },
    };

    //simple implementation that could be overridden
    ns.getTemplate = function (id, defaultTemplate) {
        return defaultTemplate;
    }

    bi.appendRepeaterTemplate = function (item, uiParent, html) {
        //ns.trace && ns.trace.funcTrace(arguments, 'appendRepeaterTemplate');
        var elements = jQuery.parseHTML(html);
        $(uiParent).append(elements);

        var context = item;
        elements.forEach(function (element) {
            ns.bindTo(context, element);
        });

        return elements;
    }


    bi.createRepeaterBindingFunction = function (context, resolved, uiElement, outerHTML) {
        //ns.trace && ns.trace.funcTrace(arguments, 'createRepeaterBindingFunction');

        //var template = utils.cleanTemplateHtml(uiElement.outerHTML.trim());
        var defaultTemplate = outerHTML;


        //You may need to cashe this inline template
        var idTemplate = $(uiElement).attr("data-template");
        var parentElement = uiElement.parentNode;
        parentElement.removeChild(uiElement);

        return function () {
            //ns.trace && ns.trace.funcTrace(arguments, 'function used in binding');

            var property = resolved.property;
            var collection = resolved.collection;

            //var list = collection ? collection : property ? property.getValue(resolved.meta) : undefined;
            var list = property ? property.getValue(resolved.meta) : collection;



            //wrap arrays is temp collections

            if (utils.isArray(list)) list = new ns.Collection(list);
            if (utils.isaComponent(list)) list = new ns.Collection([list]);
            if (list === undefined && utils.isaComponent(component)) list = new ns.Collection([component]);

            //look if this is a false item and apply an existance test
            if (!list) {
                //delete this stuff..
                parentElement.innertext = '';
                //while (parentElement.hasChildNodes()) {
                //    parentElement.removeChild(parentElement.lastChild);
                //}

                return;
            }

            if (list && list.indexName) {  //for now delete everything and rerender
                //purgeUnusedItems(lookup);                
                while (parentElement.hasChildNodes()) {
                    parentElement.removeChild(parentElement.lastChild);
                } 
            }
 

            //add code to get all data guids and put in dictionary
            parentElement.innertext = '';
            var lookup = createItemDictionary(parentElement);

            function ApplyTemplateToArray(array, html) {
                //ns.trace && ns.trace.funcTrace(arguments, 'ApplyTemplateToArray');
                ns.runWithUIRefreshLock(function () {
                    array && array.forEach(function (item) {
                        if (!doesItemExist(item, lookup)) {
                            var boundItems = bi.appendRepeaterTemplate(item, parentElement, html);
                            boundItems.map(function (newlyBound) {
                                var id = item && item.getID ? item.getID() : item.toString();
                                $(newlyBound).attr("data-guid", id);
                            });
                        }
                    });
                });
            }

            //this forces the template to be located when the function is executed
            var myTemplate = ns.getTemplate(idTemplate, defaultTemplate);

            //at this point a template can just be text or a property object
            //create the new ones and keep store

            if (utils.isaPromise(myTemplate) && list) {
                myTemplate.continueWith(function (newValue) {
                    ApplyTemplateToArray(list, newValue);
                });
            }
            else if (list) {  //assume template is string of html, probably an inline template...
                ApplyTemplateToArray(list, myTemplate);
            }

            //delete what is not there be careful of scope
            purgeUnusedItems(lookup);

            //var text = parentElement.innerHTML; 
        }

    };


    bi.insertContextTemplate = function (item, uiParent, html) {
        var elements = jQuery.parseHTML(html);

        $(uiParent).html('');

        var context = item;
        $(uiParent).append(elements);

        elements.forEach(function (element) {
            ns.bindTo(context, element);
        });

        return elements;
    }


    bi.createContextBindingFunction = function (context, resolved, uiElement, outerHTML) {

        //var template = utils.cleanTemplateHtml(uiElement.outerHTML.trim());
        var defaultTemplate = outerHTML;


        //You may need to cashe this inline template
        var idTemplate = $(uiElement).attr("data-template");
        var parentElement = uiElement.parentNode;
        parentElement.removeChild(uiElement);

        return function () {

            var property = resolved.property;
            var component = resolved.component;

            var source = component ? component : property ? property.getValue(resolved.meta) : undefined;

            //look if this is a false item and apply an existance test
            if (!source) {
                //delete this stuff..
                parentElement.innertext = '';
                return;
            }

            function ApplyTemplateToContext(obj, html) {
                ns.runWithUIRefreshLock(function () {
                    var boundItems = bi.insertContextTemplate(obj, parentElement, html);
                    boundItems.map(function (newlyBound) {
                        var id = obj && obj.getID ? obj.getID() : obj.toString();
                        $(newlyBound).attr("data-guid", id);
                    });                       
                });
            }

            //this forces the template to be located when the function is executed
            var myTemplate = ns.getTemplate(idTemplate, defaultTemplate);

            //at this point a template can just be text or a property object
            //create the new ones and keep store

            if (utils.isaPromise(myTemplate) && source) {
                myTemplate.continueWith(function (newValue) {
                    ApplyTemplateToContext(source, newValue);
                });
            }
            else if (source) {  //assume template is string of html, probably an inline template...
                ApplyTemplateToContext(source, myTemplate);
            }
        }
    };


    ns.contextBinding = function (context, reference, uiElement, aspect) {

        var resolvedTo = context.resolveProperty(reference);

        var bindingScope = findScopeRule('generic');
        var details = bindingScope['context'];


        if (details === undefined) {
            var error = "Cannot find binding rule\n Context: {0}\n Scope: {1}\n Aspect: {2}\n Reference: {3}\n Element {4}";
            var source = utils.isManaged(context) ? context.myName : JSON.stringify(context);
            error = error.format(source, bindingScope.myName, aspect, reference, uiElement.toString());
            //throw Error(error);
            return false;
        }

        //var html = utils.cleanTemplateHtml(uiElement.outerHTML.trim());
        var html = utils.cleanTemplateHtml(uiElement.innerHTML.trim());


        if (details.writeToElement) {
            details.writeToElement(context, uiElement, resolvedTo, html)
        }

        if (details.readFromElement) {
            var trigger = uiElement.getAttribute("data-update");
            details.readFromElement(context, uiElement, trigger, resolvedTo)
        }
        return true;
    }

    ns.repeaterBinding = function (context, reference, uiElement, aspect) {

        var resolvedTo = context.resolveProperty(reference);

        var bindingScope = findScopeRule('generic');
        var details = bindingScope['repeater'];


        if (details === undefined) {
            var error = "Cannot find binding rule\n Context: {0}\n Scope: {1}\n Aspect: {2}\n Reference: {3}\n Element {4}";
            var source = utils.isManaged(context) ? context.myName : JSON.stringify(context);
            error = error.format(source, bindingScope.myName, aspect, reference, uiElement.toString());
            //throw Error(error);
            return false;
        }

        //var html = utils.cleanTemplateHtml(uiElement.outerHTML.trim());
        var html = utils.cleanTemplateHtml(uiElement.innerHTML.trim());


        if (details.writeToElement) {
            details.writeToElement(context, uiElement, resolvedTo, html)
        }

        if (details.readFromElement) {
            var trigger = uiElement.getAttribute("data-update");
            details.readFromElement(context, uiElement, trigger, resolvedTo)
        }
        return true;
    }


    ns.createBinding = function (uiElement, bindingPlan, context) {

        var bindingRules = ns.utils.isManaged(context) ? ns.managedBinding : ns.unmanagedBinding;

        var success = false;
        utils.forEachValue(bindingPlan, function (reference, aspect) {
            if (!ns.customBinding(context, reference, uiElement, aspect)) {
                success = bindingRules(context, reference, uiElement, aspect) || success;
            }
        });
        return success;
    }



    bi.createClassBindingEvent = function (sClass, property, uiElement, meta) {
        return function () {
            var oValue = property.getValue(meta);
            var $element = $(uiElement);
            var exist = $element.hasClass(sClass);
            if (sClass) {
                if (oValue && !exist) { //looking for a truthy value here
                    $element.addClass(sClass);
                }
                else if (!oValue && exist) {
                    $element.removeClass(sClass)
                }
            }
        };
    }

    ns.createStyleBinding = function (uiElement, stylingPlan, context) {

        ns.utils.forEachValue(stylingPlan, function (sClass, sProperty) {
            var ref = context.resolveProperty(sProperty);

            //this is how we set the class attribute.
            var binding = bi.createClassBindingEvent(sClass, ref.property, uiElement, ref.meta);
            ref.property.addBinding(binding);
        });

        bi.clearDataCSS(uiElement, context);
    }

    bi.clearDataCSS = function (uiElement, context) {
        if (uiElement.hasAttribute && uiElement.hasAttribute("data-css")) {
            var sBind = uiElement.getAttribute("data-css");
            uiElement.setAttribute("data-css", '//' + sBind);

            if (utils.isManaged(context)) {
                var sSource = context.asReference();
                uiElement.setAttribute("data-css-source", sSource);
            }
            return true;
        }
    }

    ns.bind = function (obj, element) {
        if (element && element.hasAttribute) {
            if (element.hasAttribute("data-context")) {
                var sContextRule = element.getAttribute("data-context");
                if (sContextRule && !utils.isComment(sContextRule)) {
                    sContextRule = sContextRule.trim();
                    element.setAttribute("data-context", utils.comment(sContextRule));
                    ns.contextBinding(obj, sContextRule, element, 'context');
                }
            }

            if (element.hasAttribute("data-repeater")) {
                var sRepeaterRule = element.getAttribute("data-repeater");
                if (sRepeaterRule && !utils.isComment(sRepeaterRule)) {
                    sRepeaterRule = sRepeaterRule.trim();
                    element.setAttribute("data-repeater", utils.comment(sRepeaterRule));
                    ns.repeaterBinding(obj, sRepeaterRule, element, 'repeater');
                }
            }

            if (element.hasAttribute("data-bind")) {
                var sBindRule = element.getAttribute("data-bind");
                if (!utils.isComment(sBindRule)) {
                    sBindRule = sBindRule.trim();
                    element.setAttribute("data-bind", utils.comment(sBindRule));
                    var bindingPlan = utils.bindingStringToObject(sBindRule);
                    if (bindingPlan) {
                        if (!ns.createBinding(element, bindingPlan, obj)) {
                            element.setAttribute("data-bind", utils.unComment(sBindRule));
                        };
                    }
                }
            }
            //maybe this need to be done in post binding??
            //returns a json dictionary        
            if (element.hasAttribute("data-css")) {
                var cssRule = element.getAttribute("data-css");
                if (!utils.isComment(cssRule)) {
                    cssRule = cssRule.trim();
                    element.setAttribute("data-css", utils.comment(cssRule));
                    var stylingPlan = utils.stylingStringToObject(cssRule);
                    if (stylingPlan) ns.createStyleBinding(element, stylingPlan, obj);
                }
            }
        }
    }

    function getAllBindableChildren(source, list, deep) {
        var children = source.children;
        var length = children ? children.length : 0

        for (var i = 0; i < length; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                if (child.hasAttribute && child.hasAttribute("data-context")) {
                    var sContextRule = child.getAttribute("data-context");
                    if (utils.isComment(sContextRule)) continue;

                    list.push(child)
                }
                else if (child.hasAttribute && child.hasAttribute("data-repeater")) {
                    var sRepeaterRule = child.getAttribute("data-repeater");
                    if (utils.isComment(sRepeaterRule)) continue;

                    list.push(child)
                }
                else if (child.hasAttribute && child.hasAttribute("data-bind")) {
                    var sBindRule = child.getAttribute("data-bind");
                    if (utils.isComment(sBindRule)) continue;

                    list.push(child)
                    if (deep) getAllBindableChildren(child, list, deep);
                }
                else if (child && child.children && child.children.length) {
                    getAllBindableChildren(child, list, deep)
                }
            }
        }
        return list;
    }

    ns.getBindableElements = function (source) {
        var results = [];

        if (source.hasAttribute && source.hasAttribute("data-bind")) {
            var sBindRule = source.getAttribute("data-bind");
            if (!utils.isComment(sBindRule)) results.push(source)
        }


        results = getAllBindableChildren(source, results, true);
    
        return results;
    }

    ns.bindTo = function (obj, target) {
        var element = target || document.body;
        var children = ns.getBindableElements(element);
        if (children.length == 0) return;


        //if there are not children, then bind directly
        ns.runWithUIRefreshLock(function () {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                ns.bind(obj, child);
            };
        });

        return children;
    }


    function getAllLinkableChildren(source, list) {
        var children = source.children;
        var length = children ? children.length : 0

        for (var i = 0; i < length; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                if (child.hasAttribute && child.hasAttribute("data-link")) {
                    var sLinkRule = child.getAttribute("data-link");
                    if (sLinkRule.startsWith('//')) continue;

                    list.push(child)
                    getAllLinkableChildren(child, list);
                }
                else if (child && child.children && child.children.length) {
                    getAllLinkableChildren(child, list)
                }
            }
        }
        return list;
    }

    ns.linkTo = function (obj, target) {

        var uiElements = getAllLinkableChildren(target, []);
        ns.runWithUIRefreshLock(function () {

            for (var i = 0; i < uiElements.length; i++) {
                var child = uiElements[i];
                var sLinkRule = child.getAttribute("data-link");

                var context = ns.linkQueue[sLinkRule];
                //root.bindTo(context, child);
                if (context)
                    ns.bind(context, child);
                
            }
        });
        //deleting this queue was bad on second render
        ns.linkQueue = {};
    }


    ns.linkQueue = {};
    ns.queuelinkItem = function (obj) {
        var id = obj.getID();
        ns.linkQueue[id] = obj;
    }

    if (!ns.Component.prototype.bindTo$) {
        ns.Component.prototype.bindTo$ = function (selector) {
            var comp = this;
            ns.runWithUIRefreshLock(function () {
                $(selector).each(function (index, element) {
                    ns.bindTo(comp, element);
                });
            });
            return comp;
        };
    }

    ns.bindTo$ = function (comp, selector) {
        var reference = "#{0} {1}".format(comp.myName, utils.asString(selector));
        comp.bindTo$(reference);
    }

    ns.bindComponentByid = function (comp) {
        if (comp === undefined) return;

        var members = comp.elements;
        if (members === undefined) {
            var selector = "#{0},#{1}".format(comp.getID(),comp.myName);
            $(selector).each(function (i, element) {
                ns.bindTo(comp, element, true);
            });
        }
        else {
            members.forEach(ns.bindComponentByid);
        }
    }

    ns.bindModel = function (comp) {
        if (comp === undefined) return;
        var all = comp.selectComponents();
        all.forEach(function (item) {
            ns.bindComponentByid(item);
        });
        ns.bindComponentByid(comp);
    }

    if (!ns.Component.prototype.bindModelTo$) {
        ns.Component.prototype.bindModelTo$ = function (selector) {
            var comp = this;
            ns.runWithUIRefreshLock(function () {
                $(selector).each(function (index, element) {
                    ns.bindModel(comp, element);
                });
            });
            return comp;
        };
    }

    //need a way un unbind lets attach the funct to a data-attribute
    ns.bindEvent = function (uiElement, event, comp, callback) {
        //$('#foo').bind('click', handler);
        //$('#foo').unbind('click', handler);
        var handler = function () { ns.runWithUIRefreshLock(callback) };
        $(uiElement).on(event, handler);
    }

    if (!ns.Component.prototype.bindToEvent$) {
        ns.Component.prototype.bindToEvent$ = function (selector, event, callback) {
            var comp = this;
            $(selector).each(function (index, element) {
                ns.bindEvent(element, event, comp, callback);
            });
            return comp;
        };
    }


    return ns;

}(Foundry, jQuery));