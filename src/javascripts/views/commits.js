var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

var CommitsList = require('../models/commits_collection')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, initialize: function(opts) {
    var _this = this
      , commits = new CommitsList([], opts)
    commits.fetch({
      success: function(commits) {
        _this.render(commits)
      }
    })
  }
, render: function(commits) {
    console.log(commits)

    $(this.el).html(this.template(commits))
  }
})

