var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commit')
, events: {
    'click #prev-commit': 'prevCommit'
  , 'click #next-commit': 'nextCommit'
  }
, prevCommit: function() {
    console.log('go to previous')
  }
, nextCommit: function() {
    console.log('go to next')
  }
, render: function() {
    $(this.el).html(this.template(this.model))
  }
})

