var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

var Commit = require('../models/commit')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commit')
, initialize: function(opts) {
    var _this = this
    if (this.model.get('files')) {
      console.log('files!')
      this.render()
    } else {
      console.log('no files')
      this.model.fetch({
        success: function(commit) {
          _this.model = commit
          _this.render()
        }
      })
    }

  }
, events: {
    'click .navigate-commit': 'changeCommit'
  }
, changeCommit: function(e) {
    //TODO: handle case when model does not have a collection
    var direction = parseInt($(e.currentTarget).data('direction'))
    var modelIndex = this.model.collection.indexOf(this.model)
      , nextModel = this.model.collection.at(modelIndex + direction)

    if (nextModel != undefined) {
      this.model = nextModel
      this.initialize()
    } else {
      console.error('Next commit not found!')
    }
  }
, render: function() {
    $(this.el).html(this.template(this.model))
  }
})

