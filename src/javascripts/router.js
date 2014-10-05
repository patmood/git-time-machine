var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

// MODELS
var Commit = require('./models/commit')

// VIEWS
var IndexView = require('./views/index_view')
var UserView = require('./views/user')
var UsersView = require('./views/users')
var CommitView = require('./views/commit')
var CommitsView = require('./views/commits')

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index'
  , 'users/:username(/)': 'user'
  , 'users(/)': 'users'
  , 'repos/:owner/:repo/commits/:sha(/)': 'commit'
  , 'repos/:owner/:repo/commits(/)': 'commits'
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
    var commit = new Commit({
      owner: owner
    , repo: repo
    , sha: sha
    })
    commit.fetch({
      success: function(commit) {
        new CommitView({ model: commit }).render()
      }
    })
  }
, commits: function(owner, repo, sha) {
    new CommitsView({
      owner: owner
    , repo: repo
    })
  }
})
