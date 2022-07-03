define('custom:views/fields/stage', ['views/fields/base'], function (Dep) {

    /**
     * JSDoc enabling code completion in PhpStorm/Webstorm.
     *
     * @class
     * @name Class
     * @extends modules:views/fields/base.Class
     * @memberOf modules:custom:views/fields/stage
     */
    return Dep.extend(/** @lends modules:custom:views/fields/stage.Class# */{

        detailTemplate: 'custom:fields/stage/detail',

        setup: function () {
            console.log(2);
        },

        afterRender: function () {

        },
    });
});
