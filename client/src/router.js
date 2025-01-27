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

define('router', [], function () {

    /**
     * On route.
     *
     * @event Backbone.Router#route
     * @param {string} name A route name.
     * @param {any[]} args Arguments.
     */

    /**
     * After dispatch.
     *
     * @event module:router#routed
     * @param {{
     *   controller: string,
     *   action:string,
     *   options: Object.<string,*>,
     * }} data A route data.
     */

    /**
     * A router.
     *
     * @class
     * @name Class
     * @memberOf module:router
     * @mixes Espo.Events
     */
    let Router = Backbone.Router.extend(/** @lends module:router.Class# */ {

        /**
         * @private
         */
        routeList: [
            {
                route: "clearCache",
                resolution: "clearCache"
            },
            {
                route: ":controller/view/:id/:options",
                resolution: "view"
            },
            {
                route: ":controller/view/:id",
                resolution: "view"
            },
            {
                route: ":controller/edit/:id/:options",
                resolution: "edit"
            },
            {
                route: ":controller/edit/:id",
                resolution: "edit"
            },
            {
                route: ":controller/create",
                resolution: "create"
            },
            {
                route: ":controller/:action/:options",
                resolution: "action",
                order: 100
            },
            {
                route: ":controller/:action",
                resolution: "action",
                order: 200
            },
            {
                route: ":controller",
                resolution: "defaultAction",
                order: 300
            },
            {
                route: "*actions",
                resolution: "home",
                order: 500
            },
        ],

        /**
         * @private
         */
        _bindRoutes: function() {},

        /**
         * @private
         */
        setupRoutes: function () {
            this.routeParams = {};

            if (this.options.routes) {
                let routeList = [];

                Object.keys(this.options.routes).forEach(route => {
                    let item = this.options.routes[route];

                    routeList.push({
                        route: route,
                        resolution: item.resolution || 'defaultRoute',
                        order: item.order || 0
                    });

                    this.routeParams[route] = item.params || {};
                });

                this.routeList = Espo.Utils.clone(this.routeList);

                routeList.forEach(item => {
                    this.routeList.push(item);
                });

                this.routeList = this.routeList.sort((v1, v2) => {
                    return (v1.order || 0) - (v2.order || 0);
                });
            }

            this.routeList.reverse().forEach(item => {
                this.route(item.route, item.resolution);
            });
        },

        /**
         * @private
         */
        _last: null,

        /**
         * Whether a confirm-leave-out was set.
         *
         * @public
         * @type {boolean}
         */
        confirmLeaveOut: false,

        /**
         * Whether back has been processed.
         *
         * @public
         * @type {boolean}
         */
        backProcessed: false,

        /**
         * @type {string}
         * @internal
         */
        confirmLeaveOutMessage: 'Are you sure?',

        /**
         * @type {string}
         * @internal
         */
        confirmLeaveOutConfirmText: 'Yes',

        /**
         * @type {string}
         * @internal
         */
        confirmLeaveOutCancelText: 'No',

        /**
         * @private
         */
        initialize: function (options) {
            this.options = options || {};
            this.setupRoutes();

            this.history = [];

            let detectBackOrForward = (onBack, onForward) => {
                let hashHistory = [window.location.hash];
                let historyLength = window.history.length;

                return function () {
                    let hash = window.location.hash, length = window.history.length;

                    if (hashHistory.length && historyLength === length) {
                        if (hashHistory[hashHistory.length - 2] === hash) {
                            hashHistory = hashHistory.slice(0, -1);

                            if (onBack) {
                                onBack();
                            }

                            return;
                        }

                        hashHistory.push(hash);

                        if (onForward) {
                            onForward();
                        }

                        return;
                    }

                    hashHistory.push(hash);
                };
            };

            window.addEventListener(
                'hashchange',
                detectBackOrForward(() => {
                    this.backProcessed = true;

                    setTimeout(() => {
                        this.backProcessed = false;
                    }, 50);
                })
            );

            this.on('route', () => {
                this.history.push(Backbone.history.fragment);
            });

            window.addEventListener('beforeunload', (e) => {
                e = e || window.event;

                if (this.confirmLeaveOut) {
                    e.preventDefault();

                    e.returnValue = this.confirmLeaveOutMessage;

                    return this.confirmLeaveOutMessage;
                }
            });
        },

        /**
         * Get a current URL.
         *
         * @returns {string}
         */
        getCurrentUrl: function () {
            return '#' + Backbone.history.fragment;
        },

        /**
         * @callback module:router.Class~checkConfirmLeaveOutCallback
         */

        /**
         * Process confirm-leave-out.
         *
         * @param {module:router.Class~checkConfirmLeaveOutCallback} callback Proceed if confirmed.
         * @param {Object|null} [context] A context.
         * @param {boolean} [navigateBack] To navigate back if not confirmed.
         */
        checkConfirmLeaveOut: function (callback, context, navigateBack) {
            if (this.confirmLeaveOutDisplayed) {
                this.navigateBack({trigger: false});

                this.confirmLeaveOutCanceled = true;

                return;
            }

            context = context || this;

            if (this.confirmLeaveOut) {
                this.confirmLeaveOutDisplayed = true;
                this.confirmLeaveOutCanceled = false;

                Espo.Ui.confirm(
                    this.confirmLeaveOutMessage,
                    {
                        confirmText: this.confirmLeaveOutConfirmText,
                        cancelText: this.confirmLeaveOutCancelText,
                        backdrop: true,
                        cancelCallback: () => {
                            this.confirmLeaveOutDisplayed = false;

                            if (navigateBack) {
                                this.navigateBack({trigger: false});
                            }
                        },
                    },
                    () => {
                        this.confirmLeaveOutDisplayed = false;
                        this.confirmLeaveOut = false;

                        if (!this.confirmLeaveOutCanceled) {
                            callback.call(context);
                        }
                    }
                );

                return;
            }

            callback.call(context);
        },

        /**
         * @private
         */
        route: function (route, name, callback) {
            let routeOriginal = route;

            if (!_.isRegExp(route)) {
                route = this._routeToRegExp(route);
            }

            if (_.isFunction(name)) {
                callback = name;
                name = '';
            }

            if (!callback) {
                callback = this[name];
            }

            let router = this;

            Backbone.history.route(route, function (fragment) {
                let args = router._extractParameters(route, fragment);

                let options = {};

                if (name === 'defaultRoute') {
                    let keyList = [];

                    routeOriginal.split('/').forEach(key => {
                        if (key && key.indexOf(':') === 0) {
                            keyList.push(key.substr(1));
                        }
                    });

                    keyList.forEach((key, i) => {
                        options[key] = args[i];
                    });
                }

                if (router.execute(callback, args, name, routeOriginal, options) !== false) {
                    router.trigger.apply(router, ['route:' + name].concat(args));

                    router.trigger('route', name, args);

                    Backbone.history.trigger('route', router, name, args);
                }
            });

            return this;
        },

        /**
         * @private
         */
        execute: function (callback, args, name, routeOriginal, options) {
            this.checkConfirmLeaveOut(function () {
                if (name === 'defaultRoute') {
                    this.defaultRoute(this.routeParams[routeOriginal], options);

                    return;
                }

                Backbone.Router.prototype.execute.call(this, callback, args, name);
            }, null, true);
        },

        /**
         * Navigate.
         *
         * @param {string} fragment An URL fragment.
         * @param {Object} options Options: trigger, replace.
         */
        navigate: function (fragment, options) {
            this.history.push(fragment);

            return Backbone.Router.prototype.navigate.call(this, fragment, options);
        },

        /**
         * Navigate back.
         *
         * @param {Object} options Options: trigger, replace.
         */
        navigateBack: function (options) {
            let url;

            if (this.history.length > 1) {
                url = this.history[this.history.length - 2];
            }
            else {
                url = this.history[0];
            }

            this.navigate(url, options);
        },

        /**
         * @private
         */
        _parseOptionsParams: function (string) {
            if (!string) {
                return {};
            }

            if (string.indexOf('&') === -1 && string.indexOf('=') === -1) {
                return string;
            }

            let options = {};

            if (typeof string !== 'undefined') {
                string.split('&').forEach((item, i) => {
                    let p = item.split('=');

                    options[p[0]] = true;

                    if (p.length > 1) {
                        options[p[0]] = p[1];
                    }
                });
            }

            return options;
        },

        /**
         * @private
         */
        defaultRoute: function (params, options) {
            let controller = params.controller || options.controller;
            let action = params.action || options.action;

            this.dispatch(controller, action, options);
        },

        /**
         * @private
         */
        record: function (controller, action, id, options) {
            options = this._parseOptionsParams(options);

            options.id = id;

            this.dispatch(controller, action, options);
        },

        /**
         * @private
         */
        view: function (controller, id, options) {
            this.record(controller, 'view', id, options);
        },

        /**
         * @private
         */
        edit: function (controller, id, options) {
            this.record(controller, 'edit', id, options);
        },

        /**
         * @private
         */
        create: function (controller, options) {
            this.record(controller, 'create', null, options);
        },

        /**
         * @private
         */
        action: function (controller, action, options) {
            this.dispatch(controller, action, this._parseOptionsParams(options));
        },

        /**
         * @private
         */
        defaultAction: function (controller) {
            this.dispatch(controller, null);
        },

        /**
         * @private
         */
        home: function () {
            this.dispatch('Home', null);
        },

        /**
         * Process `logout` route.
         */
        logout: function () {
            this.dispatch(null, 'logout');

            this.navigate('', {trigger: false});
        },

        /**
         * @private
         */
        clearCache: function () {
            this.dispatch(null, 'clearCache');
        },

        /**
         * Dispatch a controller action.
         *
         * @param {string} controller A controller.
         * @param {string} action An action.
         * @param {Object} options Options.
         * @returns {undefined}
         * @fires module:router#routed
         */
        dispatch: function (controller, action, options) {
            let o = {
                controller: controller,
                action: action,
                options: options,
            };

            this._last = o;

            this.trigger('routed', o);
        },

        /**
         * Get the last route data.
         *
         * @returns {Object}
         */
        getLast: function () {
            return this._last;
        },
    });

    return Router;
});

