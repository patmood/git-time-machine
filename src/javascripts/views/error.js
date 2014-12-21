var auth = require('../lib/auth')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/error')
, events: {
    'click .signin': 'authenticate'
  }
, authenticate: function() {
    auth.authenticate()
  }
, render: function(status) {
    $(this.el).html(this.template({
      rateLimit: status === 403
    }))
  }
})
