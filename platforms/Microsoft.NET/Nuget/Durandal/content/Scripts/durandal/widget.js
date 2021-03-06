/**
 * Durandal 2.0.0 Copyright (c) 2012 Blue Spire Consulting, Inc. All Rights Reserved.
 * Available via the MIT license.
 * see: http://durandaljs.com or https://github.com/BlueSpire/Durandal for details.
 */
define('durandal/widget', ['durandal/system', 'durandal/composition', 'jquery', 'knockout'], function(system, composition, $, ko) {
    var partAttributeName = 'data-part',
        partAttributeSelector = '[' + partAttributeName + ']';

    var kindModuleMaps = {},
        kindViewMaps = {},
        bindableSettings = ['model', 'view', 'kind'];

    var widget = {
        getParts: function(elements) {
            var parts = {};

            if (!system.isArray(elements)) {
                elements = [elements];
            }

            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];

                if (element.getAttribute) {
                    var id = element.getAttribute(partAttributeName);
                    if (id) {
                        parts[id] = element;
                    }

                    var childParts = $(partAttributeSelector, element)
                                        .not($('[data-bind^="widget:"] ' + partAttributeSelector, element));

                    for (var j = 0; j < childParts.length; j++) {
                        var part = childParts.get(j);
                        parts[part.getAttribute(partAttributeName)] = part;
                    }
                }
            }

            return parts;
        },
        getSettings: function(valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()) || {};

            if (system.isString(value)) {
                return value;
            } else {
                for (var attrName in value) {
                    if (ko.utils.arrayIndexOf(bindableSettings, attrName) != -1) {
                        value[attrName] = ko.utils.unwrapObservable(value[attrName]);
                    } else {
                        value[attrName] = value[attrName];
                    }
                }
            }

            return value;
        },
        registerKind: function(kind) {
            ko.bindingHandlers[kind] = {
                init: function() {
                    return { controlsDescendantBindings: true };
                },
                update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var settings = widget.getSettings(valueAccessor);
                    settings.kind = kind;
                    widget.create(element, settings, bindingContext);
                }
            };

            ko.virtualElements.allowedBindings[kind] = true;
        },
        mapKind: function(kind, viewId, moduleId) {
            if (viewId) {
                kindViewMaps[kind] = viewId;
            }

            if (moduleId) {
                kindModuleMaps[kind] = moduleId;
            }
        },
        mapKindToModuleId: function(kind) {
            return kindModuleMaps[kind] || widget.convertKindToModulePath(kind);
        },
        convertKindToModulePath: function(kind) {
            return 'widgets/' + kind + '/viewmodel';
        },
        mapKindToViewId: function(kind) {
            return kindViewMaps[kind] || widget.convertKindToViewPath(kind);
        },
        convertKindToViewPath: function(kind) {
            return 'widgets/' + kind + '/view';
        },
        beforeBind: function (child, context) {
            var replacementParts = widget.getParts(context.parent);
            var standardParts = widget.getParts(child);

            for (var partId in replacementParts) {
                $(standardParts[partId]).replaceWith(replacementParts[partId]);
            }
        },
        createCompositionSettings: function(element, settings) {
            if (!settings.model) {
                settings.model = this.mapKindToModuleId(settings.kind);
            }

            if (!settings.view) {
                settings.view = this.mapKindToViewId(settings.kind);
            }

            settings.preserveContext = true;
            settings.beforeBind = this.beforeBind;
            settings.activate = true;
            settings.activationData = settings;

            return settings;
        },
        create: function(element, settings, bindingContext) {
            if (system.isString(settings)) {
                settings = { kind: settings };
            }

            var compositionSettings = widget.createCompositionSettings(element, settings);

            composition.compose(element, compositionSettings, bindingContext);
        }
    };

    ko.bindingHandlers.widget = {
        init: function() {
            return { controlsDescendantBindings: true };
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var settings = widget.getSettings(valueAccessor);
            widget.create(element, settings, bindingContext);
        }
    };

    ko.virtualElements.allowedBindings.widget = true;

    return widget;
});
