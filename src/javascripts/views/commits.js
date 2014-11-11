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
    'click #older-commit': 'olderCommit'
  , 'click #newer-commit': 'newerCommit'
  , 'click #reset-timeline': 'resetTimelineWindow'
  , 'click a': 'commitClick'
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
     success: function(touched) {
       console.log('got more! touched:', touched)
       _this.collection.since = null
       _this.collection.until = null
       // TODO: Prevent page position from changing after re-rendering full template
       _this.render()
       next()
     }
   })
  }
, commitClick: function(e) {
    e.preventDefault()
    this.goToCommit(e.target.id)
  }
, goToCommit: function(sha) {
    this.commit = this.collection.findWhere({sha: sha})
    this.renderCommit()
  }
, render: function() {
    $(this.el).html(this.template(this.collection))
    this.renderTimeline()
    this.renderCommit()
  }
, renderCommit: function() {
    if (!this.commit) console.error('No commit found!')
    new CommitView({ model: this.commit, path: this.collection.path })
    this.timeline.setSelection(this.commit.get('sha'))
  }

  //TODO: move this to a new view?
, renderTimeline: function() {
    var _this = this

    // Get date limits to restrict the timeline
    var min = this.collection.min(function(commit) {
      return commit.date()
    })
    var max = this.collection.max(function(commit) {
      return commit.date()
    })

    var container = document.getElementById('timeline')
      , data = new vis.DataSet()
      , options = {
          height: 220
        //TODO: set sane ranges that dont cut off the labels
        , max: new Date(max.date().setDate(min.date().getDate() + 2))
        , min: new Date(min.date().setDate(min.date().getDate() - 2))
        }

    this.collection.forEach(function(commit) {
      var msg = commit.get('commit').message
      if (msg.length >= 20) msg = msg.slice(0, 17) + '...'
      data.add({
        id: commit.get('sha')
      , content: msg
      , start: new Date(commit.get('commit').committer.date)
      })
    })

    this.timeline = new vis.Timeline(container, data, options)

    // add event listener
    this.timeline.on('select', function(properties) {
      this.focus(properties.items[0])
      _this.goToCommit(properties.items[0])
    })
  }
, resetTimelineWindow: function() {
    this.timeline.fit()
  }
})

