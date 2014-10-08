module.exports = Backbone.Model.extend({
  url: function() {
    return 'https://api.github.com/users/' + this.get('username')
  }
})

