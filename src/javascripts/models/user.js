var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.Model.extend({
  sync: function(method, model, options) {
    return $.getJSON(this.url(), options.success)
  }
, url: function() {
    return 'https://api.github.com/users/' + this.username
  }
})

