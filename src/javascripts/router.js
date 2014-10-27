// HELPERS
var parseQueryString = require('./helpers').parseQueryString
var auth = require('./lib/auth')

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
  , 'auth(/)(?*queryString)': 'auth'
  , 'signin(/)': 'signin'
  , 'signout(/)': 'signout'
  , 'users/:username(/)': 'user'
  , 'users(/)': 'users'
  , 'repos/:owner/:repo/commits(/)(:sha)(/)(?*queryString)': 'commits'
  }
, index: function() {
    new IndexView({ el: '#content' })
  }
, auth: function(queryString) {
    var params = parseQueryString(queryString)
      , _this = this

    if (params.code) {
      console.log('AUTH: getting token')
      auth.fetchToken(params.code, function(data) {
        console.log('router got token:', data)
        _this.navigate('/', { trigger: true })
      })
    } else {
      this.signin()
    }
  }
, signin: function() {
    var token = auth.getToken()
    if (token) {
      console.log('AUTH: token exists!')
      this.navigate('/', { trigger: true })
    } else {
      console.log('AUTH: no token, sign in')
      auth.authenticate()
    }
  }
, signout: function() {
    auth.destroy()
    this.navigate('/', { trigger: true })
  }
, users: function() {
    new UsersView()
  }
, user: function(username) {
    new UserView({ username: username })
  }
, commits: function(owner, repo, sha, queryString) {
    var params = parseQueryString(queryString)
    window.q = queryString
    var commits = new CommitsList([], {
      owner: owner
    , repo: repo
    , path: params.path
    , sha: sha
    })
    commits.fetch({
      cache: true
    // , headers: {'Authorization' :'token OAUTH-TOKEN'}
    , success: function(commits) {
        new CommitsView({ collection: commits })
      }
    })
  }
})
