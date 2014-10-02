var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.View.extend({
  template: require('../template')
, initialize: function() {
    this.render()
  }
, render: function() {
    var opts = { description: 'webpoop', tools: ['hammer', 'spanner'] }
    $(this.el).html(this.template(opts))
  }

})
