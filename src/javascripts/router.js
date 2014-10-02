var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

var IndexView = require('./views/index_view')

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index'
  }
, index: function() {
    new IndexView({ el: '#content' })
  }
})
