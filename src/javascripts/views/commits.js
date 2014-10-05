var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, events: {
    'click a': 'goToCommit'
  }
, goToCommit: function(e) {
    e.preventDefault()
    var clickedCommit = _.find(this.model.models, function(commit) {
      return commit.attributes.sha === e.target.id
    })
    window.App.router.navigate(clickedCommit.get('url').match(/(repos.+)/gi)[0] , { trigger: true })
  }
, render: function() {
    $(this.el).html(this.template(this.model))
  }
})

