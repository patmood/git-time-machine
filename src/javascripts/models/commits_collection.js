var Commit = require('./commit')

module.exports = Backbone.Collection.extend({
  model: Commit
, initialize: function(models, opts) {
    this.owner = opts.owner
    this.repo = opts.repo
    this.path = opts.path
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
    , '&sha='
    , (this.sha || '')
    ].join('')

    return url
  }
})
