window.App = {}

var Router = require('./router')

window.App.router = new Router()


Backbone.history.start()
