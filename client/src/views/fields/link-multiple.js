/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2022 Yurii Kuznietsov, Taras Machyshyn, Oleksii Avramenko
 * Website: https://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/fields/link-multiple', ['views/fields/base'], function (Dep) {

    /**
     * A link-multiple field (has-many relation).
     *
     * @class
     * @name Class
     * @extends module:views/fields/base.Class
     * @memberOf module:views/fields/link-multiple
     */
    return Dep.extend(/** @lends module:views/fields/link-multiple.Class# */{

        /**
         * @inheritDoc
         */
        type: 'linkMultiple',

        /**
         * @inheritDoc
         */
        listTemplate: 'fields/link-multiple/list',

        /**
         * @inheritDoc
         */
        detailTemplate: 'fields/link-multiple/detail',

        /**
         * @inheritDoc
         */
        editTemplate: 'fields/link-multiple/edit',

        /**
         * @inheritDoc
         */
        searchTemplate: 'fields/link-multiple/search',

        /**
         * A name-hash attribute name.
         *
         * @protected
         * @type {string}
         */
        nameHashName: null,

        /**
         * A IDs attribute name.
         *
         * @protected
         * @type {string}
         */
        idsName: null,

        /**
         * @protected
         * @type {Object.<string.name>|null}
         */
        nameHash: null,

        /**
         * @protected
         * @type {string[]|null}
         */
        ids: null,

        /**
         * A foreign entity type.
         *
         * @protected
         * @type {string}
         */
        foreignScope: null,

        /**
         * Autocomplete disabled.
         *
         * @protected
         * @type {boolean}
         */
        autocompleteDisabled: false,

        /**
         * A select-record view.
         *
         * @protected
         * @type {string}
         */
        selectRecordsView: 'views/modals/select-records',

        /**
         * Create disabled.
         *
         * @protected
         * @type {boolean}
         */
        createDisabled: false,

        /**
         * @protected
         * @type {boolean}
         */
        sortable: false,

        /**
         * A search type list.
         *
         * @protected
         * @type {string[]}
         */
        searchTypeList: [
            'anyOf',
            'isEmpty',
            'isNotEmpty',
            'noneOf',
            'allOf',
        ],

        /**
         * A primary filter list that will be available when selecting a record.
         *
         * @protected
         * @type {string[]|null}
         */
        selectFilterList: null,

        /**
         * A select bool filter list.
         *
         * @protected
         * @type {string[]|null}
         */
        selectBoolFilterList: null,

        /**
         * A select primary filter.
         *
         * @protected
         * @type {string|null}
         */
        selectPrimaryFilterName: null,

        /**
         * An autocomplete max record number.
         *
         * @protected
         * @type {number|null}
         */
        autocompleteMaxCount: null,

        /**
         * Select all attributes.
         *
         * @protected
         * @type {boolean}
         */
        forceSelectAllAttributes: false,

        /**
         * @protected
         * @type {string}
         */
        iconHtml: '',

        /**
         * @inheritDoc
         */
        data: function () {
            var ids = this.model.get(this.idsName);

            return _.extend({
                idValues: this.model.get(this.idsName),
                idValuesString: ids ? ids.join(',') : '',
                nameHash: this.model.get(this.nameHashName),
                foreignScope: this.foreignScope,
                valueIsSet: this.model.has(this.idsName),
            }, Dep.prototype.data.call(this));
        },

        /**
         * Get advanced filters (field filters) to be applied when select a record.
         * Can be extended.
         *
         * @protected
         * @return {Object.<string,module:search-manager~advancedFilter>|null}
         */
        getSelectFilters: function () {
            return null;
        },

        /**
         * Get a select bool filter list. Applied when select a record.
         * Can be extended.
         *
         * @protected
         * @return {string[]|null}
         */
        getSelectBoolFilterList: function () {
            return this.selectBoolFilterList;
        },

        /**
         * Get a select primary filter. Applied when select a record.
         * Can be extended.
         *
         * @protected
         * @return {string|null}
         */
        getSelectPrimaryFilterName: function () {
            return this.selectPrimaryFilterName;
        },

        /**
         * Get a primary filter list that will be available when selecting a record.
         * Can be extended.
         *
         * @return {string[]|null}
         */
        getSelectFilterList: function () {
            return this.selectFilterList;
        },

        /**
         * Attributes to pass to a model when creating a new record.
         * Can be extended.
         *
         * @return {Object.<string,*>|null}
         */
        getCreateAttributes: function () {
            return null;
        },

        /**
         * @inheritDoc
         */
        setup: function () {
            this.nameHashName = this.name + 'Names';
            this.idsName = this.name + 'Ids';

            this.foreignScope = this.options.foreignScope ||
                this.foreignScope ||
                this.model.getFieldParam(this.name, 'entity') ||
                this.model.getLinkParam(this.name, 'entity');

            if ('createDisabled' in this.options) {
                this.createDisabled = this.options.createDisabled;
            }

            if (this.isSearchMode()) {
                var nameHash = this.getSearchParamsData().nameHash || this.searchParams.nameHash || {};
                var idList = this.getSearchParamsData().idList || this.searchParams.value || [];

                this.nameHash = Espo.Utils.clone(nameHash);
                this.ids = Espo.Utils.clone(idList);
            }
            else {
                this.copyValuesFromModel();
            }

            this.listenTo(this.model, 'change:' + this.idsName, () => {
                this.copyValuesFromModel();
            });

            this.sortable = this.sortable || this.params.sortable;

            this.iconHtml = this.getHelper().getScopeColorIconHtml(this.foreignScope);

            if (!this.isListMode()) {
                this.addActionHandler('selectLink', () => {
                    this.notify('Loading...');

                    var viewName = this.getMetadata()
                            .get('clientDefs.' + this.foreignScope + '.modalViews.select') ||
                        this.selectRecordsView;

                    this.createView('dialog', viewName, {
                        scope: this.foreignScope,
                        createButton: !this.createDisabled && !this.isSearchMode(),
                        filters: this.getSelectFilters(),
                        boolFilterList: this.getSelectBoolFilterList(),
                        primaryFilterName: this.getSelectPrimaryFilterName(),
                        filterList: this.getSelectFilterList(),
                        multiple: true,
                        createAttributes: this.isEditMode() ? this.getCreateAttributes() : null,
                        mandatorySelectAttributeList: this.mandatorySelectAttributeList,
                        forceSelectAllAttributes: this.forceSelectAllAttributes,
                    }, dialog => {
                        dialog.render();

                        Espo.Ui.notify(false);

                        this.listenToOnce(dialog, 'select', (models) => {
                            this.clearView('dialog');

                            if (Object.prototype.toString.call(models) !== '[object Array]') {
                                models = [models];
                            }

                            models.forEach(model => {
                                this.addLink(model.id, model.get('name'));
                            });
                        });
                    });
                });

                this.events['click a[data-action="clearLink"]'] = (e) => {
                    var id = $(e.currentTarget).attr('data-id');

                    this.deleteLink(id);
                };
            }
        },

        /**
         * Copy values from a model to view properties.
         */
        copyValuesFromModel: function () {
            this.ids = Espo.Utils.clone(this.model.get(this.idsName) || []);
            this.nameHash = Espo.Utils.clone(this.model.get(this.nameHashName) || {});
        },

        /**
         * Handle a search type.
         *
         * @protected
         * @param {string} type A type.
         */
        handleSearchType: function (type) {
            if (~['anyOf', 'noneOf', 'allOf'].indexOf(type)) {
                this.$el.find('div.link-group-container').removeClass('hidden');
            }
            else {
                this.$el.find('div.link-group-container').addClass('hidden');
            }
        },

        /**
         * @inheritDoc
         */
        setupSearch: function () {
            this.events = _.extend({
                'change select.search-type': (e) => {
                    var type = $(e.currentTarget).val();

                    this.handleSearchType(type);
                },
            }, this.events || {});
        },

        /**
         * Get an autocomplete max record number. Can be extended.
         *
         * @protected
         * @return {number}
         */
        getAutocompleteMaxCount: function () {
            if (this.autocompleteMaxCount) {
                return this.autocompleteMaxCount;
            }

            return this.getConfig().get('recordsPerPage');
        },

        /**
         * Compose an autocomplete URL. Can be extended.
         *
         * @protected
         * @return {string}
         */
        getAutocompleteUrl: function () {
            var url = this.foreignScope + '?&maxSize=' + this.getAutocompleteMaxCount();

            if (!this.forceSelectAllAttributes) {
                var select = ['id', 'name'];

                if (this.mandatorySelectAttributeList) {

                    select = select.concat(this.mandatorySelectAttributeList);
                }

                url += '&select=' + select.join(',')
            }

            var boolList = this.getSelectBoolFilterList();

            if (boolList) {
                url += '&' + $.param({'boolFilterList': boolList});
            }

            var primary = this.getSelectPrimaryFilterName();

            if (primary) {
                url += '&' + $.param({'primaryFilter': primary});
            }

            return url;
        },

        /**
         * @inheritDoc
         */
        afterRender: function () {
            if (this.isEditMode() || this.isSearchMode()) {
                this.$element = this.$el.find('input.main-element');

                var $element = this.$element;

                if (!this.autocompleteDisabled) {
                    this.$element.on('blur', () => {
                        setTimeout(() => this.$element.autocomplete('clear'), 300);
                    });

                    this.$element.autocomplete({
                        serviceUrl: (q) => {
                            return this.getAutocompleteUrl(q);
                        },
                        minChars: 1,
                        paramName: 'q',
                        noCache: true,
                        autoSelectFirst: true,
                        triggerSelectOnValidInput: false,
                        beforeRender: ($c) => {
                            if (this.$element.hasClass('input-sm')) {
                                $c.addClass('small');
                            }
                        },
                        formatResult: (suggestion) => {
                            return this.getHelper().escapeString(suggestion.name);
                        },
                        transformResult: response => {
                            response = JSON.parse(response);

                            var list = [];

                            response.list.forEach((item) => {
                                list.push({
                                    id: item.id,
                                    name: item.name || item.id,
                                    data: item.id,
                                    value: item.name || item.id,
                                });
                            });

                            return {
                                suggestions: list
                            };
                        },
                        onSelect: (s) => {
                            this.addLink(s.id, s.name);

                            this.$element.val('');
                        },
                    });

                    this.$element.attr('autocomplete', 'espo-' + this.name);

                    this.once('render', () => {
                        $element.autocomplete('dispose');
                    });

                    this.once('remove', () => {
                        $element.autocomplete('dispose');
                    });
                }

                $element.on('change', () => {
                    $element.val('');
                });

                this.renderLinks();

                if (this.isEditMode()) {
                    if (this.sortable) {
                        this.$el.find('.link-container').sortable({
                            stop: () => {
                                this.fetchFromDom();
                                this.trigger('change');
                            },
                        });
                    }
                }

                if (this.isSearchMode()) {
                    var type = this.$el.find('select.search-type').val();

                    this.handleSearchType(type);

                    this.$el.find('select.search-type').on('change', () => {
                        this.trigger('change');
                    });
                }
            }
        },

        /**
         * Render items.
         *
         * @protected
         */
        renderLinks: function () {
            this.ids.forEach(id => {
                this.addLinkHtml(id, this.nameHash[id]);
            });
        },

        /**
         * Delete an item.
         *
         * @protected
         * @param {string} id An ID.
         */
        deleteLink: function (id) {
            this.trigger('delete-link', id);
            this.trigger('delete-link:' + id);

            this.deleteLinkHtml(id);

            var index = this.ids.indexOf(id);

            if (index > -1) {
                this.ids.splice(index, 1);
            }

            delete this.nameHash[id];

            this.afterDeleteLink(id);
            this.trigger('change');
        },

        /**
         * Add an item.
         *
         * @protected
         * @param {string} id An ID.
         * @param {string} name A name.
         */
        addLink: function (id, name) {
            if (!~this.ids.indexOf(id)) {
                this.ids.push(id);

                this.nameHash[id] = name;

                this.addLinkHtml(id, name);
                this.afterAddLink(id);

                this.trigger('add-link', id);
                this.trigger('add-link:' + id);
            }

            this.trigger('change');
        },

        /**
         * @protected
         * @param {string} id An ID.
         */
        afterDeleteLink: function (id) {},

        /**
         * @protected
         * @param {string} id An ID.
         */
        afterAddLink: function (id) {},

        /**
         * @protected
         * @param {string} id An ID.
         */
        deleteLinkHtml: function (id) {
            this.$el.find('.link-' + id).remove();
        },

        /**
         * @protected
         * @param {string} id An ID.
         * @param {string} name A name.
         * @return {JQuery}
         */
        addLinkHtml: function (id, name) {
            name = name || id;

            id = Handlebars.Utils.escapeExpression(id);
            name = Handlebars.Utils.escapeExpression(name);

            var $container = this.$el.find('.link-container');

            var $el = $('<div />')
                .addClass('link-' + id)
                .addClass('list-group-item')
                .attr('data-id', id);

            $el.html(name + '&nbsp');

            $el.prepend(
                $('<a />')
                    .addClass('pull-right')
                    .attr('href', 'javascript:')
                    .attr('data-id', id)
                    .attr('data-action', 'clearLink')
                    .append(
                        $('<span />').addClass('fas fa-times')
                    )
            );

            $container.append($el);

            return $el;
        },

        /**
         * @param {string} id An ID.
         * @return {string|null}
         */
        getIconHtml: function (id) {
            return this.iconHtml;
        },

        /**
         * Get an item HTML for detail mode.
         *
         * @param {string} id An ID.
         * @return {string}
         */
        getDetailLinkHtml: function (id) {
            var name = this.nameHash[id] || id;

            id = Handlebars.Utils.escapeExpression(id);
            name = Handlebars.Utils.escapeExpression(name);

            if (!name && id) {
                name = this.translate(this.foreignScope, 'scopeNames');
            }

            var iconHtml = '';

            if (this.isDetailMode()) {
                iconHtml = this.getIconHtml(id);
            }

            return '<a href="#' + this.foreignScope + '/view/' + id + '">' +
                iconHtml + name + '</a>';
        },

        /**
         * @inheritDoc
         */
        getValueForDisplay: function () {
            if (!this.isDetailMode() && !this.isListMode()) {
                return null;
            }

            var names = [];

            this.ids.forEach((id) => {
                names.push(this.getDetailLinkHtml(id));
            });

            if (!names.length) {
                return null;
            }

            return names
                .map(
                    name => $('<div />')
                        .addClass('link-multiple-item')
                        .html(name)
                        .wrap('<div />').parent().html()
                )
                .join('');
        },

        /**
         * @inheritDoc
         */
        validateRequired: function () {
            if (this.isRequired()) {
                var idList = this.model.get(this.idsName) || [];

                if (idList.length === 0) {
                    var msg = this.translate('fieldIsRequired', 'messages')
                        .replace('{field}', this.getLabelText());

                    this.showValidationMessage(msg);

                    return true;
                }
            }
        },

        /**
         * @inheritDoc
         */
        fetch: function () {
            var data = {};

            data[this.idsName] = this.ids;
            data[this.nameHashName] = this.nameHash;

            return data;
        },

        /**
         * @inheritDoc
         */
        fetchFromDom: function () {
            this.ids = [];

            this.$el.find('.link-container').children().each((i, li) => {
                var id = $(li).attr('data-id');

                if (!id) {
                    return;
                }

                this.ids.push(id);
            });
        },

        /**
         * @inheritDoc
         */
        fetchSearch: function () {
            var type = this.$el.find('select.search-type').val();
            var idList = this.ids || [];

            if (~['anyOf', 'allOf', 'noneOf'].indexOf(type) && !idList.length) {
                return {
                    type: 'isNotNull',
                    attribute: 'id',
                    data: {
                        type: type,
                    },
                };
            }

            var data;

            if (type === 'anyOf') {
                data = {
                    type: 'linkedWith',
                    value: idList,
                    data: {
                        type: type,
                        nameHash: this.nameHash,
                    },
                };

                return data;
            }

            if (type === 'allOf') {
                data = {
                    type: 'linkedWithAll',
                    value: idList,
                    data: {
                        type: type,
                        nameHash: this.nameHash,
                    },
                };

                if (!idList.length) {
                    data.value = null;
                }

                return data;
            }

            if (type === 'noneOf') {
                data = {
                    type: 'notLinkedWith',
                    value: idList,
                    data: {
                        type: type,
                        nameHash: this.nameHash,
                    },
                };

                return data;
            }

            if (type === 'isEmpty') {
                data = {
                    type: 'isNotLinked',
                    data: {
                        type: type,
                    },
                };

                return data;
            }

            if (type === 'isNotEmpty') {
                data = {
                    type: 'isLinked',
                    data: {
                        type: type,
                    },
                };

                return data;
            }
        },

        /**
         * @inheritDoc
         */
        getSearchType: function () {
            return this.getSearchParamsData().type ||
                this.searchParams.typeFront ||
                this.searchParams.type || 'anyOf';
        },
    });
});
