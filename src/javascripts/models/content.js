var auth = require('../lib/auth')

module.exports = Backbone.Model.extend({
  url: function() {
    return this.get('contents_url')
  }
, fetch: function(options) {
    var defaults = {
      remove: false
    , add: true
    , cache: true
    }

    if (token = auth.getToken()) {
      defaults.headers = {'Authorization' :'token ' + token }
    }

    _.extend(options, defaults)
    return Backbone.Collection.prototype.fetch.call(this, options)
  }
})


