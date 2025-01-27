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

define('views/modal', ['view'], function (Dep) {

    /**
     * A base modal view. Can be extended or used directly.
     *
     * Options:
     * - `headerHtml`
     * - `headerText`
     * - `$header`
     * - `backdrop`
     * - `buttonList`
     * - `dropdownItemList`
     *
     * @see {@link https://docs.espocrm.com/development/modal/}
     *
     * @class
     * @name Class
     * @extends module:view.Class
     * @memberOf module:views/modal
     */
    return Dep.extend(/** @lends module:views/modal.Class# */{

        /**
         * A button or dropdown action item.
         *
         * @typedef {Object} module:views/modal.Class~Button
         *
         * @property {string} name A name.
         * @property {string} [label] A label. To be translated
         *   (with a scope defined in the `scope` class property).
         * @property {string} [text] A text (not translated).
         * @property {string} [html] HTML.
         * @property {boolean} [pullLeft=false] To put the button to the other side.
         * @property {'default'|'danger'|'success'|'warning'} [style='default'] A style.
         * @property {boolean} [hidden=false] Is hidden.
         * @property {boolean} [disabled=false] Disabled.
         * @property {function():void} [onClick] Called on click. If not defined, then
         * the `action<Name>` class method will be called.
         */

        /**
         * A CSS name.
         *
         * @protected
         */
        cssName: 'modal-dialog',

        /**
         * A class-name. Use `'dialog dialog-record'` for modals containing a record form.
         *
         * @protected
         */
        className: 'dialog',

        /**
         * @protected
         * @deprecated Use `headerHtml`
         */
        header: false,

        /**
         * A header HTML.
         *
         * @protected
         * @type {string}
         */
        headerHtml: null,

        /**
         * A dialog instance.
         *
         * @protected
         * @type {Espo.Ui.Dialog}
         */
        dialog: null,

        /**
         * A container selector.
         *
         * @protected
         * @type {string}
         */
        containerSelector: null,

        /**
         * A scope name. Used when translating button labels.
         *
         * @type {string|null}
         */
        scope: null,

        /**
         * A backdrop.
         *
         * @protected
         * @type {'static'|boolean}
         */
        backdrop: 'static',

        /**
         * Buttons.
         *
         * @protected
         * @type {module:views/modal.Class~Button[]}
         */
        buttonList: [],

        /**
         * Dropdown action items.
         *
         * @protected
         * @type {module:views/modal.Class~Button[]}
         */
        dropdownItemList: [],

        /**
         * @deprecated Use `buttonList`.
         * @protected
         * @todo Remove.
         */
        buttons: [],

        /**
         * A width.
         *
         * @protected
         * @type {number|null}
         */
        width: null,

        /**
         * Not used.
         *
         * @deprecated
         */
        fitHeight: false,

        /**
         * To disable fitting to a window height.
         *
         * @protected
         * @type {boolean}
         */
        noFullHeight: false,

        /**
         * Disable the ability to close by pressing the `Esc` key.
         *
         * @protected
         * @type {boolean}
         */
        escapeDisabled: false,

        /**
         * Is draggable.
         *
         * @protected
         * @type {boolean}
         */
        isDraggable: false,

        /**
         * Is collapsable.
         *
         * @protected
         * @type {boolean}
         */
        isCollapsable: false,

        /**
         * Is collapsed. Do not change value. Only for reading.
         *
         * @protected
         * @type {boolean}
         */
        isCollapsed: false,

        /**
         * @inheritDoc
         */
        events: {
            /** @this module:views/modal.Class */
            'click .action': function (e) {
                Espo.Utils.handleAction(this, e);
            },
            /** @this module:views/modal.Class */
            'click [data-action="collapseModal"]': function () {
                this.collapse();
            },
        },

        /**
         * @inheritDoc
         */
        init: function () {
            var id = this.cssName + '-container-' + Math.floor((Math.random() * 10000) + 1).toString();
            var containerSelector = this.containerSelector = '#' + id;

            this.header = this.options.header || this.header;
            this.headerHtml = this.options.headerHtml || this.headerHtml;
            this.$header = this.options.$header || this.$header;

            if (this.options.headerText) {
                this.headerHtml = Handlebars.Utils.escapeExpression(this.options.headerText);
            }

            this.backdrop = this.options.backdrop || this.backdrop;

            this.setSelector(this.containerSelector);

            this.buttonList = this.options.buttonList || this.buttonList;
            this.dropdownItemList = this.options.dropdownItemList || this.dropdownItemList;

            this.buttonList = Espo.Utils.cloneDeep(this.buttonList);
            this.dropdownItemList = Espo.Utils.cloneDeep(this.dropdownItemList);

            // @todo Remove it as deprecated.
            this.buttons = Espo.Utils.cloneDeep(this.buttons);

            this.on('render', () => {
                if (this.dialog) {
                    this.dialog.close();
                }

                this.isCollapsed = false;

                $(containerSelector).remove();

                $('<div />').css('display', 'none')
                    .attr('id', id)
                    .addClass('modal-container')
                    .appendTo('body');

                var modalBodyDiffHeight = 92;

                if (this.getThemeManager().getParam('modalBodyDiffHeight') !== null) {
                    modalBodyDiffHeight = this.getThemeManager().getParam('modalBodyDiffHeight');
                }

                let headerHtml = this.headerHtml || this.header;

                if (this.$header && this.$header.length) {
                    headerHtml = this.$header.get(0).outerHTML;
                }

                this.dialog = new Espo.Ui.Dialog({
                    backdrop: this.backdrop,
                    header: headerHtml,
                    container: containerSelector,
                    body: '',
                    buttonList: this.getDialogButtonList(),
                    dropdownItemList: this.getDialogDropdownItemList(),
                    width: this.width,
                    keyboard: !this.escapeDisabled,
                    fitHeight: this.fitHeight,
                    draggable: this.isDraggable,
                    className: this.className,
                    bodyDiffHeight: modalBodyDiffHeight,
                    footerAtTheTop: this.getThemeManager().getParam('modalFooterAtTheTop'),
                    fullHeight: !this.noFullHeight && this.getThemeManager().getParam('modalFullHeight'),
                    screenWidthXs: this.getThemeManager().getParam('screenWidthXs'),
                    fixedHeaderHeight: this.fixedHeaderHeight,
                    closeButton: !this.noCloseButton,
                    collapseButton: this.isCollapsable,
                    onRemove: () => {
                        this.onDialogClose();
                    },
                });

                this.setElement(containerSelector + ' .body');
            });

            this.on('after:render', () => {
                $(containerSelector).show();

                this.dialog.show();

                if (this.fixedHeaderHeight && this.flexibleHeaderFontSize) {
                    this.adjustHeaderFontSize();
                }
            });

            this.once('remove', () => {
                if (this.dialog) {
                    this.dialog.close();
                }

                $(containerSelector).remove();
            });
        },

        /**
         * Get a button list for a dialog.
         *
         * @private
         * @return {module:ui.Dialog~Button[]}
         */
        getDialogButtonList: function () {
            var buttonListExt = [];

            // TODO remove it as deprecated
            this.buttons.forEach(item => {
                var o = Espo.Utils.clone(item);

                if (!('text' in o) && ('label' in o)) {
                    o.text = this.getLanguage().translate(o.label);
                }

                buttonListExt.push(o);
            });

            this.buttonList.forEach(item => {
                var o = {};

                if (typeof item === 'string') {
                    o.name = item;
                } else if (typeof item === 'object') {
                    o = item;
                } else {
                    return;
                }

                if (!o.text) {
                    if ('label' in o) {
                        o.text = this.translate(o.label, 'labels', this.scope);
                    } else {
                        o.text = this.translate(o.name, 'modalActions', this.scope);
                    }
                }

                o.onClick = o.onClick || ((d, e) => {
                    let handler = o.handler || (o.data || {}).handler;

                    Espo.Utils.handleAction(this, e, o.name, handler);
                });

                buttonListExt.push(o);
            });

            return buttonListExt;
        },

        /**
         * Get a dropdown item list for a dialog.
         *
         * @private
         * @return {module:ui.Dialog~Button[]}
         */
        getDialogDropdownItemList: function () {
            var dropdownItemListExt = [];

            this.dropdownItemList.forEach((item) => {
                var o = {};

                if (typeof item === 'string') {
                    o.name = item;
                } else if (typeof item === 'object') {
                    o = item;
                } else {
                    return;
                }

                if (!o.text) {
                    if ('label' in o) {
                        o.text = this.translate(o.label, 'labels', this.scope)
                    } else {
                        o.text = this.translate(o.name, 'modalActions', this.scope);
                    }
                }

                o.onClick = o.onClick || ((d, e) => {
                    let handler = o.handler || (o.data || {}).handler;

                    Espo.Utils.handleAction(this, e, o.name, handler);
                });

                dropdownItemListExt.push(o);
            });

            return dropdownItemListExt;
        },

        /**
         * @private
         */
        updateDialog: function () {
            if (!this.dialog) {
                return;
            }

            this.dialog.buttonList = this.getDialogButtonList();
            this.dialog.dropdownItemList = this.getDialogDropdownItemList();
        },

        /**
         * @private
         */
        onDialogClose: function () {
            if (!this.isBeingRendered() && !this.isCollapsed) {
                this.trigger('close');
                this.remove();
            }
        },

        /**
         * A `cancel` action.
         */
        actionCancel: function () {
            this.trigger('cancel');
            this.dialog.close();
        },

        /**
         * A `close` action.
         */
        actionClose: function () {
            this.trigger('cancel');
            this.dialog.close();
        },

        /**
         * Close a dialog.
         */
        close: function () {
            this.dialog.close();
        },

        /**
         * Disable a button.
         *
         * @param {string} name A button name.
         */
        disableButton: function (name) {
            this.buttonList.forEach((d) => {
                if (d.name !== name) {
                    return;
                }

                d.disabled = true;
            });

            if (!this.isRendered()) {
                return;
            }

            this.$el.find('footer button[data-name="'+name+'"]')
                .addClass('disabled')
                .attr('disabled', 'disabled');
        },

        /**
         * Enable a button.
         *
         * @param {string} name A button name.
         */
        enableButton: function (name) {
            this.buttonList.forEach((d) => {
                if (d.name !== name) {
                    return;
                }

                d.disabled = false;
            });

            if (!this.isRendered()) {
                return;
            }

            this.$el.find('footer button[data-name="'+name+'"]')
                .removeClass('disabled')
                .removeAttr('disabled');
        },

        /**
         * Add a button.
         *
         * @param {module:ui.Dialog~Button} o Button definitions.
         * @param {boolean|string} [position=false] True prepends, false appends. If a string,
         *   then will be added after a button with a corresponding name.
         * @param {boolean} [doNotReRender=false] Do not re-render.
         */
        addButton: function (o, position, doNotReRender) {
            var index = -1;

            this.buttonList.forEach((item, i) => {
                if (item.name === o.name) {
                    index = i;
                }
            });

            if (~index) {
                return;
            }

            if (position === true) {
                this.buttonList.unshift(o);
            }
            else if (typeof position === 'string') {
                index = -1;

                this.buttonList.forEach((item, i) => {
                    if (item.name === position) {
                        index = i;
                    }
                });

                if (~index) {
                    this.buttonList.splice(index, 0, o);
                } else {
                    this.buttonList.push(o);
                }
            }
            else {
                this.buttonList.push(o);
            }

            if (!doNotReRender && this.isRendered()) {
                this.reRenderFooter();
            }
        },

        /**
         * Add a dropdown item.
         *
         * @param {module:ui.Dialog~Button} o Button definitions.
         * @param {boolean} [toBeginning=false] To prepend.
         * @param {boolean} [doNotReRender=false] Do not re-render.
         */
        addDropdownItem: function (o, toBeginning, doNotReRender) {
            var method = toBeginning ? 'unshift' : 'push';

            if (!o) {
                this.dropdownItemList[method](false);

                return;
            }

            var name = o.name;

            if (!name) {
                return;
            }

            for (var i in this.dropdownItemList) {
                if (this.dropdownItemList[i].name === name) {
                    return;
                }
            }

            this.dropdownItemList[method](o);

            if (!doNotReRender && this.isRendered()) {
                this.reRenderFooter();
            }
        },

        /**
         * @private
         */
        reRenderFooter: function () {
            if (!this.dialog) {
                return;
            }

            this.updateDialog();

            var html = this.dialog.getFooterHtml();

            this.$el.find('footer.modal-footer').html(html);

            this.dialog.initButtonEvents();
        },

        /**
         * Remove a button or a dropdown action item.
         *
         * @param {string} name A name.
         * @param {boolean} [doNotReRender=false] Do not re-render.
         */
        removeButton: function (name, doNotReRender) {
            var index = -1;

            this.buttonList.forEach((item, i) => {
                if (item.name === name) {
                    index = i;
                }
            });

            if (~index) {
                this.buttonList.splice(index, 1);
            }

            for (var i in this.dropdownItemList) {
                if (this.dropdownItemList[i].name === name) {
                    this.dropdownItemList.splice(i, 1);

                    break;
                }
            }

            if (this.isRendered()) {
                this.$el.find('.modal-footer [data-name="'+name+'"]').remove();
            }

            if (!doNotReRender && this.isRendered()) {
                this.reRender();
            }
        },

        /**
         * @deprecated Use `showActionItem`.
         *
         * @protected
         * @param {string} name
         */
        showButton: function (name) {
            this.buttonList.forEach((d) => {
                if (d.name !== name) {
                    return;
                }

                d.hidden = false;
            });

            if (!this.isRendered()) {
                return;
            }

            this.$el.find('footer button[data-name="'+name+'"]').removeClass('hidden');
        },

        /**
         * @deprecated Use `hideActionItem`.
         *
         * @protected
         * @param {string} name
         */
        hideButton: function (name) {
            this.buttonList.forEach((d) => {
                if (d.name !== name) {
                    return;
                }

                d.hidden = true;
            });

            if (!this.isRendered()) {
                return;
            }

            this.$el.find('footer button[data-name="'+name+'"]').addClass('hidden');
        },

        /**
         * Show an action item (button or dropdown item).
         *
         * @param {string} name A name.
         */
        showActionItem: function (name) {
            this.buttonList.forEach(d => {
                if (d.name !== name) {
                    return;
                }

                d.hidden = false;
            });

            this.dropdownItemList.forEach(d => {
                if (d.name !== name) {
                    return;
                }

                d.hidden = false;
            });

            if (!this.isRendered()) {
                return;
            }

            this.$el.find('footer button[data-name="'+name+'"]').removeClass('hidden');
            this.$el.find('footer li > a[data-name="'+name+'"]').parent().removeClass('hidden');

            if (!this.isDropdownItemListEmpty()) {
                this.$el.find('footer .main-btn-group > .btn-group').removeClass('hidden');
            }
        },

        /**
         * Hide an action item (button or dropdown item).
         *
         * @param {string} name A name.
         */
        hideActionItem: function (name) {
            this.buttonList.forEach(d => {
                if (d.name !== name) {
                    return;
                }

                d.hidden = true;
            });
            this.dropdownItemList.forEach(d => {
                if (d.name !== name) {
                    return;
                }

                d.hidden = true;
            });

            if (!this.isRendered()) {
                return;
            }

            this.$el.find('footer button[data-name="'+name+'"]').addClass('hidden');
            this.$el.find('footer li > a[data-name="'+name+'"]').parent().addClass('hidden');

            if (this.isDropdownItemListEmpty()) {
                this.$el.find('footer .main-btn-group > .btn-group').addClass('hidden');
            }
        },

        /**
         * @private
         * @return {boolean}
         */
        isDropdownItemListEmpty: function () {
            if (this.dropdownItemList.length === 0) {
                return true;
            }

            var isEmpty = true;

            this.dropdownItemList.forEach((item) => {
                if (!item.hidden) {
                    isEmpty = false;
                }
            });

            return isEmpty;
        },

        /**
         * @private
         * @param {number} [step=0]
         */
        adjustHeaderFontSize: function (step) {
            step = step || 0;

            if (!step) {
                this.fontSizePercentage = 100;
            }

            var $titleText = this.$el.find('.modal-title > .modal-title-text');

            var containerWidth = $titleText.parent().width();
            var textWidth = 0;

            $titleText.children().each((i, el) => {
                textWidth += $(el).outerWidth(true);
            });

            if (containerWidth < textWidth) {
                if (step > 5) {
                    var $title = this.$el.find('.modal-title');

                    $title.attr('title', $titleText.text());
                    $title.addClass('overlapped');

                    $titleText.children().each((i, el) => {
                       $(el).removeAttr('title');
                    });

                    return;
                }

                var fontSizePercentage = this.fontSizePercentage -= 4;

                this.$el.find('.modal-title .font-size-flexible')
                    .css('font-size', this.fontSizePercentage + '%');

                this.adjustHeaderFontSize(step + 1);
            }
        },

        /**
         * Collapse.
         */
        collapse: function () {
            this.beforeCollapse().then(data => {
                if (!this.getParentView()) {
                    throw new Error("Can't collapse w/o parent view.");
                }

                this.isCollapsed = true;

                data = data || {};

                let title;

                if (data.title) {
                    title = data.title;
                }
                else {
                    let $title = this.$el.find('.modal-header .modal-title .modal-title-text');

                    if ($title.children().length) {
                        $title.children()[0];
                    }

                    title = $title.text();
                }

                let key = this._path.split('/').pop();

                this.dialog.close();

                let masterView = this;

                while (masterView.getParentView()) {
                    masterView = masterView.getParentView();
                }

                this.getParentView().unchainView(key);

                (new Promise(resolve => {
                    if (masterView.hasView('collapsedModalBar')) {
                        resolve(masterView.getView('collapsedModalBar'));

                        return;
                    }

                    masterView
                        .createView('collapsedModalBar', 'views/collapsed-modal-bar', {
                            el: 'body > .collapsed-modal-bar',
                        })
                        .then(view => resolve(view));
                }))
                .then(barView => {
                    barView.addModalView(this, {title: title});
                });
            });
        },

        /**
         * Called before collapse. Can be extended to execute some logic, e.g. save form data.
         *
         * @protected
         * @return {Promise}
         */
        beforeCollapse: function () {
            return new Promise(resolve => resolve());
        },
    });
});
