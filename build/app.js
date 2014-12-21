(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/javascripts/app.js":[function(require,module,exports){
window.App = {}
window.cookies = {}

var Router = require('./router')
window.readCookie = require('./helpers').readCookie

window.App.router = new Router()

Backbone.history.start({ pushState: true })


},{"./helpers":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/helpers.js","./router":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/router.js"}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars.runtime.js":[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/base.js","./handlebars/exception":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/exception.js","./handlebars/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/runtime.js","./handlebars/safe-string":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/safe-string.js","./handlebars/utils":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/base.js":[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.3.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Exception("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { 
              data.key = key; 
              data.index = i;
              data.first = (i === 0);
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/exception.js":[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/runtime.js":[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
    var result = env.VM.invokePartial.apply(this, arguments);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: env.VM.programWithDepth,
    noop: env.VM.noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      env.VM.checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/base.js","./exception":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/safe-string.js":[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/utils.js":[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(Object.prototype.hasOwnProperty.call(value, key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars/safe-string.js"}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/runtime.js":[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/dist/cjs/handlebars.runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js":[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/handlebars/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/helpers.js":[function(require,module,exports){
module.exports = {
  parseQueryString: function(queryString){
    var params = {}
    if(queryString){
      _.each(
        _.map(decodeURI(queryString).split(/&/g),function(el,i){
          var aux = el.split('='), o = {}
          if(aux.length >= 1){
            var val = undefined
            if(aux.length == 2)
              val = aux[1]
            o[aux[0]] = val
          }
          return o
      }),
        function(o){
          _.extend(params,o)
        }
      );
    }
    return params;
  }
, readCookie: function (name) {
    if (window.cookies[name]) return window.cookies[name];

    c = document.cookie.split(';')
    cookies = {}


    c.forEach(function(cookie) {
      var C = cookie.split('=')
      window.cookies[C[0].trim()] = C[1]
    })

    return window.cookies[name]
  }
}

},{}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js":[function(require,module,exports){
module.exports = {
  fetchToken: function(code, next) {
    var _this = this
    $.getJSON('/authenticate/' + code, function(json) {
      _this.setToken(json.token)
      next()
    })
  }
, setToken: function(token) {
    var d = new Date()
    window.cookies.token = token
    // Set 1 day expiry?
    document.cookie = 'token=' + token + '; expires=' + d.setDate(d.getDate() + 1) + '; path=/'
  }
, getToken: function () {
    return window.readCookie('token')
  }
, authenticate: function() {
    var d = new Date()
      , reg = new RegExp('^.+' + window.location.host)
      , urlPath = encodeURIComponent(window.location.toString().replace(reg, ''))

    document.cookie = 'lastUrl=' + urlPath + '; path=/'
    window.location.replace('/authenticate')
  }
, destroy: function() {
    window.cookies = {}
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; lastUrl=; expires=Thu, 01 Jan 1970 00:00:00 UTC"
  }
, checkUser: function() {
    return !!window.readCookie('token') || this.authenticate()
  }
}

},{}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commit.js":[function(require,module,exports){
var auth = require('../lib/auth')

module.exports = Backbone.Model.extend({
  initialize: function() {
    var sha = this.get('sha')
    this.set('id', sha)
  }
, url: function() {
    var url = this.get('url')
    return url ? url
               : 'https://api.github.com/repos/'
                  + this.get('owner')
                  + '/'
                  + this.get('repo')
                  + '/commits/'
                  + this.get('sha')
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
, index: function() {
    return this.collection.indexOf(this)
  }
, nxt: function() {
    return this.collection.at(this.index() + 1) || this
  }
, prev: function() {
    return this.collection.at(this.index() - 1) || this
  }
, date: function() {
    return new Date(this.get('commit').committer.date)
  }
,
})



},{"../lib/auth":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commits_collection.js":[function(require,module,exports){
var auth = require('../lib/auth')
var Commit = require('./commit')

module.exports = Backbone.Collection.extend({
  initialize: function(models, opts) {
    // TODO: Set these things as attributes on the collection
    this.path = opts.path
    this.sha = opts.sha
    this.owner = opts.owner
    this.repo = opts.repo
  }
, model: Commit
, comparator: function(a, b) {
    var dateA = (a.get('commit').committer.date)
      , dateB = (b.get('commit').committer.date)
    return dateA < dateB ? 1
         : dateA > dateB ? -1
         : 0
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
, url: function() {
    var url = [[
        'https://api.github.com/repos'
      , this.owner
      , this.repo
      , 'commits'
      ].join('/')
    , '?path='
    , (this.path || '')
    , '&sha='
    , (this.sha || '')
    ].join('')

    if (this.until) {
      url = url + '&until=' + this.until
    } else if (this.since) {
      url = url + '&since=' + this.since
    }

    return url
  }
, removeDups: function() {
    // HAAAACK
    var o = {}, dups = []
    this.each(function(c) {
      if (o[c.get('sha')]) dups.push(c)
      o[c.get('sha')] = c
    })
    console.log('dups:', dups)
    this.remove(dups)
  }
})

},{"../lib/auth":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js","./commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commit.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/content.js":[function(require,module,exports){
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



},{"../lib/auth":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/user.js":[function(require,module,exports){
module.exports = Backbone.Model.extend({
  url: function() {
    return 'https://api.github.com/users/' + this.get('username')
  }
})


},{}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/router.js":[function(require,module,exports){
// HELPERS
var parseQueryString = require('./helpers').parseQueryString
  , auth = require('./lib/auth')

// MODELS
var Commit = require('./models/commit')
  , CommitsList = require('./models/commits_collection')

// VIEWS
var IndexView = require('./views/index_view')
  , UserView = require('./views/user')
  , UsersView = require('./views/users')
  , CommitView = require('./views/commit')
  , CommitsView = require('./views/commits')
  , NotFoundView = require('./views/not_found')

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index'
  , 'auth(/)(?*queryString)': 'auth'
  , 'signin(/)': 'signin'
  , 'signout(/)': 'signout'
  , 'users/:username(/)': 'user'
  , 'users(/)': 'users'
  , ':owner/:repo/blob/:sha/*path': 'commits'
  , '*path': 'notFound'
  }
, index: function() {
    new IndexView({ el: '#content' })
  }
, auth: function(queryString) {
    var params = parseQueryString(queryString)
      , _this = this
      , dest = decodeURIComponent(window.readCookie('lastUrl')) || '/'

    if (params.code) {
      console.log('AUTH: getting token')
      auth.fetchToken(params.code, function() {
        console.log('Redirecting to:', dest)
        _this.navigate(dest, { trigger: true })
      })
    } else {
      console.error('No code parameter provided')
      // this.signin()
    }
  }
, signin: function() {
    var token = auth.getToken()
    if (token) {
      console.log('AUTH: token exists!')
      this.navigate('/', { trigger: true })
    } else {
      console.log('AUTH: no token, sign in')
      auth.authenticate()
    }
  }
, signout: function() {
    auth.destroy()
    this.navigate('/', { trigger: true })
  }
, users: function() {
    new UsersView()
  }
, user: function(username) {
    new UserView({ username: username })
  }
, commits: function(owner, repo, sha, path) {
    if (!path) return console.error('no path detected!');
    console.log('getting commits')
    var commits = new CommitsList([], {
      owner: owner
    , repo: repo
    , path: path
    , sha: sha
    })
    commits.fetch({
      success: function(commits) {
        new CommitsView({ collection: commits })
      }
    , error: function(err) {
        console.log(err)
        new NotFoundView().render()
      }
    })
  }
, notFound: function() {
    new NotFoundView().render()
  }
})

},{"./helpers":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/helpers.js","./lib/auth":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js","./models/commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commit.js","./models/commits_collection":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commits_collection.js","./views/commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commit.js","./views/commits":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commits.js","./views/index_view":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/index_view.js","./views/not_found":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/not_found.js","./views/user":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/user.js","./views/users":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/users.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/commit.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <pre class=\"pre\"><code class=\"code\">";
  if (helper = helpers.fileContents) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.fileContents); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</code></pre>\n    ";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n      Please select a file\n    ";
  }

  buffer += "<div class=\"commit\">\n  <div class=\"info\">\n    <div class=\"author\">\n      <img src="
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.committer)),stack1 == null || stack1 === false ? stack1 : stack1.avatar_url)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " class=\"avatar\"><br>\n      @"
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.author)),stack1 == null || stack1 === false ? stack1 : stack1.login)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n    <div class=\"details\">\n      <strong>Message:</strong> "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.commit)),stack1 == null || stack1 === false ? stack1 : stack1.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "<br>\n      <strong>Date:</strong> ";
  if (helper = helpers.prettyDate) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.prettyDate); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "<br>\n      <a href="
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.file)),stack1 == null || stack1 === false ? stack1 : stack1.blob_url)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ">View on Github</a>\n    </div>\n  </div>\n  <div class=\"file-contents\">\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fileContents), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/commits.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"commits\">\n  <div id=\"timeline-container\" class=\"timeline-container\">\n    Click, drag, and scroll timeline to navigate timeline <a href=\"#\" id=\"reset-timeline\">(Reset view)</a>\n    <div id=\"timeline\"></div>\n  </div>\n  <div class=\"commit-nav\">\n    <button id=\"older-commit\" class=\"btn\">Older</button>\n    <button id=\"newer-commit\" class=\"btn\">Newer</button>\n    <button class=\"btn toggle-button\">Hide Timeline</button>\n    <button class=\"btn toggle-button\" hidden>Show Timeline</button>\n  </div>\n</div>\n<div id=\"commit\"></div>\n";
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/index.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "";


  buffer += "<div class=\"landing-page content-area\">\n  \n  <a href=\"https://github.com/you\"><img style=\"position: absolute; top: 0; right: 0; border: 0;\" src=\"https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67\" alt=\"Fork me on GitHub\" data-canonical-src=\"https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png\"></a>\n\n  <h1>Git Time Machine</h1>\n  <p>Time machine for your files on github! An easier way to view the history of a single file.</p>\n  <p>Useful for remembering how that constantly evolving method used to work or finding that line you deleted weeks ago but did end up needing afterall.</p>\n  <p>\n    <a href=\"/patmood/hugegif/blob/a56c23c7f9524f6b7f71ae316cf1c43178266bc2/js/main.js\" class=\"btn\">\n      Try it!\n    </a><br>\n    <a href=\"/patmood/wobble-wockets/blob/9f6c0b07dcd0dfae3bb4af1ea3214f9570f085bc/game/states/play.js\" class=\"btn\">\n      Private Repo test\n    </a><br>\n    (No browser extension required)\n  </p>\n\n  <h2>Step 1 - Install the Chrome extension</h2>\n  <p>Other browsers coming soon!</p>\n  <p>\n    <a href=\"https://chrome.google.com/webstore/detail/git-time-machine/cbkeilfjfgflmjhohjkcecfbfbimpmkp\" target=\"_blank\"><img src=\"images/browser_chrome.png\"></a>\n    \n  </p>\n\n  <h2>Step 2 - Find a file on github</h2>\n  <p>The browser extension adds a new button to the file view on github</p>\n  <p><img class=\"screenshot\" src=\"images/github_button.png\"></p>\n\n  <h2>Step 3 - Travel through time!</h2>\n  <p>Watch lines of code change with each commit!</p>\n  <p><img class=\"screenshot\" src=\"images/time_machine_example.png\"></p>\n\n  <p>Created by <a href=\"http://patmoody.com\">@patmood</a></p>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/not_found.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"content-area\">\n  <h2>Not Found</h2>\n  <p>We couldn't find the content you were looking for. This could be because the repository is private. Please sign in and authorize the time machine app to view your private repos.</p>\n  <p>\n    <button class=\"signin btn\">Sign In</button>\n  </p>\n  <p>If you think this is a problem with the site, please <a href=\"https://github.com/patmood/git-time-machine/issues\" target=\"_blank\">create an issue</a> detailing how to replicate the issue.</p>\n\n  <p>Thanks!</p>\n</div>\n";
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/user.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<p>User ID: ";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p>\n";
  return buffer;
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/users.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h1>Hello Joe</h2>\n";
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commit.js":[function(require,module,exports){
var Commit = require('../models/commit')
var Content = require('../models/content')

