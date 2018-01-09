/*
    Foundry.rules.templates.js part of the FoundryJS project
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
/// <reference path="../Apprentice/handlebars-1.0.rc.1.js" />


var Foundry = Foundry || {};


(function (ns, $, bars, undefined) {


    $.expr[':'].focus = function (elem) {
        return elem === document.activeElement && (elem.type || elem.href);
    };

    ns.templateCashe = ns.makeComponent();

    ns.templateCashe.DoGetAsync = function (url, OnComplete) {
        var token = ns.templateCashe.createAsyncToken(url, OnComplete, self.NetworkFailed);
        $.get(url).success(function (data) {
            token.onComplete(data);
            });
        return token;
    };

    ns.loadAllTemplatesAsync = function (onLoaded) {
        var cashe = ns.templateCashe;
        $("script[type*=html],script[type*=x-handlebars-template]").each(function (i, uiElement) {
            var $element = $(uiElement);
            var id = $element.attr('id');
            if (id && cashe[id] === undefined) {
                var html = $element.html();
                var src = $element.attr('src');
                if (src) { //async chase down this value, return a promice...
                    cashe.establishManagedProperty(id, function () {
                        var result = cashe.DoGetAsync(src, function (data) {
                            var resultData = data;
                            if (src.endsWith('.svg')) {
                                var XMLS = new XMLSerializer();
                                resultData = XMLS.serializeToString(data)
                            }
                            result.fulfillPromised(resultData);
                            onLoaded && onLoaded(id, resultData);
                        });
                        return result;
                    }).getValue();  //this forces a call
                }
                else if (html) { // assert this html value
                    cashe.establishManagedProperty(id, html);
                    onLoaded && onLoaded(id, html);
                }
            }
        });
    };

    ns.loadScriptAsync = function (id) {
        var cashe = ns.templateCashe;
        if (cashe[id] === undefined) {
            $("#" + id).each(function (i, uiElement) {
                var $element = $(uiElement);
                if (id && cashe[id] === undefined) {
                    var html = $element.html();
                    var src = $element.attr('src');
                    if (src) { //async chase down this value, return a promice...
                        cashe.establishManagedProperty(id, function () {
                            var result = cashe.DoGetAsync(src, function (data) {
                                result.fulfillPromised(data);
                            });
                            return result;
                        }).getValue();  //this forces a call
                    }
                    else if (html) { // assert this html value
                        cashe.establishManagedProperty(id, html);
                    }
                }
            });
        }
        var result = cashe[id];
        return result;
    };

    //maybe this should return a propery object that can be demanded and tracked;
    //this is like returning an observable...
    ns.getTemplate = function (id, defaultTemplate) {
        if (id === undefined) return defaultTemplate;

        var cashe = ns.templateCashe;
        var result = ns.loadScriptAsync(id, defaultTemplate);
        result ? result : cashe.establishManagedProperty(id, defaultTemplate);

        var result = result && result.trim ? result.trim() : result;
        var html = fo.utils.cleanTemplateHtml(result);
        return html;

    }




}(Foundry, jQuery, handlebars));
