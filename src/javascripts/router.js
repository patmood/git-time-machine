// HELPERS
var parseQueryString = require('./helpers').parseQueryString

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
  , 'repos/:owner/:repo/commits(/)(:sha)(/)(?*queryString)': 'commits'
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
, commits: function(owner, repo, sha, queryString) {
    params = parseQueryString(queryString)
    window.q = queryString
    var commits = new CommitsList([], {
      owner: owner
    , repo: repo
    , path: params.path
    , sha: sha
    })
    commits.fetch({
      cache: true
    , success: function(commits) {
        new CommitsView({ model: commits, sha: sha, path: params.path })
      }
    })
  }
})
