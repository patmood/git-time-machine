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
   var _this = this
   this.collection.sha = null // This will be set to sha of current commit when fetching newer commits
   this.collection.sha = this.commit.get('sha')
   this.collection.until = this.commit.get('commit').committer.date
   // TODO: Prevent the same commit coming back over and over again
   this.collection.fetch({
     cache: true
   , remove: false
   , success: function(touched) {
       console.log('got older')
       _this.collection.until = null
       // TODO: Prevent page position from changing after re-rendering full template
       _this.render()
       _this.olderCommit()
     }
   })
  }
, fetchNewer: function() {
   var _this = this
   this.collection.sha = this.commit.get('sha')
   this.collection.since = this.commit.get('commit').committer.date
   // TODO: Prevent the same commit coming back over and over again
   this.collection.fetch({
     cache: true
   , remove: false
   , success: function(touched) {
       console.log('got older')
       _this.collection.since = null
       // TODO: Prevent page position from changing after re-rendering full template
       _this.render()
       _this.olderCommit()
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

