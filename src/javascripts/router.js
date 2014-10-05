var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

// MODELS
var Commit = require('./models/commit')
var CommitsList = require('./models/commits_collection')

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
  , 'repos/:owner/:repo/commits(/)(:sha)(/)': 'commits'
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
, commits: function(owner, repo, sha) {
    var commits = new CommitsList([], {
      owner: owner
    , repo: repo
    })
    commits.fetch({
      success: function(commits) {
        new CommitsView({ model: commits, sha: sha })
      }
    })
  }
})
