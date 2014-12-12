/**
 * @class IA.{{moduleName}}.view.Viewport
 * @extends IA.application.view.Viewport
 */
Ext.define('IA.{{moduleName}}.view.Viewport', {
    extend: 'IA.application.view.Viewport',

    alias: 'widget.IA_{{moduleName}}_viewport',

    requires: [],

    tr: {
        Viewport_Header: "{{moduleName}} Headline",
        Viewport_Sub_Header: "{{moduleName}} Subheader"
    },

    /**
     * Initializes the billing viewport.
     *
     * @return void
     */
    initComponent: function() {
        var me = this;

        me.items = me.buildComponents();

        // Superclass call
        me.callParent(arguments);

        me.title = me.tr.Viewport_Header;
        me.subtitle = me.tr.Viewport_Sub_Header;

    },

    /**
     * Build the components of the viewport
     *
     * @return {Array} items
     */
    buildComponents: function() {
        var me = this,
            items;

        items = [];

        return items;
    }
});
