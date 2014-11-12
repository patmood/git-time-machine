module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/not_found')
, render: function() {
    $(this.el).html(this.template())
  }
})
