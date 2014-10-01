var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

module.exports = Backbone.View.extend({

  template: require('./template')

, initialize: function() {
    underscoreTest = _.last([0,1,2, 'hi mom!'])
    this.render()
  }

, render: function() {

    var opts = {
      description: 'Starter Gulp + Browserify project equipped to handle the following:'
    , tools: [
        'Browserify-shim'
      , 'Browserify / Watchify'
      , 'BrowserSync'
      , 'CoffeeScript'
      , 'Compass'
      , 'SASS'
      , 'Handlebars'
      , 'Image optimization'
      , 'LiveReload'
      , 'Non common-js jquery plugin'
      , 'Npm backbone'
      , 'Npm jquery'
      , 'Underscore (included with Backbone)'
      ]
    }

    $(this.el).html(this.template(opts))

    plugin()
  }
})
