import Ember from "ember";
const { Component, run } = Ember;

export default Component.extend({
    tagName: 'div',
    classNames: ["gridster", "width100", "terminal-grid"],
    registerAs: null,
    gridster: null,
    disable: false,
    src: [],
    actions: {
        close: function(el){
            this.sendAction('close', el);
        },
        snapshot: function(blob){
            this.sendAction('snapshot', blob);
        }
    },
    didInsertElement : function () {
        run.scheduleOnce('afterRender', this, 'processChildElements');
    },
    willDestroyElement: function(){
        if(this.get('gridster') !== null)
        {
            this.get('gridster').destroy(false);
            this.set('gridster', null);
        }
        this.set('disable', true);
    },
    processChildElements: function (){
        this._register();
        if(!this.get('disable'))
        {
            if(this.get('gridster') !== null)
            {
                this.get('gridster').destroy(false);
                this.set('gridster', null);
            }
            this.set(
                'gridster', 
                this.$('ul').gridster({
                  widget_base_dimensions: [40, 30],
                  widget_margins: [4, 3],
                  autogrow_cols: true,
                  maintain_aspect_ratio: true,
                  resize: {
                    enabled: true
                  }
                }).data('gridster')
            );
        }
    },
    watcher: function(){
        run.scheduleOnce('afterRender', this, 'processChildElements');
    }.observes('src.@each'),
    _register: function() {
        this.set('registerAs', this); // register-as is a new property
    }
});