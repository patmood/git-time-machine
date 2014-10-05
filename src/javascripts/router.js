var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

var IndexView = require('./views/index_view')
var UserView = require('./views/user')
var UsersView = require('./views/users')
var CommitView = require('./views/commit')

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index'
  , 'users/:username': 'user'
  , 'users': 'users'
  , 'repos/:owner/:repo/commits/:sha': 'commit'
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
, commit: function(owner, repo, sha) {
    // Surely this can be refactored
    new CommitView({
      owner: owner
    , repo: repo
    , sha: sha
    })
  }
})
