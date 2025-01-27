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

define('views/record/edit', ['views/record/detail'], function (Dep) {

    /**
     * An edit-record view. Used for create and edit.
     *
     * @class
     * @name Class
     * @extends module:views/record/detail.Class
     * @memberOf module:views/record/edit
     */
    return Dep.extend(/** @lends module:views/record/edit.Class# */{

        /**
         * @inheritDoc
         */
        template: 'record/edit',

        /**
         * @inheritDoc
         */
        type: 'edit',

        /**
         * @inheritDoc
         */
        name: 'edit',

        /**
         * @inheritDoc
         */
        fieldsMode: 'edit',

        /**
         * @inheritDoc
         */
        mode: 'edit',

        /**
         * @inheritDoc
         */
        buttonList: [
            {
                name: 'save',
                label: 'Save',
                style: 'primary',
            },
            {
                name: 'cancel',
                label: 'Cancel',
            }
        ],

        /**
         * @inheritDoc
         */
        dropdownItemList: [],

        /**
         * @inheritDoc
         */
        sideView: 'views/record/edit-side',

        /**
         * @inheritDoc
         */
        bottomView: 'views/record/edit-bottom',

        /**
         * @inheritDoc
         */
        duplicateAction: false,

        /**
         * @inheritDoc
         */
        saveAndContinueEditingAction: true,

        /**
         * @inheritDoc
         */
        saveAndNewAction: true,

        /**
         * @inheritDoc
         */
        setupHandlerType: 'record/edit',

        /**
         * @inheritDoc
         */
        actionSave: function (data) {
            var isNew = this.isNew;

            this.save(data.options)
                .then(
                    function () {
                        this.exit(isNew ? 'create' : 'save');
                    }.bind(this)
                )
                .catch(function () {});
        },

        /**
         * A `cancel` action.
         */
        actionCancel: function () {
            this.cancel();
        },

        /**
         * Cancel.
         */
        cancel: function () {
            if (this.isChanged) {
                this.resetModelChanges();
            }

            this.setIsNotChanged();
            this.exit('cancel');
        },

        /**
         * @inheritDoc
         */
        setupBeforeFinal: function () {
            if (this.model.isNew()) {
                this.populateDefaults();
            }

            Dep.prototype.setupBeforeFinal.call(this);
        },

        /**
         * @inheritDoc
         */
        setupActionItems: function () {
            Dep.prototype.setupActionItems.call(this);

            if (
                this.saveAndContinueEditingAction &&
                this.getAcl().checkScope(this.entityType, 'edit')
            ) {
                this.dropdownItemList.push({
                    name: 'saveAndContinueEditing',
                    label: 'Save & Continue Editing',
                });
            }

            if (
                this.isNew &&
                this.saveAndNewAction &&
                this.getAcl().checkScope(this.entityType, 'create')
            ) {
                this.dropdownItemList.push({
                    name: 'saveAndNew',
                    label: 'Save & New',
                });
            }
        },

        /**
         * A `save-and-create-new` action.
         */
        actionSaveAndNew: function (data) {
            data = data || {};

            var proceedCallback = function () {
                Espo.Ui.success(this.translate('Created'));

                this.getRouter().dispatch(this.scope, 'create', {
                    rootUrl: this.options.rootUrl,
                });

                this.getRouter().navigate('#' + this.scope + '/create', {trigger: false});
            }.bind(this)

            this.save(data.options)
                .then(proceedCallback)
                .catch(function () {});

            if (this.lastSaveCancelReason === 'notModified') {
                 proceedCallback();
            }
        },
    });
});