module.exports = Backbone.View.extend({
  el: '#commit'
, template: require('../templates/commit')
, initialize: function(opts) {
    this.path = opts.path
    this.getFileList()
  }
, getFileList: function() {
    var _this = this
    if (this.model.get('files')) {
      this.getContents()
    } else {
      this.model.fetch({
        success: function() {
          _this.getContents()
        }
      })
    }
  }
, getContents: function() {
    if (this.path) {
      // Get contents here
      var path = this.path
        , _this = this
        , file = _.findWhere(this.model.get('files'), { filename: path })
        , content = new Content(file)

      this.file = file

      content.fetch({
        success: function(content) {
          var contentString = atob(content.attributes.content)
          _this.render(contentString)
        }
      })
    } else {
      this.render()
    }
  }
, render: function(fileContents) {
    console.log(this.file)
    window.App.router.navigate(this.permalink())
    $(this.el).html(this.template({
      commit: this.model
    , file: this.file
    , fileContents: fileContents
    , prettyDate: moment(this.model.get('commit').author.date).format('MMMM Do YYYY, h:mm a')
    }))
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block)
    })

    this.addLineNumbers()
  }
, addLineNumbers: function() {
    $('pre code').each(function(){
        var lines = $(this).text().split('\n').length - 1
        var $numbering = $('<ul/>').addClass('pre-numbering')
        $(this)
          .addClass('has-numbering')
          .parent()
          .append($numbering)
        for(i = 1; i <= lines; i++ ){
          $numbering.append($('<li/>').text(i))
        }
    })
  }
