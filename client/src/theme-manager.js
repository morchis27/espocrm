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

define('theme-manager', [], function () {

    /**
     * A theme manager.
     *
     * @class
     * @name Class
     * @memberOf module:theme-manager
     *
     * @param {module:models/settings.Class} config A config.
     * @param {module:models/preferences.Class} preferences Preferences.
     * @param {module:metadata.Class} metadata Metadata.
     */
    let ThemeManager = function (config, preferences, metadata) {
        this.config = config;
        this.preferences = preferences;
        this.metadata = metadata;
    };

    _.extend(ThemeManager.prototype, /** module:theme-manager.Class# */{

        /**
         * @private
         */
        defaultParams: {
            screenWidthXs: 768,
            dashboardCellHeight: 155,
            dashboardCellMargin: 19,
        },

        /**
         * Get a theme name for the current user.
         *
         * @returns {string}
         */
        getName: function () {
            if (!this.config.get('userThemesDisabled')) {
                let name = this.preferences.get('theme');

                if (name && name !== '') {
                    return name;
                }
            }

            return this.config.get('theme');
        },

        /**
         * Get a theme name currently applied to the DOM.
         *
         * @returns {string|null} Null if not applied.
         */
        getAppliedName: function () {
            let name = window.getComputedStyle(document.body).getPropertyValue('--theme-name');

            if (!name) {
                return null;
            }

            return name.trim();
        },

        /**
         * Whether a current theme is applied to the DOM.
         *
         * @returns {boolean}
         */
        isApplied: function () {
            let appliedName = this.getAppliedName();

            if (!appliedName) {
                return true;
            }

            return this.getName() === appliedName;
        },

        /**
         * Get a stylesheet path for a current theme.
         *
         * @returns {string}
         */
        getStylesheet: function () {
            let link = this.metadata.get(['themes', this.getName(), 'stylesheet']) ||
                'client/css/espo/espo.css';

            if (this.config.get('cacheTimestamp')) {
                link += '?r=' + this.config.get('cacheTimestamp').toString();
            }

            return link;
        },

        /**
         * Get an iframe stylesheet path for a current theme.
         *
         * @returns {string}
         */
        getIframeStylesheet: function () {
            let link = this.metadata.get(['themes', this.getName(), 'stylesheetIframe']) ||
                'client/css/espo/espo-iframe.css';

            if (this.config.get('cacheTimestamp')) {
                link += '?r=' + this.config.get('cacheTimestamp').toString();
            }

            return link;
        },

        /**
         * Get an iframe-fallback stylesheet path for a current theme.
         *
         * @returns {string}
         */
        getIframeFallbackStylesheet: function () {
            let link = this.metadata.get(['themes', this.getName(), 'stylesheetIframeFallback']) ||
                'client/css/espo/espo-iframe.css';

            if (this.config.get('cacheTimestamp')) {
                link += '?r=' + this.config.get('cacheTimestamp').toString();
            }

            return link;
        },

        /**
         * Get a theme parameter.
         *
         * @param {string} name A parameter name.
         * @returns {*} Null if not set.
         */
        getParam: function (name) {
            return this.metadata.get(['themes', this.getName(), name]) ||
                this.defaultParams[name] || null;
        },

        /**
         * Whether a current theme is different from a system default theme.
         *
         * @returns {boolean}
         */
        isUserTheme: function () {
            if (!this.config.get('userThemesDisabled')) {
                let name = this.preferences.get('theme');

                if (name && name !== '') {
                    if (name !== this.config.get('theme')) {
                        return true;
                    }
                }
            }

            return false;
        },
    });

    return ThemeManager;
});
