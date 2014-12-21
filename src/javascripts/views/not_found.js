var auth = require('../lib/auth')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/not_found')
, events: {
    'click .signin': 'authenticate'
  }
, authenticate: function() {
    auth.authenticate()
  }
, render: function() {
    $(this.el).html(this.template())
  }
})
