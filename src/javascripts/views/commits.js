var CommitView = require('./commit')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, initialize: function(opts) {
    this.commit = this.collection.at(0)
    this.render()
  }
, events: {
    'click a': 'goToCommit'
  , 'click #older-commit': 'olderCommit'
  , 'click #newer-commit': 'newerCommit'
  }
, olderCommit: function() {
    this.commit = this.commit.nxt()
    this.renderCommit()

//     console.log('Next commit not found!')
//     var _this = this
//
//     this.collection.until = this.commit.get('commit').committer.date
//     this.collection.fetch({
//       cache: true
//     , add: true
//     , success: function() {
//         console.log('got older')
//         _this.model.until = null
//         // Re-render full template since collection changed
//         _this.render()
//       }
//     })
  }
, newerCommit: function() {
    this.commit = this.commit.prev()
    this.renderCommit()
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

