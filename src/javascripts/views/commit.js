var Commit = require('../models/commit')
var Content = require('../models/content')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commit')
, initialize: function(opts) {
    this.path = opts.path
    this.getFileList()
  }
, getFileList: function() {
    var _this = this
    if (this.model.get('files')) {
      console.log('files!')
      this.getContents()
    } else {
      console.log('no files')
      this.model.fetch({
        cache: true
      , success: function() {
          _this.getContents()
        }
      })
    }
  }
, getContents: function() {
    if (this.path) {
      // Get contents here
      var path = this.path
        , _this = this
        , file = _.findWhere(this.model.get('files'), { filename: path })
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
      this.getFileList()
    } else {
      console.error('Next commit not found!')
    }
  }
, render: function(fileContents) {
    window.App.router.navigate( this.model.get('url').match(/(repos.+)/gi)[0] + '/?path=' + this.path )
    $(this.el).html(this.template({ commit: this.model, fileContents: fileContents}))
  }
})

