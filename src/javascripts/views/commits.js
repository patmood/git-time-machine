var CommitView = require('./commit')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, initialize: function(opts) {
    // TODO: set the initial commit to the url sha if it exists, then make the sha null
    this.commit = this.collection.at(0)
    this.render()
  }
, events: {
    'click a': 'goToCommit'
  , 'click #older-commit': 'olderCommit'
  , 'click #newer-commit': 'newerCommit'
  }
, olderCommit: function() {
    if (this.commit === this.commit.nxt()) {
      this.fetchOlder()
    } else {
      this.commit = this.commit.nxt()
      this.renderCommit()
    }
  }
, newerCommit: function() {
    if (this.commit === this.commit.prev()) {
      this.fetchNewer()
    } else {
      this.commit = this.commit.prev()
      this.renderCommit()
    }
  }
, fetchOlder: function() {
   this.collection.sha = this.collection.branch
   this.collection.until = this.commit.get('commit').committer.date
   this.fetchMore(this.olderCommit)
  }
, fetchNewer: function() {
   this.collection.sha = this.commit.get('branch')
   this.collection.since = this.commit.get('commit').committer.date
   this.fetchMore(this.newerCommit)
  }
, fetchMore: function(next) {
   // TODO: Prevent the same commit coming back over and over again
   var _this = this
   this.collection.fetch({
     remove: false
   , add: true
   , cache: true
   // , headers: {'Authorization' :'token OAUTH-TOKEN'}
   , success: function(touched) {
       console.log('got more! touched:', touched)
       _this.collection.since = null
       _this.collection.until = null
       // TODO: Prevent page position from changing after re-rendering full template
       _this.render()
       next()
     }
   })
  }
, goToCommit: function(e) {
    e.preventDefault()
    this.commit = this.collection.findWhere({sha: e.target.id})
    this.renderCommit()
  }
, render: function() {
    $(this.el).html(this.template(this.collection))
    this.renderCommit()
  }
, renderCommit: function() {
    if (!this.commit) console.error('No commit found!')
    new CommitView({ model: this.commit, path: this.collection.path })
  }
})

