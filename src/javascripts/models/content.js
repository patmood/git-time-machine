module.exports = Backbone.Model.extend({
  url: function() {
    return this.get('contents_url')
  }
})


