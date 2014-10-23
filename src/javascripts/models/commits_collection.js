var Commit = require('./commit')

module.exports = Backbone.Collection.extend({
  initialize: function(models, opts) {
    // TODO: Set these things as attributes on the collection
    this.path = opts.path
    this.sha = opts.sha
    this.owner = opts.owner
    this.repo = opts.repo
  }
, model: Commit
, comparator: function(model) {
    return Date.parse(model.get('commiter.date'))
  }
, url: function() {
    var url = [[
        'https://api.github.com/repos'
      , this.owner
      , this.repo
      , 'commits'
      ].join('/')
    , '?path='
    , (this.path || '')
    , '&until='
    , (this.until || '')
    , '&since='
    , (this.since || '')
    , '&sha='
    , (this.sha || '')
    ].join('')

    return url
  }
})
