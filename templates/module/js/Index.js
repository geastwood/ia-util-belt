/**
 * @class IA.{{moduleName}}.controller.Index
 * @extends Ext.app.Controller
 *
 */
Ext.define('IA.{{moduleName}}.controller.Index', {
    extend: 'Ext.app.Controller',

    requires: [],

    tr: {},

    refs: [],

    /**
     * Create our controller by setting the configuration parameters from our page.
     *
     * @param {Object} application the application configuration
     * @return void
     */
    init: function(application) {
        var me = this,
            params = application.config.params,
            idstring = params.idstring,
            idObject = IA.util.Idstring.buildIdObject(idstring);

        IA.Registry.register('application', 'idstring', me.params.idstring);
        IA.Registry.register('application', 'idObject', idObject);
        IA.Registry.register('application', 'clientId', idObject.clientId);

        this.control({});

        me.registerEvents();

        me.callParent(arguments);

        Ext.QuickTips.enable();

        Ext.QuickTips.init();
    },

    /**
     * is called automatically by the application, this function renders our view with components into the page.
     *
     * @param {Object} config the application config
     * @return void
     */
    onLaunch: function(config) {
        var me = this;

        /**
         * Create view with current configuration.
         * give tab config
         */
        me.view = Ext.create('IA.{{moduleName}}.view.Viewport', {});

    },

    /**
     * Registers our event handlers after the viewport is rendered (and dom elements exist)
     *
     * @return void
     */
    registerEvents: function() {

    }

});
