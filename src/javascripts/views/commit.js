var Commit = require('../models/commit')
  , Content = require('../models/content')

module.exports = Backbone.View.extend({
  el: '#commit'
, template: require('../templates/commit')
, initialize: function(opts) {
    this.path = opts.path
    this.getFileList()
  }
, getFileList: function() {
    var _this = this
    if (this.model.get('files')) {
      this.getContents()
    } else {
      this.model.fetch({
        success: function() {
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
        success: function(content) {
          var contentString = atob(content.attributes.content)
          _this.render(contentString)
        }
      })
    } else {
      this.render()
    }
  }
, render: function(fileContents) {
    window.App.router.navigate(this.permalink())
    $(this.el).html(this.template({ commit: this.model, fileContents: fileContents}))
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block)
    })

    //Set a good height
    var idealHeight = $(window).height() - $('#commit').offset().top
    $(this.el).css('height', idealHeight)

    this.addLineNumbers()
    this.highlightDiff()
  }
, addLineNumbers: function() {
    $('pre code').each(function(){
        var lines = $(this).text().split('\n').length - 1
        var $numbering = $('<ul/>').addClass('pre-numbering')
        $(this)
          .addClass('has-numbering')
          .parent()
          .append($numbering)
        for(i = 1; i <= lines; i++ ){
          $numbering.append($('<li/>').text(i))
        }
    })
  }
, highlightDiff: function() {
    var file = _.findWhere(this.model.get('files'), { filename: this.path })
      , regex = /\+(\d+,\d+)\s@@/g
      , match

    console.log(file.patch)

    while (match = regex.exec(file.patch)) {
      var lines = match[1].split(',')
        , startLine = parseInt(lines[0])
        , endLine = startLine + parseInt(lines[1]) + 1
      console.log(lines)
      $('pre ul').children().slice(startLine, endLine).css({'background-color':'green'})
    }
  }
, permalink: function() {
    var html_path = this.model.get('html_url').match(/github.com(.+)$/)[1]
    return html_path.replace('commit', 'blob') + '/' + this.path
  }
})

