var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

var IndexView = require('./views/index_view')
var UsersView = require('./views/users')
var UserView = require('./views/user')

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index'
  , 'users': 'users'
  , 'user/:username(/)': 'user'
  }
, index: function() {
    new IndexView({ el: '#content' })
  }
, users: function() {
    new UsersView()
  }
, user: function(username) {
    new UserView({ username: username })
  }
})
