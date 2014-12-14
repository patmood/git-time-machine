var url     = require('url'),
    http    = require('http'),
    https   = require('https'),
    fs      = require('fs'),
    qs      = require('querystring'),
    dotenv  = require('dotenv')

dotenv.load()

var express = require('express'),
    app     = express();

app.use(express.static(__dirname + '/build/'));

function authenticate(code, next) {
  var data = qs.stringify({
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    code: code
  });

  var reqOptions = {
    host: process.env.OAUTH_HOST,
    port: process.env.OAUTH_PORT,
    path: process.env.OAUTH_PATH,
    method: process.env.OAUTH_METHOD,
    headers: { 'content-length': data.length }
  };

  var body = "";
  var req = https.request(reqOptions, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) { body += chunk; });
    res.on('end', function() {
      next(null, qs.parse(body).access_token);
    });
  });

  req.write(data);
  req.end();
  req.on('error', function(e) { next(e.message); });
}


// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/authenticate/:code', function(req, res) {
  authenticate(req.params.code, function(err, token) {
    var result = err || !token ? {"error": "bad_code"} : { "token": token }
    res.json(result)
  });
});

app.get('/authenticate', function(req, res) {
  res.redirect('https://github.com/login/oauth/authorize?client_id='
              + process.env.OAUTH_CLIENT_ID
              + '&scope=repo')
})

// Serve static app
app.get('*', function(req, res) {
  res.sendfile(__dirname + '/build/index.html')
})


var port = process.env.PORT || 9999;

app.listen(port, null, function (err) {
  console.log('Gatekeeper, at your service: http://localhost:' + port);
});
