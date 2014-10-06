var _          = require('underscore')
  , Backbone   = require('backbone')
Backbone.$ = require('jquery')

var Commit = require('./commit')

module.exports = Backbone.Collection.extend({
  model: Commit
, initialize: function(models, opts) {
    this.owner = opts.owner
    this.repo = opts.repo
    this.path = opts.path
  }
, url: function() {
    var url = [
      'https://api.github.com/repos'
    , this.owner
    , this.repo
    , 'commits'
    ].join('/')

    return this.path ? url + '?path=' + this.path
                     : url
  }
})