function isIOS9UIWebView() {
    let userAgent = window.navigator.userAgent;

    return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
}

// Override `backbone.history.loadUrl()` and `backbone.history.navigate()`
// to fix the navigation issue (`location.hash` not changed immediately) on iOS9.
if (isIOS9UIWebView()) {
    Backbone.history.loadUrl = function (fragment, oldHash) {
        fragment = this.fragment = this.getFragment(fragment);

        return _.any(this.handlers, function (handler) {
            if (handler.route.test(fragment)) {
                function runCallback() {
                    handler.callback(fragment);
                }

                function wait() {
                    if (oldHash === location.hash) {
                        window.setTimeout(wait, 50);
                    }
                    else {
                        runCallback();
                    }
                }

                wait();

                return true;
            }
        });
    };

    Backbone.history.navigate = function (fragment, options) {
        let pathStripper = /#.*$/;

        if (!Backbone.History.started) {
            return false;
        }

        if (!options || options === true) {
            options = {
                trigger: !!options
            };
        }

        let url = this.root + '#' + (fragment = this.getFragment(fragment || ''));

        fragment = fragment.replace(pathStripper, '');

        if (this.fragment === fragment) {
            return;
        }

        this.fragment = fragment;

        if (fragment === '' && url !== '/') {
            url = url.slice(0, -1);
        }

        let oldHash = location.hash;

        if (this._hasPushState) {
            this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
        }
        else if (this._wantsHashChange) {
            this._updateHash(this.location, fragment, options.replace);

            if (
                this.iframe &&
                (fragment !== this.getFragment(this.getHash(this.iframe)))
            ) {
                if (!options.replace) {
                    this.iframe.document.open().close();
                }

                this._updateHash(this.iframe.location, fragment, options.replace);
            }
        }
        else {
            return this.location.assign(url);
        }

        if (options.trigger) {
            return this.loadUrl(fragment, oldHash);
        }
    };
}
