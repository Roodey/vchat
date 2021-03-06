import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ['container-fluid'],
    registerAs: null,
    joinAddress: '',
    joinPort: '',
    actions: {
        connect: function() {
            return this.sendAction('connect');
        },
        choose: function(){
            return this.sendAction('choose');
        }
    },
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    processChildElements: function (){
        this._register();
        run.later(() => {
            if(!this.isDestroyed && !this.isDestroying)
            {
                this.$().find('input').first().focus();
            }
        }, 10);
    },
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }
});