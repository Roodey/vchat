import Ember from "ember";
export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['snapshot-button', 'pointer'],
    actions:{
        snapshot: function(){
            this.sendAction('snapshot');
        }
    },
    didInsertElement : function () {
        Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        var tooltip = this.$().find('.tooltip').first();
        tooltip.hide();
        this.$().hover(function(){
            tooltip.stop().show();
        }, function(){
            tooltip.stop().hide();
        });
    },
    hide: function(){
        this.$().stop().fadeOut('fast');
    },
    show: function(){
        this.$().stop().fadeIn('fast');
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }.on('init')
});