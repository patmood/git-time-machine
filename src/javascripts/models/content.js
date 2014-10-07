var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

module.exports = Backbone.Model.extend({
  url: function() {
    return this.get('contents_url')
  }
})


