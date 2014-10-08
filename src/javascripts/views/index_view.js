module.exports = Backbone.View.extend({
  template: require('../templates/index')
, initialize: function() {
    this.render()
  }
, render: function() {
    $(this.el).html(this.template())
  }

})
