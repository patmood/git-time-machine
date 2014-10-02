var _          = require('underscore')
  , Backbone   = require('backbone')
  , plugin     = require('plugin')
Backbone.$ = require('jquery')

var Router = require('./router')


var router = new Router()

console.log('app.js loaded!')

Backbone.history.start()
