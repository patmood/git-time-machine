var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/users')
, initialize: function() {
    this.render()
  }
, render: function() {
    var opts = {}
    $(this.el).html(this.template)
  }

})
