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
    var modelIndex = this.model.collection.indexOf(this.model)
      , nextModel = this.model.collection.at(modelIndex + 1)

    if (nextModel != undefined) {
      this.model = nextModel
      this.render()
    } else {
      console.error('Next commit not found!')
    }
  }
, render: function() {
    $(this.el).html(this.template(this.model))
  }
})

