var Commit = require('../models/commit')
var Content = require('../models/content')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commit')
, initialize: function(opts) {
    var _this = this
    if (this.model.get('files')) {
      console.log('files!')
      this.getContents()
    } else {
      console.log('no files')
      this.model.fetch({
        cache: true
      , success: function(commit) {
          _this.getContents()
        }
      })
    }
  }
, getContents: function() {
    if (this.model.collection.path) {
      // Get contents here
      // TODO: Use underscore findWhere method to get file
      var path = this.model.collection.path
        , _this = this
        , file = this.model.get('files').filter( function(x) { return x.filename === path })[0]
        , content = new Content(file)

      content.fetch({
        cache: true
      , success: function(content) {
          var contentString = atob(content.attributes.content)
          _this.render(contentString)
        }
      })
    } else {
      this.render()
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
, render: function(fileContents) {
    $(this.el).html(this.template({ commit: this.model, fileContents: fileContents}))
  }
})

