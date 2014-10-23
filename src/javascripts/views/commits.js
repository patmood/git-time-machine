var CommitView = require('./commit')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, initialize: function(opts) {
    this.render()
  }
, events: {
    'click a': 'goToCommit'
  , 'click .navigate-commit': 'changeCommit'
  }
, changeCommit: function(e) {
    //TODO: handle case when model does not have a collection
    var direction = parseInt($(e.currentTarget).data('direction'))
      , nextCommit = this.model.models[this.commitIndex + direction]

    if (nextCommit != undefined) {
      this.renderCommit(nextCommit.get('sha'))
    } else {
      console.log('Next commit not found!')
      var _this = this
      this.model.until = this.commit.get('commit').committer.date
      this.model.fetch({
        cache: true
      , add: true
      , success: function() {
          console.log('got older')
          _this.model.until = null
          _this.render()
        }
      })
    }
  }
, goToCommit: function(e) {
    e.preventDefault()
    this.renderCommit(e.target.id)
  }
, render: function() {
    $(this.el).html(this.template(this.model))
    if (this.sha) renderCommit(this.sha)
  }
, renderCommit: function(sha) {
    this.commit = _.find(this.model.models, function(commit) {
      return commit.attributes.sha === sha
    })
    this.commitIndex = this.model.models.indexOf(this.commit)
    // TODO: if the specific commit is not in the collection, fetch it
    if (!this.commit) console.error('No commit found!')
    new CommitView({ model: this.commit, path: this.model.path })
  }
})

