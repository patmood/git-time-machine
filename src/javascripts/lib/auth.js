module.exports = {
  fetchToken: function(code, next) {
    var _this = this
    $.getJSON('http://localhost:9999/authenticate/' + code, function(json) {
      _this.setToken(json.token)
      next(json.token)
    })
  }
, setToken: function(token) {
    var d = new Date()
    window.token = token
    document.cookie='token=' + token + '; expires=' + d.setDate(d.getDate() + 1)
  }
, getToken: function () {
    if (!window.token) {
      c = document.cookie.split(';')
      cookies = {}


      c.forEach(function(cookie) {
        var C = cookie.split('=')
        if (C[0].trim() === 'token') {
          window.token = C[1]
        }
      })

      if (!window.token) {
        console.error('No token found')
        // debugger
        // return this.authenticate() // should this be automatic?
      }
    }

    return window.token
  }
, authenticate: function() {
    window.location.replace("https://github.com/login/oauth/authorize?client_id=3dbe9b15a57c1f2ae62d&scope=repo")
  }
, destroy: function() {
    window.token = null
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC"
  }
}