, permalink: function() {
    var html_path = this.model.get('html_url').match(/github.com(.+)$/)[1]
    return html_path.replace('commit', 'blob') + '/' + this.path
  }
})


},{"../models/commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commit.js","../models/content":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/content.js","../templates/commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/commit.hbs"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commits.js":[function(require,module,exports){
var CommitView = require('./commit')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/commits')
, initialize: function(opts) {
    // TODO: set the initial commit to the url sha if it exists, then make the sha null
    this.commit = this.collection.at(0)
    this.render()
    this.newestCommit = null
    this.oldestCommit = null
  }
, events: {
    'click #older-commit': 'olderCommit'
  , 'click #newer-commit': 'newerCommit'
  , 'click #reset-timeline': 'resetTimelineWindow'
  , 'click .toggle-button': 'toggleTimeline'
  }
, olderCommit: function() {
    var nextComm = this.commit.nxt()
    if (this.commit === this.commit.nxt() && nextComm != this.oldestCommit) {
      this.fetchOlder()
      this.oldestCommit = this.commit
    } else {
      this.commit = this.commit.nxt()
      this.renderCommit()
    }
  }
, newerCommit: function() {
    var prevComm = this.commit.prev()
    if (this.commit === prevComm && prevComm != this.newestCommit) {
      this.fetchNewer()
      this.newestCommit = this.commit
    } else {
      this.commit = prevComm
      this.renderCommit()
    }
  }
, fetchOlder: function() {
    this.collection.sha = this.commit.get('sha')
    this.collection.until = this.commit.get('commit').committer.date
    this.fetchMore(this.olderCommit.bind(this))
  }
, fetchNewer: function() {
    this.collection.sha = this.commit.get('sha')
    this.collection.since = this.commit.get('commit').committer.date
    this.fetchMore(this.newerCommit.bind(this))
  }
, fetchMore: function(next) {
    // TODO: Prevent the same commit coming back over and over again
    console.log('fetching more commits')
    var _this = this
    this.collection.fetch({
      success: function(touched) {
        _this.collection.since = null
        _this.collection.until = null

        // TODO: Prevent page position from changing after re-rendering full template
        _this.render()
        next()
      }
    })
  }
, goToCommit: function(sha) {
    this.commit = this.collection.findWhere({sha: sha})
    this.renderCommit()
  }
, render: function() {
    $(this.el).html(this.template(this.collection))
    this.collection.removeDups()
    this.renderTimeline()
    this.renderCommit()
  }
, renderCommit: function() {
    if (!this.commit) console.error('No commit found!')
    new CommitView({ model: this.commit, path: this.collection.path })
    this.timeline.setSelection(this.commit.get('sha'))
    this.resetCommitHeight()
  }

  //TODO: move this to a new view?
, renderTimeline: function() {
    var _this = this

    // Get date limits to restrict the timeline
    var min = this.collection.min(function(commit) {
      return commit.date()
    })
    var max = this.collection.max(function(commit) {
      return commit.date()
    })

    var container = document.getElementById('timeline')
      , data = new vis.DataSet()
      , options = {
          height: 220
        //TODO: set sane ranges that dont cut off the labels
        // , max: new Date(max.date().setDate(min.date().getDate() + 2))
        // , min: new Date(min.date().setDate(min.date().getDate() - 2))
        }

    this.collection.forEach(function(commit) {
      var msg = commit.get('commit').message
      if (msg.length >= 20) msg = msg.slice(0, 17) + '...'
      data.add({
        id: commit.get('sha')
      , content: msg
      , start: new Date(commit.get('commit').committer.date)
      })
    })

    this.timeline = new vis.Timeline(container, data, options)

    // add event listener
    this.timeline.on('select', function(properties) {
      this.focus(properties.items[0])
      _this.goToCommit(properties.items[0])
    })
  }
, resetTimelineWindow: function() {
    this.timeline.fit()
  }
, toggleTimeline: function() {
    $('#timeline-container').toggleClass('hide-animate')
    $('.vis.timeline').toggleClass('fade-animate')
    $('.toggle-button').toggle()
    setTimeout(this.resetCommitHeight, 300)
  }

, resetCommitHeight: function() {
    var idealHeight = $(window).height() - $('#commit').offset().top - 10
    $('#commit').css('height', idealHeight)
  }
})


},{"../templates/commits":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/commits.hbs","./commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commit.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/index_view.js":[function(require,module,exports){
module.exports = Backbone.View.extend({
  template: require('../templates/index')
, initialize: function() {
    this.render()
  }
, render: function() {
    $(this.el).html(this.template())
  }

})

},{"../templates/index":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/index.hbs"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/not_found.js":[function(require,module,exports){
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

},{"../lib/auth":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js","../templates/not_found":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/not_found.hbs"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/user.js":[function(require,module,exports){
var User = require('../models/user')

module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/user')
, initialize: function(opts) {
    var _this = this
     , user = new User(opts)
    user.fetch({
      success: function(user) {
        _this.render(user.attributes)
      }
    })
  }
, render: function(user) {
    console.log(user.attributes)
    $(this.el).html(this.template(user))
  }
})

},{"../models/user":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/user.js","../templates/user":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/user.hbs"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/users.js":[function(require,module,exports){
module.exports = Backbone.View.extend({
  el: '#content'
, template: require('../templates/users')
, initialize: function() {
    this.render()
  }
, render: function() {
    var opts = {}
    $(this.el).html(this.template)
  }

})

},{"../templates/users":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/users.hbs"}]},{},["./src/javascripts/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4vc3JjL2phdmFzY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvZXhjZXB0aW9uLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYnNmeS9ydW50aW1lLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvaGVscGVycy5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL2xpYi9hdXRoLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvbW9kZWxzL2NvbW1pdC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL21vZGVscy9jb21taXRzX2NvbGxlY3Rpb24uanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy9tb2RlbHMvY29udGVudC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL21vZGVscy91c2VyLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvcm91dGVyLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdGVtcGxhdGVzL2NvbW1pdC5oYnMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy90ZW1wbGF0ZXMvY29tbWl0cy5oYnMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy90ZW1wbGF0ZXMvaW5kZXguaGJzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdGVtcGxhdGVzL25vdF9mb3VuZC5oYnMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy90ZW1wbGF0ZXMvdXNlci5oYnMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy90ZW1wbGF0ZXMvdXNlcnMuaGJzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdmlld3MvY29tbWl0LmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdmlld3MvY29tbWl0cy5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL3ZpZXdzL2luZGV4X3ZpZXcuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy92aWV3cy9ub3RfZm91bmQuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy92aWV3cy91c2VyLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdmlld3MvdXNlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cuQXBwID0ge31cbndpbmRvdy5jb29raWVzID0ge31cblxudmFyIFJvdXRlciA9IHJlcXVpcmUoJy4vcm91dGVyJylcbndpbmRvdy5yZWFkQ29va2llID0gcmVxdWlyZSgnLi9oZWxwZXJzJykucmVhZENvb2tpZVxuXG53aW5kb3cuQXBwLnJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuXG5CYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KHsgcHVzaFN0YXRlOiB0cnVlIH0pXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLypnbG9iYWxzIEhhbmRsZWJhcnM6IHRydWUgKi9cbnZhciBiYXNlID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9iYXNlXCIpO1xuXG4vLyBFYWNoIG9mIHRoZXNlIGF1Z21lbnQgdGhlIEhhbmRsZWJhcnMgb2JqZWN0LiBObyBuZWVkIHRvIHNldHVwIGhlcmUuXG4vLyAoVGhpcyBpcyBkb25lIHRvIGVhc2lseSBzaGFyZSBjb2RlIGJldHdlZW4gY29tbW9uanMgYW5kIGJyb3dzZSBlbnZzKVxudmFyIFNhZmVTdHJpbmcgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3NhZmUtc3RyaW5nXCIpW1wiZGVmYXVsdFwiXTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3V0aWxzXCIpO1xudmFyIHJ1bnRpbWUgPSByZXF1aXJlKFwiLi9oYW5kbGViYXJzL3J1bnRpbWVcIik7XG5cbi8vIEZvciBjb21wYXRpYmlsaXR5IGFuZCB1c2FnZSBvdXRzaWRlIG9mIG1vZHVsZSBzeXN0ZW1zLCBtYWtlIHRoZSBIYW5kbGViYXJzIG9iamVjdCBhIG5hbWVzcGFjZVxudmFyIGNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaGIgPSBuZXcgYmFzZS5IYW5kbGViYXJzRW52aXJvbm1lbnQoKTtcblxuICBVdGlscy5leHRlbmQoaGIsIGJhc2UpO1xuICBoYi5TYWZlU3RyaW5nID0gU2FmZVN0cmluZztcbiAgaGIuRXhjZXB0aW9uID0gRXhjZXB0aW9uO1xuICBoYi5VdGlscyA9IFV0aWxzO1xuXG4gIGhiLlZNID0gcnVudGltZTtcbiAgaGIudGVtcGxhdGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWUudGVtcGxhdGUoc3BlYywgaGIpO1xuICB9O1xuXG4gIHJldHVybiBoYjtcbn07XG5cbnZhciBIYW5kbGViYXJzID0gY3JlYXRlKCk7XG5IYW5kbGViYXJzLmNyZWF0ZSA9IGNyZWF0ZTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBIYW5kbGViYXJzOyIsIlwidXNlIHN0cmljdFwiO1xudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZShcIi4vZXhjZXB0aW9uXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIFZFUlNJT04gPSBcIjEuMy4wXCI7XG5leHBvcnRzLlZFUlNJT04gPSBWRVJTSU9OO3ZhciBDT01QSUxFUl9SRVZJU0lPTiA9IDQ7XG5leHBvcnRzLkNPTVBJTEVSX1JFVklTSU9OID0gQ09NUElMRVJfUkVWSVNJT047XG52YXIgUkVWSVNJT05fQ0hBTkdFUyA9IHtcbiAgMTogJzw9IDEuMC5yYy4yJywgLy8gMS4wLnJjLjIgaXMgYWN0dWFsbHkgcmV2MiBidXQgZG9lc24ndCByZXBvcnQgaXRcbiAgMjogJz09IDEuMC4wLXJjLjMnLFxuICAzOiAnPT0gMS4wLjAtcmMuNCcsXG4gIDQ6ICc+PSAxLjAuMCdcbn07XG5leHBvcnRzLlJFVklTSU9OX0NIQU5HRVMgPSBSRVZJU0lPTl9DSEFOR0VTO1xudmFyIGlzQXJyYXkgPSBVdGlscy5pc0FycmF5LFxuICAgIGlzRnVuY3Rpb24gPSBVdGlscy5pc0Z1bmN0aW9uLFxuICAgIHRvU3RyaW5nID0gVXRpbHMudG9TdHJpbmcsXG4gICAgb2JqZWN0VHlwZSA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG5mdW5jdGlvbiBIYW5kbGViYXJzRW52aXJvbm1lbnQoaGVscGVycywgcGFydGlhbHMpIHtcbiAgdGhpcy5oZWxwZXJzID0gaGVscGVycyB8fCB7fTtcbiAgdGhpcy5wYXJ0aWFscyA9IHBhcnRpYWxzIHx8IHt9O1xuXG4gIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnModGhpcyk7XG59XG5cbmV4cG9ydHMuSGFuZGxlYmFyc0Vudmlyb25tZW50ID0gSGFuZGxlYmFyc0Vudmlyb25tZW50O0hhbmRsZWJhcnNFbnZpcm9ubWVudC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBIYW5kbGViYXJzRW52aXJvbm1lbnQsXG5cbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIGxvZzogbG9nLFxuXG4gIHJlZ2lzdGVySGVscGVyOiBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBpZiAoaW52ZXJzZSB8fCBmbikgeyB0aHJvdyBuZXcgRXhjZXB0aW9uKCdBcmcgbm90IHN1cHBvcnRlZCB3aXRoIG11bHRpcGxlIGhlbHBlcnMnKTsgfVxuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMuaGVscGVycywgbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICAgIHRoaXMuaGVscGVyc1tuYW1lXSA9IGZuO1xuICAgIH1cbiAgfSxcblxuICByZWdpc3RlclBhcnRpYWw6IGZ1bmN0aW9uKG5hbWUsIHN0cikge1xuICAgIGlmICh0b1N0cmluZy5jYWxsKG5hbWUpID09PSBvYmplY3RUeXBlKSB7XG4gICAgICBVdGlscy5leHRlbmQodGhpcy5wYXJ0aWFscywgIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhcnRpYWxzW25hbWVdID0gc3RyO1xuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJEZWZhdWx0SGVscGVycyhpbnN0YW5jZSkge1xuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2Jsb2NrSGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZihjb250ZXh0ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZm4odGhpcyk7XG4gICAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGNvbnRleHQpKSB7XG4gICAgICBpZihjb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnMuZWFjaChjb250ZXh0LCBvcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignZWFjaCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICAgIHZhciBpID0gMCwgcmV0ID0gXCJcIiwgZGF0YTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICAgIGRhdGEgPSBjcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGlmKGNvbnRleHQgJiYgdHlwZW9mIGNvbnRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgICBmb3IodmFyIGogPSBjb250ZXh0Lmxlbmd0aDsgaTxqOyBpKyspIHtcbiAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgZGF0YS5pbmRleCA9IGk7XG4gICAgICAgICAgICBkYXRhLmZpcnN0ID0gKGkgPT09IDApO1xuICAgICAgICAgICAgZGF0YS5sYXN0ICA9IChpID09PSAoY29udGV4dC5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2ldLCB7IGRhdGE6IGRhdGEgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvcih2YXIga2V5IGluIGNvbnRleHQpIHtcbiAgICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIGlmKGRhdGEpIHsgXG4gICAgICAgICAgICAgIGRhdGEua2V5ID0ga2V5OyBcbiAgICAgICAgICAgICAgZGF0YS5pbmRleCA9IGk7XG4gICAgICAgICAgICAgIGRhdGEuZmlyc3QgPSAoaSA9PT0gMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXQgPSByZXQgKyBmbihjb250ZXh0W2tleV0sIHtkYXRhOiBkYXRhfSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoaSA9PT0gMCl7XG4gICAgICByZXQgPSBpbnZlcnNlKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdpZicsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29uZGl0aW9uYWwpKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gICAgLy8gRGVmYXVsdCBiZWhhdmlvciBpcyB0byByZW5kZXIgdGhlIHBvc2l0aXZlIHBhdGggaWYgdGhlIHZhbHVlIGlzIHRydXRoeSBhbmQgbm90IGVtcHR5LlxuICAgIC8vIFRoZSBgaW5jbHVkZVplcm9gIG9wdGlvbiBtYXkgYmUgc2V0IHRvIHRyZWF0IHRoZSBjb25kdGlvbmFsIGFzIHB1cmVseSBub3QgZW1wdHkgYmFzZWQgb24gdGhlXG4gICAgLy8gYmVoYXZpb3Igb2YgaXNFbXB0eS4gRWZmZWN0aXZlbHkgdGhpcyBkZXRlcm1pbmVzIGlmIDAgaXMgaGFuZGxlZCBieSB0aGUgcG9zaXRpdmUgcGF0aCBvciBuZWdhdGl2ZS5cbiAgICBpZiAoKCFvcHRpb25zLmhhc2guaW5jbHVkZVplcm8gJiYgIWNvbmRpdGlvbmFsKSB8fCBVdGlscy5pc0VtcHR5KGNvbmRpdGlvbmFsKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuZm4odGhpcyk7XG4gICAgfVxuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcigndW5sZXNzJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuaGVscGVyc1snaWYnXS5jYWxsKHRoaXMsIGNvbmRpdGlvbmFsLCB7Zm46IG9wdGlvbnMuaW52ZXJzZSwgaW52ZXJzZTogb3B0aW9ucy5mbiwgaGFzaDogb3B0aW9ucy5oYXNofSk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRleHQpKSB7IGNvbnRleHQgPSBjb250ZXh0LmNhbGwodGhpcyk7IH1cblxuICAgIGlmICghVXRpbHMuaXNFbXB0eShjb250ZXh0KSkgcmV0dXJuIG9wdGlvbnMuZm4oY29udGV4dCk7XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdsb2cnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICAgIGluc3RhbmNlLmxvZyhsZXZlbCwgY29udGV4dCk7XG4gIH0pO1xufVxuXG52YXIgbG9nZ2VyID0ge1xuICBtZXRob2RNYXA6IHsgMDogJ2RlYnVnJywgMTogJ2luZm8nLCAyOiAnd2FybicsIDM6ICdlcnJvcicgfSxcblxuICAvLyBTdGF0ZSBlbnVtXG4gIERFQlVHOiAwLFxuICBJTkZPOiAxLFxuICBXQVJOOiAyLFxuICBFUlJPUjogMyxcbiAgbGV2ZWw6IDMsXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKGxvZ2dlci5sZXZlbCA8PSBsZXZlbCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGxvZ2dlci5tZXRob2RNYXBbbGV2ZWxdO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlW21ldGhvZF0pIHtcbiAgICAgICAgY29uc29sZVttZXRob2RdLmNhbGwoY29uc29sZSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5leHBvcnRzLmxvZ2dlciA9IGxvZ2dlcjtcbmZ1bmN0aW9uIGxvZyhsZXZlbCwgb2JqKSB7IGxvZ2dlci5sb2cobGV2ZWwsIG9iaik7IH1cblxuZXhwb3J0cy5sb2cgPSBsb2c7dmFyIGNyZWF0ZUZyYW1lID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBvYmogPSB7fTtcbiAgVXRpbHMuZXh0ZW5kKG9iaiwgb2JqZWN0KTtcbiAgcmV0dXJuIG9iajtcbn07XG5leHBvcnRzLmNyZWF0ZUZyYW1lID0gY3JlYXRlRnJhbWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuZnVuY3Rpb24gRXhjZXB0aW9uKG1lc3NhZ2UsIG5vZGUpIHtcbiAgdmFyIGxpbmU7XG4gIGlmIChub2RlICYmIG5vZGUuZmlyc3RMaW5lKSB7XG4gICAgbGluZSA9IG5vZGUuZmlyc3RMaW5lO1xuXG4gICAgbWVzc2FnZSArPSAnIC0gJyArIGxpbmUgKyAnOicgKyBub2RlLmZpcnN0Q29sdW1uO1xuICB9XG5cbiAgdmFyIHRtcCA9IEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1lc3NhZ2UpO1xuXG4gIC8vIFVuZm9ydHVuYXRlbHkgZXJyb3JzIGFyZSBub3QgZW51bWVyYWJsZSBpbiBDaHJvbWUgKGF0IGxlYXN0KSwgc28gYGZvciBwcm9wIGluIHRtcGAgZG9lc24ndCB3b3JrLlxuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBlcnJvclByb3BzLmxlbmd0aDsgaWR4KyspIHtcbiAgICB0aGlzW2Vycm9yUHJvcHNbaWR4XV0gPSB0bXBbZXJyb3JQcm9wc1tpZHhdXTtcbiAgfVxuXG4gIGlmIChsaW5lKSB7XG4gICAgdGhpcy5saW5lTnVtYmVyID0gbGluZTtcbiAgICB0aGlzLmNvbHVtbiA9IG5vZGUuZmlyc3RDb2x1bW47XG4gIH1cbn1cblxuRXhjZXB0aW9uLnByb3RvdHlwZSA9IG5ldyBFcnJvcigpO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IEV4Y2VwdGlvbjsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoXCIuL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG52YXIgQ09NUElMRVJfUkVWSVNJT04gPSByZXF1aXJlKFwiLi9iYXNlXCIpLkNPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSByZXF1aXJlKFwiLi9iYXNlXCIpLlJFVklTSU9OX0NIQU5HRVM7XG5cbmZ1bmN0aW9uIGNoZWNrUmV2aXNpb24oY29tcGlsZXJJbmZvKSB7XG4gIHZhciBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvICYmIGNvbXBpbGVySW5mb1swXSB8fCAxLFxuICAgICAgY3VycmVudFJldmlzaW9uID0gQ09NUElMRVJfUkVWSVNJT047XG5cbiAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgIGlmIChjb21waWxlclJldmlzaW9uIDwgY3VycmVudFJldmlzaW9uKSB7XG4gICAgICB2YXIgcnVudGltZVZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjdXJyZW50UmV2aXNpb25dLFxuICAgICAgICAgIGNvbXBpbGVyVmVyc2lvbnMgPSBSRVZJU0lPTl9DSEFOR0VTW2NvbXBpbGVyUmV2aXNpb25dO1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcHJlY29tcGlsZXIgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitydW50aW1lVmVyc2lvbnMrXCIpIG9yIGRvd25ncmFkZSB5b3VyIHJ1bnRpbWUgdG8gYW4gb2xkZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJWZXJzaW9ucytcIikuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBVc2UgdGhlIGVtYmVkZGVkIHZlcnNpb24gaW5mbyBzaW5jZSB0aGUgcnVudGltZSBkb2Vzbid0IGtub3cgYWJvdXQgdGhpcyByZXZpc2lvbiB5ZXRcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhIG5ld2VyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgXCJQbGVhc2UgdXBkYXRlIHlvdXIgcnVudGltZSB0byBhIG5ld2VyIHZlcnNpb24gKFwiK2NvbXBpbGVySW5mb1sxXStcIikuXCIpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmNoZWNrUmV2aXNpb24gPSBjaGVja1JldmlzaW9uOy8vIFRPRE86IFJlbW92ZSB0aGlzIGxpbmUgYW5kIGJyZWFrIHVwIGNvbXBpbGVQYXJ0aWFsXG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHRlbXBsYXRlU3BlYywgZW52KSB7XG4gIGlmICghZW52KSB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIk5vIGVudmlyb25tZW50IHBhc3NlZCB0byB0ZW1wbGF0ZVwiKTtcbiAgfVxuXG4gIC8vIE5vdGU6IFVzaW5nIGVudi5WTSByZWZlcmVuY2VzIHJhdGhlciB0aGFuIGxvY2FsIHZhciByZWZlcmVuY2VzIHRocm91Z2hvdXQgdGhpcyBzZWN0aW9uIHRvIGFsbG93XG4gIC8vIGZvciBleHRlcm5hbCB1c2VycyB0byBvdmVycmlkZSB0aGVzZSBhcyBwc3VlZG8tc3VwcG9ydGVkIEFQSXMuXG4gIHZhciBpbnZva2VQYXJ0aWFsV3JhcHBlciA9IGZ1bmN0aW9uKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IGVudi5WTS5pbnZva2VQYXJ0aWFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7IHJldHVybiByZXN1bHQ7IH1cblxuICAgIGlmIChlbnYuY29tcGlsZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB7IGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBlbnYuY29tcGlsZShwYXJ0aWFsLCB7IGRhdGE6IGRhdGEgIT09IHVuZGVmaW5lZCB9LCBlbnYpO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgdmFyIGNvbnRhaW5lciA9IHtcbiAgICBlc2NhcGVFeHByZXNzaW9uOiBVdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgIGludm9rZVBhcnRpYWw6IGludm9rZVBhcnRpYWxXcmFwcGVyLFxuICAgIHByb2dyYW1zOiBbXSxcbiAgICBwcm9ncmFtOiBmdW5jdGlvbihpLCBmbiwgZGF0YSkge1xuICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgcHJvZ3JhbVdyYXBwZXIgPSBwcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByb2dyYW1XcmFwcGVyKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXSA9IHByb2dyYW0oaSwgZm4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb2dyYW1XcmFwcGVyO1xuICAgIH0sXG4gICAgbWVyZ2U6IGZ1bmN0aW9uKHBhcmFtLCBjb21tb24pIHtcbiAgICAgIHZhciByZXQgPSBwYXJhbSB8fCBjb21tb247XG5cbiAgICAgIGlmIChwYXJhbSAmJiBjb21tb24gJiYgKHBhcmFtICE9PSBjb21tb24pKSB7XG4gICAgICAgIHJldCA9IHt9O1xuICAgICAgICBVdGlscy5leHRlbmQocmV0LCBjb21tb24pO1xuICAgICAgICBVdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgcHJvZ3JhbVdpdGhEZXB0aDogZW52LlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgbm9vcDogZW52LlZNLm5vb3AsXG4gICAgY29tcGlsZXJJbmZvOiBudWxsXG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgbmFtZXNwYWNlID0gb3B0aW9ucy5wYXJ0aWFsID8gb3B0aW9ucyA6IGVudixcbiAgICAgICAgaGVscGVycyxcbiAgICAgICAgcGFydGlhbHM7XG5cbiAgICBpZiAoIW9wdGlvbnMucGFydGlhbCkge1xuICAgICAgaGVscGVycyA9IG9wdGlvbnMuaGVscGVycztcbiAgICAgIHBhcnRpYWxzID0gb3B0aW9ucy5wYXJ0aWFscztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKFxuICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICBuYW1lc3BhY2UsIGNvbnRleHQsXG4gICAgICAgICAgaGVscGVycyxcbiAgICAgICAgICBwYXJ0aWFscyxcbiAgICAgICAgICBvcHRpb25zLmRhdGEpO1xuXG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGVudi5WTS5jaGVja1JldmlzaW9uKGNvbnRhaW5lci5jb21waWxlckluZm8pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbmV4cG9ydHMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtmdW5jdGlvbiBwcm9ncmFtV2l0aERlcHRoKGksIGZuLCBkYXRhIC8qLCAkZGVwdGggKi8pIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuXG4gIHZhciBwcm9nID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIFtjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YV0uY29uY2F0KGFyZ3MpKTtcbiAgfTtcbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IGFyZ3MubGVuZ3RoO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0cy5wcm9ncmFtV2l0aERlcHRoID0gcHJvZ3JhbVdpdGhEZXB0aDtmdW5jdGlvbiBwcm9ncmFtKGksIGZuLCBkYXRhKSB7XG4gIHZhciBwcm9nID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIGZuKGNvbnRleHQsIG9wdGlvbnMuZGF0YSB8fCBkYXRhKTtcbiAgfTtcbiAgcHJvZy5wcm9ncmFtID0gaTtcbiAgcHJvZy5kZXB0aCA9IDA7XG4gIHJldHVybiBwcm9nO1xufVxuXG5leHBvcnRzLnByb2dyYW0gPSBwcm9ncmFtO2Z1bmN0aW9uIGludm9rZVBhcnRpYWwocGFydGlhbCwgbmFtZSwgY29udGV4dCwgaGVscGVycywgcGFydGlhbHMsIGRhdGEpIHtcbiAgdmFyIG9wdGlvbnMgPSB7IHBhcnRpYWw6IHRydWUsIGhlbHBlcnM6IGhlbHBlcnMsIHBhcnRpYWxzOiBwYXJ0aWFscywgZGF0YTogZGF0YSB9O1xuXG4gIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUaGUgcGFydGlhbCBcIiArIG5hbWUgKyBcIiBjb3VsZCBub3QgYmUgZm91bmRcIik7XG4gIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gcGFydGlhbChjb250ZXh0LCBvcHRpb25zKTtcbiAgfVxufVxuXG5leHBvcnRzLmludm9rZVBhcnRpYWwgPSBpbnZva2VQYXJ0aWFsO2Z1bmN0aW9uIG5vb3AoKSB7IHJldHVybiBcIlwiOyB9XG5cbmV4cG9ydHMubm9vcCA9IG5vb3A7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBCdWlsZCBvdXQgb3VyIGJhc2ljIFNhZmVTdHJpbmcgdHlwZVxuZnVuY3Rpb24gU2FmZVN0cmluZyhzdHJpbmcpIHtcbiAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG59XG5cblNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIlwiICsgdGhpcy5zdHJpbmc7XG59O1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IFNhZmVTdHJpbmc7IiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKmpzaGludCAtVzAwNCAqL1xudmFyIFNhZmVTdHJpbmcgPSByZXF1aXJlKFwiLi9zYWZlLXN0cmluZ1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBlc2NhcGUgPSB7XG4gIFwiJlwiOiBcIiZhbXA7XCIsXG4gIFwiPFwiOiBcIiZsdDtcIixcbiAgXCI+XCI6IFwiJmd0O1wiLFxuICAnXCInOiBcIiZxdW90O1wiLFxuICBcIidcIjogXCImI3gyNztcIixcbiAgXCJgXCI6IFwiJiN4NjA7XCJcbn07XG5cbnZhciBiYWRDaGFycyA9IC9bJjw+XCInYF0vZztcbnZhciBwb3NzaWJsZSA9IC9bJjw+XCInYF0vO1xuXG5mdW5jdGlvbiBlc2NhcGVDaGFyKGNocikge1xuICByZXR1cm4gZXNjYXBlW2Nocl0gfHwgXCImYW1wO1wiO1xufVxuXG5mdW5jdGlvbiBleHRlbmQob2JqLCB2YWx1ZSkge1xuICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkge1xuICAgICAgb2JqW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmV4dGVuZCA9IGV4dGVuZDt2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLy8gU291cmNlZCBmcm9tIGxvZGFzaFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2xvZGFzaC9ibG9iL21hc3Rlci9MSUNFTlNFLnR4dFxudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufTtcbi8vIGZhbGxiYWNrIGZvciBvbGRlciB2ZXJzaW9ucyBvZiBDaHJvbWUgYW5kIFNhZmFyaVxuaWYgKGlzRnVuY3Rpb24oL3gvKSkge1xuICBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICB9O1xufVxudmFyIGlzRnVuY3Rpb247XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykgPyB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyA6IGZhbHNlO1xufTtcbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGVzY2FwZUV4cHJlc3Npb24oc3RyaW5nKSB7XG4gIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgaWYgKHN0cmluZyBpbnN0YW5jZW9mIFNhZmVTdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSBpZiAoIXN0cmluZyAmJiBzdHJpbmcgIT09IDApIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuXG4gIC8vIEZvcmNlIGEgc3RyaW5nIGNvbnZlcnNpb24gYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgdGhlIGFwcGVuZCByZWdhcmRsZXNzIGFuZFxuICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgLy8gYW4gb2JqZWN0J3MgdG8gc3RyaW5nIGhhcyBlc2NhcGVkIGNoYXJhY3RlcnMgaW4gaXQuXG4gIHN0cmluZyA9IFwiXCIgKyBzdHJpbmc7XG5cbiAgaWYoIXBvc3NpYmxlLnRlc3Qoc3RyaW5nKSkgeyByZXR1cm4gc3RyaW5nOyB9XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG59XG5cbmV4cG9ydHMuZXNjYXBlRXhwcmVzc2lvbiA9IGVzY2FwZUV4cHJlc3Npb247ZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydHMuaXNFbXB0eSA9IGlzRW1wdHk7IiwiLy8gQ3JlYXRlIGEgc2ltcGxlIHBhdGggYWxpYXMgdG8gYWxsb3cgYnJvd3NlcmlmeSB0byByZXNvbHZlXG4vLyB0aGUgcnVudGltZSBvbiBhIHN1cHBvcnRlZCBwYXRoLlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Rpc3QvY2pzL2hhbmRsZWJhcnMucnVudGltZScpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiaGFuZGxlYmFycy9ydW50aW1lXCIpW1wiZGVmYXVsdFwiXTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBwYXJzZVF1ZXJ5U3RyaW5nOiBmdW5jdGlvbihxdWVyeVN0cmluZyl7XG4gICAgdmFyIHBhcmFtcyA9IHt9XG4gICAgaWYocXVlcnlTdHJpbmcpe1xuICAgICAgXy5lYWNoKFxuICAgICAgICBfLm1hcChkZWNvZGVVUkkocXVlcnlTdHJpbmcpLnNwbGl0KC8mL2cpLGZ1bmN0aW9uKGVsLGkpe1xuICAgICAgICAgIHZhciBhdXggPSBlbC5zcGxpdCgnPScpLCBvID0ge31cbiAgICAgICAgICBpZihhdXgubGVuZ3RoID49IDEpe1xuICAgICAgICAgICAgdmFyIHZhbCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgaWYoYXV4Lmxlbmd0aCA9PSAyKVxuICAgICAgICAgICAgICB2YWwgPSBhdXhbMV1cbiAgICAgICAgICAgIG9bYXV4WzBdXSA9IHZhbFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gb1xuICAgICAgfSksXG4gICAgICAgIGZ1bmN0aW9uKG8pe1xuICAgICAgICAgIF8uZXh0ZW5kKHBhcmFtcyxvKVxuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG4sIHJlYWRDb29raWU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKHdpbmRvdy5jb29raWVzW25hbWVdKSByZXR1cm4gd2luZG93LmNvb2tpZXNbbmFtZV07XG5cbiAgICBjID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7JylcbiAgICBjb29raWVzID0ge31cblxuXG4gICAgYy5mb3JFYWNoKGZ1bmN0aW9uKGNvb2tpZSkge1xuICAgICAgdmFyIEMgPSBjb29raWUuc3BsaXQoJz0nKVxuICAgICAgd2luZG93LmNvb2tpZXNbQ1swXS50cmltKCldID0gQ1sxXVxuICAgIH0pXG5cbiAgICByZXR1cm4gd2luZG93LmNvb2tpZXNbbmFtZV1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZldGNoVG9rZW46IGZ1bmN0aW9uKGNvZGUsIG5leHQpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzXG4gICAgJC5nZXRKU09OKCcvYXV0aGVudGljYXRlLycgKyBjb2RlLCBmdW5jdGlvbihqc29uKSB7XG4gICAgICBfdGhpcy5zZXRUb2tlbihqc29uLnRva2VuKVxuICAgICAgbmV4dCgpXG4gICAgfSlcbiAgfVxuLCBzZXRUb2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKClcbiAgICB3aW5kb3cuY29va2llcy50b2tlbiA9IHRva2VuXG4gICAgLy8gU2V0IDEgZGF5IGV4cGlyeT9cbiAgICBkb2N1bWVudC5jb29raWUgPSAndG9rZW49JyArIHRva2VuICsgJzsgZXhwaXJlcz0nICsgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgMSkgKyAnOyBwYXRoPS8nXG4gIH1cbiwgZ2V0VG9rZW46IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gd2luZG93LnJlYWRDb29raWUoJ3Rva2VuJylcbiAgfVxuLCBhdXRoZW50aWNhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkID0gbmV3IERhdGUoKVxuICAgICAgLCByZWcgPSBuZXcgUmVnRXhwKCdeLisnICsgd2luZG93LmxvY2F0aW9uLmhvc3QpXG4gICAgICAsIHVybFBhdGggPSBlbmNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCkucmVwbGFjZShyZWcsICcnKSlcblxuICAgIGRvY3VtZW50LmNvb2tpZSA9ICdsYXN0VXJsPScgKyB1cmxQYXRoICsgJzsgcGF0aD0vJ1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKCcvYXV0aGVudGljYXRlJylcbiAgfVxuLCBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuY29va2llcyA9IHt9XG4gICAgZG9jdW1lbnQuY29va2llID0gXCJ0b2tlbj07IGV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBVVEM7IGxhc3RVcmw9OyBleHBpcmVzPVRodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDAgVVRDXCJcbiAgfVxuLCBjaGVja1VzZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhIXdpbmRvdy5yZWFkQ29va2llKCd0b2tlbicpIHx8IHRoaXMuYXV0aGVudGljYXRlKClcbiAgfVxufVxuIiwidmFyIGF1dGggPSByZXF1aXJlKCcuLi9saWIvYXV0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNoYSA9IHRoaXMuZ2V0KCdzaGEnKVxuICAgIHRoaXMuc2V0KCdpZCcsIHNoYSlcbiAgfVxuLCB1cmw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cmwgPSB0aGlzLmdldCgndXJsJylcbiAgICByZXR1cm4gdXJsID8gdXJsXG4gICAgICAgICAgICAgICA6ICdodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zLydcbiAgICAgICAgICAgICAgICAgICsgdGhpcy5nZXQoJ293bmVyJylcbiAgICAgICAgICAgICAgICAgICsgJy8nXG4gICAgICAgICAgICAgICAgICArIHRoaXMuZ2V0KCdyZXBvJylcbiAgICAgICAgICAgICAgICAgICsgJy9jb21taXRzLydcbiAgICAgICAgICAgICAgICAgICsgdGhpcy5nZXQoJ3NoYScpXG4gIH1cbiwgZmV0Y2g6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICByZW1vdmU6IGZhbHNlXG4gICAgLCBhZGQ6IHRydWVcbiAgICAsIGNhY2hlOiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHRva2VuID0gYXV0aC5nZXRUb2tlbigpKSB7XG4gICAgICBkZWZhdWx0cy5oZWFkZXJzID0geydBdXRob3JpemF0aW9uJyA6J3Rva2VuICcgKyB0b2tlbiB9XG4gICAgfVxuXG4gICAgXy5leHRlbmQob3B0aW9ucywgZGVmYXVsdHMpXG4gICAgcmV0dXJuIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoLmNhbGwodGhpcywgb3B0aW9ucylcbiAgfVxuLCBpbmRleDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5pbmRleE9mKHRoaXMpXG4gIH1cbiwgbnh0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmF0KHRoaXMuaW5kZXgoKSArIDEpIHx8IHRoaXNcbiAgfVxuLCBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmF0KHRoaXMuaW5kZXgoKSAtIDEpIHx8IHRoaXNcbiAgfVxuLCBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodGhpcy5nZXQoJ2NvbW1pdCcpLmNvbW1pdHRlci5kYXRlKVxuICB9XG4sXG59KVxuXG5cbiIsInZhciBhdXRoID0gcmVxdWlyZSgnLi4vbGliL2F1dGgnKVxudmFyIENvbW1pdCA9IHJlcXVpcmUoJy4vY29tbWl0JylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKG1vZGVscywgb3B0cykge1xuICAgIC8vIFRPRE86IFNldCB0aGVzZSB0aGluZ3MgYXMgYXR0cmlidXRlcyBvbiB0aGUgY29sbGVjdGlvblxuICAgIHRoaXMucGF0aCA9IG9wdHMucGF0aFxuICAgIHRoaXMuc2hhID0gb3B0cy5zaGFcbiAgICB0aGlzLm93bmVyID0gb3B0cy5vd25lclxuICAgIHRoaXMucmVwbyA9IG9wdHMucmVwb1xuICB9XG4sIG1vZGVsOiBDb21taXRcbiwgY29tcGFyYXRvcjogZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBkYXRlQSA9IChhLmdldCgnY29tbWl0JykuY29tbWl0dGVyLmRhdGUpXG4gICAgICAsIGRhdGVCID0gKGIuZ2V0KCdjb21taXQnKS5jb21taXR0ZXIuZGF0ZSlcbiAgICByZXR1cm4gZGF0ZUEgPCBkYXRlQiA/IDFcbiAgICAgICAgIDogZGF0ZUEgPiBkYXRlQiA/IC0xXG4gICAgICAgICA6IDBcbiAgfVxuLCBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAsIGFkZDogdHJ1ZVxuICAgICwgY2FjaGU6IHRydWVcbiAgICB9XG5cbiAgICBpZiAodG9rZW4gPSBhdXRoLmdldFRva2VuKCkpIHtcbiAgICAgIGRlZmF1bHRzLmhlYWRlcnMgPSB7J0F1dGhvcml6YXRpb24nIDondG9rZW4gJyArIHRva2VuIH1cbiAgICB9XG5cbiAgICBfLmV4dGVuZChvcHRpb25zLCBkZWZhdWx0cylcbiAgICByZXR1cm4gQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuZmV0Y2guY2FsbCh0aGlzLCBvcHRpb25zKVxuICB9XG4sIHVybDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVybCA9IFtbXG4gICAgICAgICdodHRwczovL2FwaS5naXRodWIuY29tL3JlcG9zJ1xuICAgICAgLCB0aGlzLm93bmVyXG4gICAgICAsIHRoaXMucmVwb1xuICAgICAgLCAnY29tbWl0cydcbiAgICAgIF0uam9pbignLycpXG4gICAgLCAnP3BhdGg9J1xuICAgICwgKHRoaXMucGF0aCB8fCAnJylcbiAgICAsICcmc2hhPSdcbiAgICAsICh0aGlzLnNoYSB8fCAnJylcbiAgICBdLmpvaW4oJycpXG5cbiAgICBpZiAodGhpcy51bnRpbCkge1xuICAgICAgdXJsID0gdXJsICsgJyZ1bnRpbD0nICsgdGhpcy51bnRpbFxuICAgIH0gZWxzZSBpZiAodGhpcy5zaW5jZSkge1xuICAgICAgdXJsID0gdXJsICsgJyZzaW5jZT0nICsgdGhpcy5zaW5jZVxuICAgIH1cblxuICAgIHJldHVybiB1cmxcbiAgfVxuLCByZW1vdmVEdXBzOiBmdW5jdGlvbigpIHtcbiAgICAvLyBIQUFBQUNLXG4gICAgdmFyIG8gPSB7fSwgZHVwcyA9IFtdXG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmIChvW2MuZ2V0KCdzaGEnKV0pIGR1cHMucHVzaChjKVxuICAgICAgb1tjLmdldCgnc2hhJyldID0gY1xuICAgIH0pXG4gICAgY29uc29sZS5sb2coJ2R1cHM6JywgZHVwcylcbiAgICB0aGlzLnJlbW92ZShkdXBzKVxuICB9XG59KVxuIiwidmFyIGF1dGggPSByZXF1aXJlKCcuLi9saWIvYXV0aCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgdXJsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NvbnRlbnRzX3VybCcpXG4gIH1cbiwgZmV0Y2g6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICByZW1vdmU6IGZhbHNlXG4gICAgLCBhZGQ6IHRydWVcbiAgICAsIGNhY2hlOiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHRva2VuID0gYXV0aC5nZXRUb2tlbigpKSB7XG4gICAgICBkZWZhdWx0cy5oZWFkZXJzID0geydBdXRob3JpemF0aW9uJyA6J3Rva2VuICcgKyB0b2tlbiB9XG4gICAgfVxuXG4gICAgXy5leHRlbmQob3B0aW9ucywgZGVmYXVsdHMpXG4gICAgcmV0dXJuIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoLmNhbGwodGhpcywgb3B0aW9ucylcbiAgfVxufSlcblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIHVybDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdodHRwczovL2FwaS5naXRodWIuY29tL3VzZXJzLycgKyB0aGlzLmdldCgndXNlcm5hbWUnKVxuICB9XG59KVxuXG4iLCIvLyBIRUxQRVJTXG52YXIgcGFyc2VRdWVyeVN0cmluZyA9IHJlcXVpcmUoJy4vaGVscGVycycpLnBhcnNlUXVlcnlTdHJpbmdcbiAgLCBhdXRoID0gcmVxdWlyZSgnLi9saWIvYXV0aCcpXG5cbi8vIE1PREVMU1xudmFyIENvbW1pdCA9IHJlcXVpcmUoJy4vbW9kZWxzL2NvbW1pdCcpXG4gICwgQ29tbWl0c0xpc3QgPSByZXF1aXJlKCcuL21vZGVscy9jb21taXRzX2NvbGxlY3Rpb24nKVxuXG4vLyBWSUVXU1xudmFyIEluZGV4VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvaW5kZXhfdmlldycpXG4gICwgVXNlclZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL3VzZXInKVxuICAsIFVzZXJzVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvdXNlcnMnKVxuICAsIENvbW1pdFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2NvbW1pdCcpXG4gICwgQ29tbWl0c1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2NvbW1pdHMnKVxuICAsIE5vdEZvdW5kVmlldyA9IHJlcXVpcmUoJy4vdmlld3Mvbm90X2ZvdW5kJylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcbiAgcm91dGVzOiB7XG4gICAgJyc6ICdpbmRleCdcbiAgLCAnYXV0aCgvKSg/KnF1ZXJ5U3RyaW5nKSc6ICdhdXRoJ1xuICAsICdzaWduaW4oLyknOiAnc2lnbmluJ1xuICAsICdzaWdub3V0KC8pJzogJ3NpZ25vdXQnXG4gICwgJ3VzZXJzLzp1c2VybmFtZSgvKSc6ICd1c2VyJ1xuICAsICd1c2VycygvKSc6ICd1c2VycydcbiAgLCAnOm93bmVyLzpyZXBvL2Jsb2IvOnNoYS8qcGF0aCc6ICdjb21taXRzJ1xuICAsICcqcGF0aCc6ICdub3RGb3VuZCdcbiAgfVxuLCBpbmRleDogZnVuY3Rpb24oKSB7XG4gICAgbmV3IEluZGV4Vmlldyh7IGVsOiAnI2NvbnRlbnQnIH0pXG4gIH1cbiwgYXV0aDogZnVuY3Rpb24ocXVlcnlTdHJpbmcpIHtcbiAgICB2YXIgcGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhxdWVyeVN0cmluZylcbiAgICAgICwgX3RoaXMgPSB0aGlzXG4gICAgICAsIGRlc3QgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LnJlYWRDb29raWUoJ2xhc3RVcmwnKSkgfHwgJy8nXG5cbiAgICBpZiAocGFyYW1zLmNvZGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBVVRIOiBnZXR0aW5nIHRva2VuJylcbiAgICAgIGF1dGguZmV0Y2hUb2tlbihwYXJhbXMuY29kZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZWRpcmVjdGluZyB0bzonLCBkZXN0KVxuICAgICAgICBfdGhpcy5uYXZpZ2F0ZShkZXN0LCB7IHRyaWdnZXI6IHRydWUgfSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvZGUgcGFyYW1ldGVyIHByb3ZpZGVkJylcbiAgICAgIC8vIHRoaXMuc2lnbmluKClcbiAgICB9XG4gIH1cbiwgc2lnbmluOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKClcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBVVRIOiB0b2tlbiBleGlzdHMhJylcbiAgICAgIHRoaXMubmF2aWdhdGUoJy8nLCB7IHRyaWdnZXI6IHRydWUgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0FVVEg6IG5vIHRva2VuLCBzaWduIGluJylcbiAgICAgIGF1dGguYXV0aGVudGljYXRlKClcbiAgICB9XG4gIH1cbiwgc2lnbm91dDogZnVuY3Rpb24oKSB7XG4gICAgYXV0aC5kZXN0cm95KClcbiAgICB0aGlzLm5hdmlnYXRlKCcvJywgeyB0cmlnZ2VyOiB0cnVlIH0pXG4gIH1cbiwgdXNlcnM6IGZ1bmN0aW9uKCkge1xuICAgIG5ldyBVc2Vyc1ZpZXcoKVxuICB9XG4sIHVzZXI6IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gICAgbmV3IFVzZXJWaWV3KHsgdXNlcm5hbWU6IHVzZXJuYW1lIH0pXG4gIH1cbiwgY29tbWl0czogZnVuY3Rpb24ob3duZXIsIHJlcG8sIHNoYSwgcGF0aCkge1xuICAgIGlmICghcGF0aCkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ25vIHBhdGggZGV0ZWN0ZWQhJyk7XG4gICAgY29uc29sZS5sb2coJ2dldHRpbmcgY29tbWl0cycpXG4gICAgdmFyIGNvbW1pdHMgPSBuZXcgQ29tbWl0c0xpc3QoW10sIHtcbiAgICAgIG93bmVyOiBvd25lclxuICAgICwgcmVwbzogcmVwb1xuICAgICwgcGF0aDogcGF0aFxuICAgICwgc2hhOiBzaGFcbiAgICB9KVxuICAgIGNvbW1pdHMuZmV0Y2goe1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29tbWl0cykge1xuICAgICAgICBuZXcgQ29tbWl0c1ZpZXcoeyBjb2xsZWN0aW9uOiBjb21taXRzIH0pXG4gICAgICB9XG4gICAgLCBlcnJvcjogZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgbmV3IE5vdEZvdW5kVmlldygpLnJlbmRlcigpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuLCBub3RGb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgbmV3IE5vdEZvdW5kVmlldygpLnJlbmRlcigpXG4gIH1cbn0pXG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG4gICAgICA8cHJlIGNsYXNzPVxcXCJwcmVcXFwiPjxjb2RlIGNsYXNzPVxcXCJjb2RlXFxcIj5cIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMuZmlsZUNvbnRlbnRzKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmZpbGVDb250ZW50cyk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L2NvZGU+PC9wcmU+XFxuICAgIFwiO1xuICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbmZ1bmN0aW9uIHByb2dyYW0zKGRlcHRoMCxkYXRhKSB7XG4gIFxuICBcbiAgcmV0dXJuIFwiXFxuICAgICAgUGxlYXNlIHNlbGVjdCBhIGZpbGVcXG4gICAgXCI7XG4gIH1cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJjb21taXRcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwiaW5mb1xcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcImF1dGhvclxcXCI+XFxuICAgICAgPGltZyBzcmM9XCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5jb21taXQpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmF0dHJpYnV0ZXMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNvbW1pdHRlcikpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEuYXZhdGFyX3VybCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiIGNsYXNzPVxcXCJhdmF0YXJcXFwiPjxicj5cXG4gICAgICBAXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5jb21taXQpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmF0dHJpYnV0ZXMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmF1dGhvcikpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubG9naW4pKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIlxcbiAgICA8L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwiZGV0YWlsc1xcXCI+XFxuICAgICAgPHN0cm9uZz5NZXNzYWdlOjwvc3Ryb25nPiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbW1pdCkpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEuYXR0cmlidXRlcykpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEuY29tbWl0KSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5tZXNzYWdlKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8YnI+XFxuICAgICAgPHN0cm9uZz5EYXRlOjwvc3Ryb25nPiBcIjtcbiAgaWYgKGhlbHBlciA9IGhlbHBlcnMucHJldHR5RGF0ZSkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5wcmV0dHlEYXRlKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjxicj5cXG4gICAgICA8YSBocmVmPVwiXG4gICAgKyBlc2NhcGVFeHByZXNzaW9uKCgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5maWxlKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5ibG9iX3VybCkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPlZpZXcgb24gR2l0aHViPC9hPlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiZmlsZS1jb250ZW50c1xcXCI+XFxuICAgIFwiO1xuICBzdGFjazEgPSBoZWxwZXJzWydpZiddLmNhbGwoZGVwdGgwLCAoZGVwdGgwICYmIGRlcHRoMC5maWxlQ29udGVudHMpLCB7aGFzaDp7fSxpbnZlcnNlOnNlbGYucHJvZ3JhbSgzLCBwcm9ncmFtMywgZGF0YSksZm46c2VsZi5wcm9ncmFtKDEsIHByb2dyYW0xLCBkYXRhKSxkYXRhOmRhdGF9KTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiY29tbWl0c1xcXCI+XFxuICA8ZGl2IGlkPVxcXCJ0aW1lbGluZS1jb250YWluZXJcXFwiIGNsYXNzPVxcXCJ0aW1lbGluZS1jb250YWluZXJcXFwiPlxcbiAgICBDbGljaywgZHJhZywgYW5kIHNjcm9sbCB0aW1lbGluZSB0byBuYXZpZ2F0ZSB0aW1lbGluZSA8YSBocmVmPVxcXCIjXFxcIiBpZD1cXFwicmVzZXQtdGltZWxpbmVcXFwiPihSZXNldCB2aWV3KTwvYT5cXG4gICAgPGRpdiBpZD1cXFwidGltZWxpbmVcXFwiPjwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVxcXCJjb21taXQtbmF2XFxcIj5cXG4gICAgPGJ1dHRvbiBpZD1cXFwib2xkZXItY29tbWl0XFxcIiBjbGFzcz1cXFwiYnRuXFxcIj5PbGRlcjwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGlkPVxcXCJuZXdlci1jb21taXRcXFwiIGNsYXNzPVxcXCJidG5cXFwiPk5ld2VyPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0biB0b2dnbGUtYnV0dG9uXFxcIj5IaWRlIFRpbWVsaW5lPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0biB0b2dnbGUtYnV0dG9uXFxcIiBoaWRkZW4+U2hvdyBUaW1lbGluZTwvYnV0dG9uPlxcbiAgPC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBpZD1cXFwiY29tbWl0XFxcIj48L2Rpdj5cXG5cIjtcbiAgfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCI7XG5cblxuICBidWZmZXIgKz0gXCI8ZGl2IGNsYXNzPVxcXCJsYW5kaW5nLXBhZ2UgY29udGVudC1hcmVhXFxcIj5cXG4gIFxcbiAgPGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL3lvdVxcXCI+PGltZyBzdHlsZT1cXFwicG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IHJpZ2h0OiAwOyBib3JkZXI6IDA7XFxcIiBzcmM9XFxcImh0dHBzOi8vY2Ftby5naXRodWJ1c2VyY29udGVudC5jb20vMzY1OTg2YTEzMmNjZDZhNDRjMjNhOTE2OTAyMmMwYjVjODkwYzM4Ny82ODc0NzQ3MDczM2EyZjJmNzMzMzJlNjE2ZDYxN2E2ZjZlNjE3NzczMmU2MzZmNmQyZjY3Njk3NDY4NzU2MjJmNzI2OTYyNjI2ZjZlNzMyZjY2NmY3MjZiNmQ2NTVmNzI2OTY3Njg3NDVmNzI2NTY0NWY2MTYxMzAzMDMwMzAyZTcwNmU2N1xcXCIgYWx0PVxcXCJGb3JrIG1lIG9uIEdpdEh1YlxcXCIgZGF0YS1jYW5vbmljYWwtc3JjPVxcXCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vZ2l0aHViL3JpYmJvbnMvZm9ya21lX3JpZ2h0X3JlZF9hYTAwMDAucG5nXFxcIj48L2E+XFxuXFxuICA8aDE+R2l0IFRpbWUgTWFjaGluZTwvaDE+XFxuICA8cD5UaW1lIG1hY2hpbmUgZm9yIHlvdXIgZmlsZXMgb24gZ2l0aHViISBBbiBlYXNpZXIgd2F5IHRvIHZpZXcgdGhlIGhpc3Rvcnkgb2YgYSBzaW5nbGUgZmlsZS48L3A+XFxuICA8cD5Vc2VmdWwgZm9yIHJlbWVtYmVyaW5nIGhvdyB0aGF0IGNvbnN0YW50bHkgZXZvbHZpbmcgbWV0aG9kIHVzZWQgdG8gd29yayBvciBmaW5kaW5nIHRoYXQgbGluZSB5b3UgZGVsZXRlZCB3ZWVrcyBhZ28gYnV0IGRpZCBlbmQgdXAgbmVlZGluZyBhZnRlcmFsbC48L3A+XFxuICA8cD5cXG4gICAgPGEgaHJlZj1cXFwiL3BhdG1vb2QvaHVnZWdpZi9ibG9iL2E1NmMyM2M3Zjk1MjRmNmI3ZjcxYWUzMTZjZjFjNDMxNzgyNjZiYzIvanMvbWFpbi5qc1xcXCIgY2xhc3M9XFxcImJ0blxcXCI+XFxuICAgICAgVHJ5IGl0IVxcbiAgICA8L2E+PGJyPlxcbiAgICA8YSBocmVmPVxcXCIvcGF0bW9vZC93b2JibGUtd29ja2V0cy9ibG9iLzlmNmMwYjA3ZGNkMGRmYWUzYmI0YWYxZWEzMjE0Zjk1NzBmMDg1YmMvZ2FtZS9zdGF0ZXMvcGxheS5qc1xcXCIgY2xhc3M9XFxcImJ0blxcXCI+XFxuICAgICAgUHJpdmF0ZSBSZXBvIHRlc3RcXG4gICAgPC9hPjxicj5cXG4gICAgKE5vIGJyb3dzZXIgZXh0ZW5zaW9uIHJlcXVpcmVkKVxcbiAgPC9wPlxcblxcbiAgPGgyPlN0ZXAgMSAtIEluc3RhbGwgdGhlIENocm9tZSBleHRlbnNpb248L2gyPlxcbiAgPHA+T3RoZXIgYnJvd3NlcnMgY29taW5nIHNvb24hPC9wPlxcbiAgPHA+XFxuICAgIDxhIGhyZWY9XFxcImh0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUvZGV0YWlsL2dpdC10aW1lLW1hY2hpbmUvY2JrZWlsZmpmZ2ZsbWpob2hqa2NlY2ZiZmJpbXBta3BcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj48aW1nIHNyYz1cXFwiaW1hZ2VzL2Jyb3dzZXJfY2hyb21lLnBuZ1xcXCI+PC9hPlxcbiAgICBcXG4gIDwvcD5cXG5cXG4gIDxoMj5TdGVwIDIgLSBGaW5kIGEgZmlsZSBvbiBnaXRodWI8L2gyPlxcbiAgPHA+VGhlIGJyb3dzZXIgZXh0ZW5zaW9uIGFkZHMgYSBuZXcgYnV0dG9uIHRvIHRoZSBmaWxlIHZpZXcgb24gZ2l0aHViPC9wPlxcbiAgPHA+PGltZyBjbGFzcz1cXFwic2NyZWVuc2hvdFxcXCIgc3JjPVxcXCJpbWFnZXMvZ2l0aHViX2J1dHRvbi5wbmdcXFwiPjwvcD5cXG5cXG4gIDxoMj5TdGVwIDMgLSBUcmF2ZWwgdGhyb3VnaCB0aW1lITwvaDI+XFxuICA8cD5XYXRjaCBsaW5lcyBvZiBjb2RlIGNoYW5nZSB3aXRoIGVhY2ggY29tbWl0ITwvcD5cXG4gIDxwPjxpbWcgY2xhc3M9XFxcInNjcmVlbnNob3RcXFwiIHNyYz1cXFwiaW1hZ2VzL3RpbWVfbWFjaGluZV9leGFtcGxlLnBuZ1xcXCI+PC9wPlxcblxcbiAgPHA+Q3JlYXRlZCBieSA8YSBocmVmPVxcXCJodHRwOi8vcGF0bW9vZHkuY29tXFxcIj5AcGF0bW9vZDwvYT48L3A+XFxuPC9kaXY+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiY29udGVudC1hcmVhXFxcIj5cXG4gIDxoMj5Ob3QgRm91bmQ8L2gyPlxcbiAgPHA+V2UgY291bGRuJ3QgZmluZCB0aGUgY29udGVudCB5b3Ugd2VyZSBsb29raW5nIGZvci4gVGhpcyBjb3VsZCBiZSBiZWNhdXNlIHRoZSByZXBvc2l0b3J5IGlzIHByaXZhdGUuIFBsZWFzZSBzaWduIGluIGFuZCBhdXRob3JpemUgdGhlIHRpbWUgbWFjaGluZSBhcHAgdG8gdmlldyB5b3VyIHByaXZhdGUgcmVwb3MuPC9wPlxcbiAgPHA+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcInNpZ25pbiBidG5cXFwiPlNpZ24gSW48L2J1dHRvbj5cXG4gIDwvcD5cXG4gIDxwPklmIHlvdSB0aGluayB0aGlzIGlzIGEgcHJvYmxlbSB3aXRoIHRoZSBzaXRlLCBwbGVhc2UgPGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL3BhdG1vb2QvZ2l0LXRpbWUtbWFjaGluZS9pc3N1ZXNcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj5jcmVhdGUgYW4gaXNzdWU8L2E+IGRldGFpbGluZyBob3cgdG8gcmVwbGljYXRlIHRoZSBpc3N1ZS48L3A+XFxuXFxuICA8cD5UaGFua3MhPC9wPlxcbjwvZGl2PlxcblwiO1xuICB9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPHA+VXNlciBJRDogXCI7XG4gIGlmIChoZWxwZXIgPSBoZWxwZXJzLmlkKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmlkKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvcD5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8aDE+SGVsbG8gSm9lPC9oMj5cXG5cIjtcbiAgfSk7XG4iLCJ2YXIgQ29tbWl0ID0gcmVxdWlyZSgnLi4vbW9kZWxzL2NvbW1pdCcpXG52YXIgQ29udGVudCA9IHJlcXVpcmUoJy4uL21vZGVscy9jb250ZW50JylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gIGVsOiAnI2NvbW1pdCdcbiwgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jb21taXQnKVxuLCBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRzKSB7XG4gICAgdGhpcy5wYXRoID0gb3B0cy5wYXRoXG4gICAgdGhpcy5nZXRGaWxlTGlzdCgpXG4gIH1cbiwgZ2V0RmlsZUxpc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXNcbiAgICBpZiAodGhpcy5tb2RlbC5nZXQoJ2ZpbGVzJykpIHtcbiAgICAgIHRoaXMuZ2V0Q29udGVudHMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1vZGVsLmZldGNoKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuZ2V0Q29udGVudHMoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuLCBnZXRDb250ZW50czogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucGF0aCkge1xuICAgICAgLy8gR2V0IGNvbnRlbnRzIGhlcmVcbiAgICAgIHZhciBwYXRoID0gdGhpcy5wYXRoXG4gICAgICAgICwgX3RoaXMgPSB0aGlzXG4gICAgICAgICwgZmlsZSA9IF8uZmluZFdoZXJlKHRoaXMubW9kZWwuZ2V0KCdmaWxlcycpLCB7IGZpbGVuYW1lOiBwYXRoIH0pXG4gICAgICAgICwgY29udGVudCA9IG5ldyBDb250ZW50KGZpbGUpXG5cbiAgICAgIHRoaXMuZmlsZSA9IGZpbGVcblxuICAgICAgY29udGVudC5mZXRjaCh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGNvbnRlbnQpIHtcbiAgICAgICAgICB2YXIgY29udGVudFN0cmluZyA9IGF0b2IoY29udGVudC5hdHRyaWJ1dGVzLmNvbnRlbnQpXG4gICAgICAgICAgX3RoaXMucmVuZGVyKGNvbnRlbnRTdHJpbmcpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyKClcbiAgICB9XG4gIH1cbiwgcmVuZGVyOiBmdW5jdGlvbihmaWxlQ29udGVudHMpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmZpbGUpXG4gICAgd2luZG93LkFwcC5yb3V0ZXIubmF2aWdhdGUodGhpcy5wZXJtYWxpbmsoKSlcbiAgICAkKHRoaXMuZWwpLmh0bWwodGhpcy50ZW1wbGF0ZSh7XG4gICAgICBjb21taXQ6IHRoaXMubW9kZWxcbiAgICAsIGZpbGU6IHRoaXMuZmlsZVxuICAgICwgZmlsZUNvbnRlbnRzOiBmaWxlQ29udGVudHNcbiAgICAsIHByZXR0eURhdGU6IG1vbWVudCh0aGlzLm1vZGVsLmdldCgnY29tbWl0JykuYXV0aG9yLmRhdGUpLmZvcm1hdCgnTU1NTSBEbyBZWVlZLCBoOm1tIGEnKVxuICAgIH0pKVxuICAgICQoJ3ByZSBjb2RlJykuZWFjaChmdW5jdGlvbihpLCBibG9jaykge1xuICAgICAgaGxqcy5oaWdobGlnaHRCbG9jayhibG9jaylcbiAgICB9KVxuXG4gICAgdGhpcy5hZGRMaW5lTnVtYmVycygpXG4gIH1cbiwgYWRkTGluZU51bWJlcnM6IGZ1bmN0aW9uKCkge1xuICAgICQoJ3ByZSBjb2RlJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbGluZXMgPSAkKHRoaXMpLnRleHQoKS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMVxuICAgICAgICB2YXIgJG51bWJlcmluZyA9ICQoJzx1bC8+JykuYWRkQ2xhc3MoJ3ByZS1udW1iZXJpbmcnKVxuICAgICAgICAkKHRoaXMpXG4gICAgICAgICAgLmFkZENsYXNzKCdoYXMtbnVtYmVyaW5nJylcbiAgICAgICAgICAucGFyZW50KClcbiAgICAgICAgICAuYXBwZW5kKCRudW1iZXJpbmcpXG4gICAgICAgIGZvcihpID0gMTsgaSA8PSBsaW5lczsgaSsrICl7XG4gICAgICAgICAgJG51bWJlcmluZy5hcHBlbmQoJCgnPGxpLz4nKS50ZXh0KGkpKVxuICAgICAgICB9XG4gICAgfSlcbiAgfVxuLCBwZXJtYWxpbms6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBodG1sX3BhdGggPSB0aGlzLm1vZGVsLmdldCgnaHRtbF91cmwnKS5tYXRjaCgvZ2l0aHViLmNvbSguKykkLylbMV1cbiAgICByZXR1cm4gaHRtbF9wYXRoLnJlcGxhY2UoJ2NvbW1pdCcsICdibG9iJykgKyAnLycgKyB0aGlzLnBhdGhcbiAgfVxufSlcblxuIiwidmFyIENvbW1pdFZpZXcgPSByZXF1aXJlKCcuL2NvbW1pdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICBlbDogJyNjb250ZW50J1xuLCB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vdGVtcGxhdGVzL2NvbW1pdHMnKVxuLCBpbml0aWFsaXplOiBmdW5jdGlvbihvcHRzKSB7XG4gICAgLy8gVE9ETzogc2V0IHRoZSBpbml0aWFsIGNvbW1pdCB0byB0aGUgdXJsIHNoYSBpZiBpdCBleGlzdHMsIHRoZW4gbWFrZSB0aGUgc2hhIG51bGxcbiAgICB0aGlzLmNvbW1pdCA9IHRoaXMuY29sbGVjdGlvbi5hdCgwKVxuICAgIHRoaXMucmVuZGVyKClcbiAgICB0aGlzLm5ld2VzdENvbW1pdCA9IG51bGxcbiAgICB0aGlzLm9sZGVzdENvbW1pdCA9IG51bGxcbiAgfVxuLCBldmVudHM6IHtcbiAgICAnY2xpY2sgI29sZGVyLWNvbW1pdCc6ICdvbGRlckNvbW1pdCdcbiAgLCAnY2xpY2sgI25ld2VyLWNvbW1pdCc6ICduZXdlckNvbW1pdCdcbiAgLCAnY2xpY2sgI3Jlc2V0LXRpbWVsaW5lJzogJ3Jlc2V0VGltZWxpbmVXaW5kb3cnXG4gICwgJ2NsaWNrIC50b2dnbGUtYnV0dG9uJzogJ3RvZ2dsZVRpbWVsaW5lJ1xuICB9XG4sIG9sZGVyQ29tbWl0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dENvbW0gPSB0aGlzLmNvbW1pdC5ueHQoKVxuICAgIGlmICh0aGlzLmNvbW1pdCA9PT0gdGhpcy5jb21taXQubnh0KCkgJiYgbmV4dENvbW0gIT0gdGhpcy5vbGRlc3RDb21taXQpIHtcbiAgICAgIHRoaXMuZmV0Y2hPbGRlcigpXG4gICAgICB0aGlzLm9sZGVzdENvbW1pdCA9IHRoaXMuY29tbWl0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWl0ID0gdGhpcy5jb21taXQubnh0KClcbiAgICAgIHRoaXMucmVuZGVyQ29tbWl0KClcbiAgICB9XG4gIH1cbiwgbmV3ZXJDb21taXQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcmV2Q29tbSA9IHRoaXMuY29tbWl0LnByZXYoKVxuICAgIGlmICh0aGlzLmNvbW1pdCA9PT0gcHJldkNvbW0gJiYgcHJldkNvbW0gIT0gdGhpcy5uZXdlc3RDb21taXQpIHtcbiAgICAgIHRoaXMuZmV0Y2hOZXdlcigpXG4gICAgICB0aGlzLm5ld2VzdENvbW1pdCA9IHRoaXMuY29tbWl0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWl0ID0gcHJldkNvbW1cbiAgICAgIHRoaXMucmVuZGVyQ29tbWl0KClcbiAgICB9XG4gIH1cbiwgZmV0Y2hPbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb2xsZWN0aW9uLnNoYSA9IHRoaXMuY29tbWl0LmdldCgnc2hhJylcbiAgICB0aGlzLmNvbGxlY3Rpb24udW50aWwgPSB0aGlzLmNvbW1pdC5nZXQoJ2NvbW1pdCcpLmNvbW1pdHRlci5kYXRlXG4gICAgdGhpcy5mZXRjaE1vcmUodGhpcy5vbGRlckNvbW1pdC5iaW5kKHRoaXMpKVxuICB9XG4sIGZldGNoTmV3ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29sbGVjdGlvbi5zaGEgPSB0aGlzLmNvbW1pdC5nZXQoJ3NoYScpXG4gICAgdGhpcy5jb2xsZWN0aW9uLnNpbmNlID0gdGhpcy5jb21taXQuZ2V0KCdjb21taXQnKS5jb21taXR0ZXIuZGF0ZVxuICAgIHRoaXMuZmV0Y2hNb3JlKHRoaXMubmV3ZXJDb21taXQuYmluZCh0aGlzKSlcbiAgfVxuLCBmZXRjaE1vcmU6IGZ1bmN0aW9uKG5leHQpIHtcbiAgICAvLyBUT0RPOiBQcmV2ZW50IHRoZSBzYW1lIGNvbW1pdCBjb21pbmcgYmFjayBvdmVyIGFuZCBvdmVyIGFnYWluXG4gICAgY29uc29sZS5sb2coJ2ZldGNoaW5nIG1vcmUgY29tbWl0cycpXG4gICAgdmFyIF90aGlzID0gdGhpc1xuICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih0b3VjaGVkKSB7XG4gICAgICAgIF90aGlzLmNvbGxlY3Rpb24uc2luY2UgPSBudWxsXG4gICAgICAgIF90aGlzLmNvbGxlY3Rpb24udW50aWwgPSBudWxsXG5cbiAgICAgICAgLy8gVE9ETzogUHJldmVudCBwYWdlIHBvc2l0aW9uIGZyb20gY2hhbmdpbmcgYWZ0ZXIgcmUtcmVuZGVyaW5nIGZ1bGwgdGVtcGxhdGVcbiAgICAgICAgX3RoaXMucmVuZGVyKClcbiAgICAgICAgbmV4dCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuLCBnb1RvQ29tbWl0OiBmdW5jdGlvbihzaGEpIHtcbiAgICB0aGlzLmNvbW1pdCA9IHRoaXMuY29sbGVjdGlvbi5maW5kV2hlcmUoe3NoYTogc2hhfSlcbiAgICB0aGlzLnJlbmRlckNvbW1pdCgpXG4gIH1cbiwgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMuZWwpLmh0bWwodGhpcy50ZW1wbGF0ZSh0aGlzLmNvbGxlY3Rpb24pKVxuICAgIHRoaXMuY29sbGVjdGlvbi5yZW1vdmVEdXBzKClcbiAgICB0aGlzLnJlbmRlclRpbWVsaW5lKClcbiAgICB0aGlzLnJlbmRlckNvbW1pdCgpXG4gIH1cbiwgcmVuZGVyQ29tbWl0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuY29tbWl0KSBjb25zb2xlLmVycm9yKCdObyBjb21taXQgZm91bmQhJylcbiAgICBuZXcgQ29tbWl0Vmlldyh7IG1vZGVsOiB0aGlzLmNvbW1pdCwgcGF0aDogdGhpcy5jb2xsZWN0aW9uLnBhdGggfSlcbiAgICB0aGlzLnRpbWVsaW5lLnNldFNlbGVjdGlvbih0aGlzLmNvbW1pdC5nZXQoJ3NoYScpKVxuICAgIHRoaXMucmVzZXRDb21taXRIZWlnaHQoKVxuICB9XG5cbiAgLy9UT0RPOiBtb3ZlIHRoaXMgdG8gYSBuZXcgdmlldz9cbiwgcmVuZGVyVGltZWxpbmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXNcblxuICAgIC8vIEdldCBkYXRlIGxpbWl0cyB0byByZXN0cmljdCB0aGUgdGltZWxpbmVcbiAgICB2YXIgbWluID0gdGhpcy5jb2xsZWN0aW9uLm1pbihmdW5jdGlvbihjb21taXQpIHtcbiAgICAgIHJldHVybiBjb21taXQuZGF0ZSgpXG4gICAgfSlcbiAgICB2YXIgbWF4ID0gdGhpcy5jb2xsZWN0aW9uLm1heChmdW5jdGlvbihjb21taXQpIHtcbiAgICAgIHJldHVybiBjb21taXQuZGF0ZSgpXG4gICAgfSlcblxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZWxpbmUnKVxuICAgICAgLCBkYXRhID0gbmV3IHZpcy5EYXRhU2V0KClcbiAgICAgICwgb3B0aW9ucyA9IHtcbiAgICAgICAgICBoZWlnaHQ6IDIyMFxuICAgICAgICAvL1RPRE86IHNldCBzYW5lIHJhbmdlcyB0aGF0IGRvbnQgY3V0IG9mZiB0aGUgbGFiZWxzXG4gICAgICAgIC8vICwgbWF4OiBuZXcgRGF0ZShtYXguZGF0ZSgpLnNldERhdGUobWluLmRhdGUoKS5nZXREYXRlKCkgKyAyKSlcbiAgICAgICAgLy8gLCBtaW46IG5ldyBEYXRlKG1pbi5kYXRlKCkuc2V0RGF0ZShtaW4uZGF0ZSgpLmdldERhdGUoKSAtIDIpKVxuICAgICAgICB9XG5cbiAgICB0aGlzLmNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbihjb21taXQpIHtcbiAgICAgIHZhciBtc2cgPSBjb21taXQuZ2V0KCdjb21taXQnKS5tZXNzYWdlXG4gICAgICBpZiAobXNnLmxlbmd0aCA+PSAyMCkgbXNnID0gbXNnLnNsaWNlKDAsIDE3KSArICcuLi4nXG4gICAgICBkYXRhLmFkZCh7XG4gICAgICAgIGlkOiBjb21taXQuZ2V0KCdzaGEnKVxuICAgICAgLCBjb250ZW50OiBtc2dcbiAgICAgICwgc3RhcnQ6IG5ldyBEYXRlKGNvbW1pdC5nZXQoJ2NvbW1pdCcpLmNvbW1pdHRlci5kYXRlKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy50aW1lbGluZSA9IG5ldyB2aXMuVGltZWxpbmUoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKVxuXG4gICAgLy8gYWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgdGhpcy50aW1lbGluZS5vbignc2VsZWN0JywgZnVuY3Rpb24ocHJvcGVydGllcykge1xuICAgICAgdGhpcy5mb2N1cyhwcm9wZXJ0aWVzLml0ZW1zWzBdKVxuICAgICAgX3RoaXMuZ29Ub0NvbW1pdChwcm9wZXJ0aWVzLml0ZW1zWzBdKVxuICAgIH0pXG4gIH1cbiwgcmVzZXRUaW1lbGluZVdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aW1lbGluZS5maXQoKVxuICB9XG4sIHRvZ2dsZVRpbWVsaW5lOiBmdW5jdGlvbigpIHtcbiAgICAkKCcjdGltZWxpbmUtY29udGFpbmVyJykudG9nZ2xlQ2xhc3MoJ2hpZGUtYW5pbWF0ZScpXG4gICAgJCgnLnZpcy50aW1lbGluZScpLnRvZ2dsZUNsYXNzKCdmYWRlLWFuaW1hdGUnKVxuICAgICQoJy50b2dnbGUtYnV0dG9uJykudG9nZ2xlKClcbiAgICBzZXRUaW1lb3V0KHRoaXMucmVzZXRDb21taXRIZWlnaHQsIDMwMClcbiAgfVxuXG4sIHJlc2V0Q29tbWl0SGVpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaWRlYWxIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKCcjY29tbWl0Jykub2Zmc2V0KCkudG9wIC0gMTBcbiAgICAkKCcjY29tbWl0JykuY3NzKCdoZWlnaHQnLCBpZGVhbEhlaWdodClcbiAgfVxufSlcblxuIiwibW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gIHRlbXBsYXRlOiByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvaW5kZXgnKVxuLCBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbmRlcigpXG4gIH1cbiwgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMuZWwpLmh0bWwodGhpcy50ZW1wbGF0ZSgpKVxuICB9XG5cbn0pXG4iLCJ2YXIgYXV0aCA9IHJlcXVpcmUoJy4uL2xpYi9hdXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gIGVsOiAnI2NvbnRlbnQnXG4sIHRlbXBsYXRlOiByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvbm90X2ZvdW5kJylcbiwgZXZlbnRzOiB7XG4gICAgJ2NsaWNrIC5zaWduaW4nOiAnYXV0aGVudGljYXRlJ1xuICB9XG4sIGF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oKSB7XG4gICAgYXV0aC5hdXRoZW50aWNhdGUoKVxuICB9XG4sIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgJCh0aGlzLmVsKS5odG1sKHRoaXMudGVtcGxhdGUoKSlcbiAgfVxufSlcbiIsInZhciBVc2VyID0gcmVxdWlyZSgnLi4vbW9kZWxzL3VzZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgZWw6ICcjY29udGVudCdcbiwgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy91c2VyJylcbiwgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXNcbiAgICAgLCB1c2VyID0gbmV3IFVzZXIob3B0cylcbiAgICB1c2VyLmZldGNoKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgX3RoaXMucmVuZGVyKHVzZXIuYXR0cmlidXRlcylcbiAgICAgIH1cbiAgICB9KVxuICB9XG4sIHJlbmRlcjogZnVuY3Rpb24odXNlcikge1xuICAgIGNvbnNvbGUubG9nKHVzZXIuYXR0cmlidXRlcylcbiAgICAkKHRoaXMuZWwpLmh0bWwodGhpcy50ZW1wbGF0ZSh1c2VyKSlcbiAgfVxufSlcbiIsIm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICBlbDogJyNjb250ZW50J1xuLCB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3VzZXJzJylcbiwgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICB9XG4sIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdHMgPSB7fVxuICAgICQodGhpcy5lbCkuaHRtbCh0aGlzLnRlbXBsYXRlKVxuICB9XG5cbn0pXG4iXX0=
