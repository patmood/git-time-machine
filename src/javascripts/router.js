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
  , ':owner/:repo/contents/:sha/*path': 'content' // Need away to capture url to end of line as the path has / characters in it
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
    })
    commits.fetch({
      cache: true
    , success: function(commits) {
        new CommitsView({ model: commits, sha: sha, path: params.path })
      }
    })
  }
, content: function(owner, repo, sha, path) {
    // Get the individual commit and contents and render view
    var commit = new Commit({
      owner: owner
    , repo: repo
    , sha: sha
    })

    commit.fetch({
      cache: true
    , success: function(commit) {
      new CommitView({ model: commit, path: path })
    }
    })
  }
})
