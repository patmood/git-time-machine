var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

var Commit = require('./commit')

module.exports = Backbone.Collection.extend({
  model: Commit
, initialize: function(models, opts) {
    this.owner = opts.owner
    this.repo = opts.repo
}
, sync: function(method, model, options) {
    return $.getJSON(this.url(), options.success)
  }
, url: function() {
    return [
      'https://api.github.com/repos'
    , this.owner
    , this.repo
    , 'commits'
    ].join('/')
  }
})
