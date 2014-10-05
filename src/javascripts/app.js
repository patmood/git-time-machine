var _          = require('underscore')
  , Backbone   = require('backbone')

window.App = {}
Backbone.$ = require('jquery')

var Router = require('./router')

window.App.router = new Router()


Backbone.history.start()
