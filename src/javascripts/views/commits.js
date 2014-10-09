var CommitView = require('./commit')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, initialize: function(opts) {
    opts.sha ? this.renderCommit(opts.sha)
             : this.render()
  }
, events: {
    'click a': 'goToCommit'
  }
, goToCommit: function(e) {
    e.preventDefault()
    this.renderCommit(e.target.id)
  }
, render: function() {
    $(this.el).html(this.template(this.model))
  }
, renderCommit: function(sha) {
    var commit = _.find(this.model.models, function(commit) {
      return commit.attributes.sha === sha
    })
    // TODO: if the specific commit is not in the collection, fetch it
    if (!commit) console.error('No commit found!')
    new CommitView({ model: commit, path: this.model.path })
  }
})

