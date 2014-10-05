var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commit')
, events: {
    'click .navigate-commit': 'changeCommit'
  }
, prevCommit: function() {
    console.log('go to previous')
  }
, changeCommit: function(e) {
    var direction = parseInt($(e.currentTarget).data('direction'))
    var modelIndex = this.model.collection.indexOf(this.model)
      , nextModel = this.model.collection.at(modelIndex + direction)

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

