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
    var token = window.readCookie('token')
    return token || this.authenticate()
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
    , headers: {'Authorization' :'token ' + auth.getToken() }
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
    , headers: {'Authorization' :'token ' + auth.getToken() }
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
      headers: {'Authorization' :'token ' + auth.getToken() }
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
var auth = require('./lib/auth')

// MODELS
var Commit = require('./models/commit')
var CommitsList = require('./models/commits_collection')

// VIEWS
var IndexView = require('./views/index_view')
var UserView = require('./views/user')
var UsersView = require('./views/users')
var CommitView = require('./views/commit')
var CommitsView = require('./views/commits')

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index'
  , 'auth(/)(?*queryString)': 'auth'
  , 'signin(/)': 'signin'
  , 'signout(/)': 'signout'
  , 'users/:username(/)': 'user'
  , 'users(/)': 'users'
  , ':owner/:repo/blob/:sha/*path': 'commits'
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
    if (auth.checkUser()) {
      if (!path) return console.error('no path detected!');
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
      })
    }
  }
})

},{"./helpers":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/helpers.js","./lib/auth":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/lib/auth.js","./models/commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commit.js","./models/commits_collection":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/models/commits_collection.js","./views/commit":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commit.js","./views/commits":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/commits.js","./views/index_view":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/index_view.js","./views/user":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/user.js","./views/users":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/users.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/commit.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <pre class=\"pre\"><code class=\"code\">";
  if (helper = helpers.fileContents) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.fileContents); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</code></pre>\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n  Please select a file\n";
  }

  buffer += "<p>\n  <strong>Index:</strong> "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.cid)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "<br>\n  <strong>Sha:</strong> "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.sha)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "<br>\n  <strong>Message:</strong> "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.commit)),stack1 == null || stack1 === false ? stack1 : stack1.message)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "<br>\n  <strong>Date:</strong> "
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.commit)),stack1 == null || stack1 === false ? stack1 : stack1.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.commit)),stack1 == null || stack1 === false ? stack1 : stack1.committer)),stack1 == null || stack1 === false ? stack1 : stack1.date)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "<br>\n</p>\n";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fileContents), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/commits.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"commit-controls\">\n  Click, drag, and scroll timeline to navigate timeline <a href=\"#\" id=\"reset-timeline\">(Reset view)</a>\n  <div id=\"timeline\"></div>\n  <div class=\"commit-nav\">\n    <button id=\"older-commit\">Older</button>\n    <button id=\"newer-commit\">Newer</button>\n  </div>\n</div>\n<div id=\"commit\"></div>\n";
  });

},{"hbsfy/runtime":"/Users/patrickmoody/Dev/github-time-machine/node_modules/hbsfy/runtime.js"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/index.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var Handlebars = require('hbsfy/runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h2>Git Time Machine</h2>\n<p>Time machine for your files on github! An easier way to view the history of a single file.</p>\n<p>Useful for remembering \"how that method used to work\" or finding \"that line you deleted weeks ago but did end up needing afterall\"</p>\n<a href=\"signin\">Sign in with GitHub</a><br>\n<a href=\"signout\">Signout</a>\n\n<h3>Step 1 - Install browser extension</h3>\n<p>Extensions coming soon!</p>\n<p><img src=\"images/browser_chrome.png\"></p>\n\n<h3>Step 2 - Find a file on github</h3>\n<p>The browser extension adds a new button to the file view</p>\n<p><img src=\"images/github_button.png\"></p>\n\n<h3>Step 3 - Travel through time!</h3>\n<p>Watch lines of code change with each commit!</p>\n<p><img src=\"images/time_machine_example.png\"></p>\n\n<h3>Example:</h3>\n<p>\n  One commit for a file: <a href=\"/patmood/hugegif/blob/a56c23c7f9524f6b7f71ae316cf1c43178266bc2/js/main.js\">/patmood/hugegif/blob/a56c23c7f9524f6b7f71ae316cf1c43178266bc2/js/main.js</a>\n</p>\n";
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
    window.App.router.navigate(this.permalink())
    $(this.el).html(this.template({ commit: this.model, fileContents: fileContents}))
    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block)
    })

    //Set a good height
    var idealHeight = $(window).height() - $('#commit').offset().top
    $(this.el).css('height', idealHeight)

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

},{"../templates/index":"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/templates/index.hbs"}],"/Users/patrickmoody/Dev/github-time-machine/src/javascripts/views/user.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4vc3JjL2phdmFzY3JpcHRzL2FwcC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvZXhjZXB0aW9uLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9oYnNmeS9ydW50aW1lLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvaGVscGVycy5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL2xpYi9hdXRoLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvbW9kZWxzL2NvbW1pdC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL21vZGVscy9jb21taXRzX2NvbGxlY3Rpb24uanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy9tb2RlbHMvY29udGVudC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL21vZGVscy91c2VyLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvcm91dGVyLmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdGVtcGxhdGVzL2NvbW1pdC5oYnMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy90ZW1wbGF0ZXMvY29tbWl0cy5oYnMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy90ZW1wbGF0ZXMvaW5kZXguaGJzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdGVtcGxhdGVzL3VzZXIuaGJzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdGVtcGxhdGVzL3VzZXJzLmhicyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL3ZpZXdzL2NvbW1pdC5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL3ZpZXdzL2NvbW1pdHMuanMiLCIvVXNlcnMvcGF0cmlja21vb2R5L0Rldi9naXRodWItdGltZS1tYWNoaW5lL3NyYy9qYXZhc2NyaXB0cy92aWV3cy9pbmRleF92aWV3LmpzIiwiL1VzZXJzL3BhdHJpY2ttb29keS9EZXYvZ2l0aHViLXRpbWUtbWFjaGluZS9zcmMvamF2YXNjcmlwdHMvdmlld3MvdXNlci5qcyIsIi9Vc2Vycy9wYXRyaWNrbW9vZHkvRGV2L2dpdGh1Yi10aW1lLW1hY2hpbmUvc3JjL2phdmFzY3JpcHRzL3ZpZXdzL3VzZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwid2luZG93LkFwcCA9IHt9XG53aW5kb3cuY29va2llcyA9IHt9XG5cbnZhciBSb3V0ZXIgPSByZXF1aXJlKCcuL3JvdXRlcicpXG53aW5kb3cucmVhZENvb2tpZSA9IHJlcXVpcmUoJy4vaGVscGVycycpLnJlYWRDb29raWVcblxud2luZG93LkFwcC5yb3V0ZXIgPSBuZXcgUm91dGVyKClcblxuXG5CYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KHsgcHVzaFN0YXRlOiB0cnVlIH0pXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qZ2xvYmFscyBIYW5kbGViYXJzOiB0cnVlICovXG52YXIgYmFzZSA9IHJlcXVpcmUoXCIuL2hhbmRsZWJhcnMvYmFzZVwiKTtcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbnZhciBTYWZlU3RyaW5nID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9zYWZlLXN0cmluZ1wiKVtcImRlZmF1bHRcIl07XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9leGNlcHRpb25cIilbXCJkZWZhdWx0XCJdO1xudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy91dGlsc1wiKTtcbnZhciBydW50aW1lID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9ydW50aW1lXCIpO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbnZhciBjcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcblxuICBoYi5WTSA9IHJ1bnRpbWU7XG4gIGhiLnRlbXBsYXRlID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59O1xuXG52YXIgSGFuZGxlYmFycyA9IGNyZWF0ZSgpO1xuSGFuZGxlYmFycy5jcmVhdGUgPSBjcmVhdGU7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gSGFuZGxlYmFyczsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoXCIuL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBWRVJTSU9OID0gXCIxLjMuMFwiO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjt2YXIgQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuZXhwb3J0cy5DT01QSUxFUl9SRVZJU0lPTiA9IENPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5leHBvcnRzLkhhbmRsZWJhcnNFbnZpcm9ubWVudCA9IEhhbmRsZWJhcnNFbnZpcm9ubWVudDtIYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGludmVyc2UgfHwgZm4pIHsgdGhyb3cgbmV3IEV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsICBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBpZihjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEuaW5kZXggPSBpO1xuICAgICAgICAgICAgZGF0YS5maXJzdCA9IChpID09PSAwKTtcbiAgICAgICAgICAgIGRhdGEubGFzdCAgPSAoaSA9PT0gKGNvbnRleHQubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtpXSwgeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBpZihkYXRhKSB7IFxuICAgICAgICAgICAgICBkYXRhLmtleSA9IGtleTsgXG4gICAgICAgICAgICAgIGRhdGEuaW5kZXggPSBpO1xuICAgICAgICAgICAgICBkYXRhLmZpcnN0ID0gKGkgPT09IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKGkgPT09IDApe1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAoIVV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIGNvbnRleHQpO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAzLFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG5mdW5jdGlvbiBsb2cobGV2ZWwsIG9iaikgeyBsb2dnZXIubG9nKGxldmVsLCBvYmopOyB9XG5cbmV4cG9ydHMubG9nID0gbG9nO3ZhciBjcmVhdGVGcmFtZSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICB2YXIgb2JqID0ge307XG4gIFV0aWxzLmV4dGVuZChvYmosIG9iamVjdCk7XG4gIHJldHVybiBvYmo7XG59O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsaW5lO1xuICBpZiAobm9kZSAmJiBub2RlLmZpcnN0TGluZSkge1xuICAgIGxpbmUgPSBub2RlLmZpcnN0TGluZTtcblxuICAgIG1lc3NhZ2UgKz0gJyAtICcgKyBsaW5lICsgJzonICsgbm9kZS5maXJzdENvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAobGluZSkge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBub2RlLmZpcnN0Q29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBFeGNlcHRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKFwiLi9leGNlcHRpb25cIilbXCJkZWZhdWx0XCJdO1xudmFyIENPTVBJTEVSX1JFVklTSU9OID0gcmVxdWlyZShcIi4vYmFzZVwiKS5DT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0gcmVxdWlyZShcIi4vYmFzZVwiKS5SRVZJU0lPTl9DSEFOR0VTO1xuXG5mdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICB2YXIgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IENPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitjb21waWxlckluZm9bMV0rXCIpLlwiKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjsvLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGVcIik7XG4gIH1cblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICB2YXIgaW52b2tlUGFydGlhbFdyYXBwZXIgPSBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgICBpZiAoZW52LmNvbXBpbGUpIHtcbiAgICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgeyBkYXRhOiBkYXRhICE9PSB1bmRlZmluZWQgfSwgZW52KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfVxuICB9O1xuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIHZhciBjb250YWluZXIgPSB7XG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICBpZihkYXRhKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gcHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBwcm9ncmFtKGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIChwYXJhbSAhPT0gY29tbW9uKSkge1xuICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgVXRpbHMuZXh0ZW5kKHJldCwgY29tbW9uKTtcbiAgICAgICAgVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIHByb2dyYW1XaXRoRGVwdGg6IGVudi5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogbnVsbFxuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMucGFydGlhbCA/IG9wdGlvbnMgOiBlbnYsXG4gICAgICAgIGhlbHBlcnMsXG4gICAgICAgIHBhcnRpYWxzO1xuXG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBwYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChcbiAgICAgICAgICBjb250YWluZXIsXG4gICAgICAgICAgbmFtZXNwYWNlLCBjb250ZXh0LFxuICAgICAgICAgIGhlbHBlcnMsXG4gICAgICAgICAgcGFydGlhbHMsXG4gICAgICAgICAgb3B0aW9ucy5kYXRhKTtcblxuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBlbnYuVk0uY2hlY2tSZXZpc2lvbihjb250YWluZXIuY29tcGlsZXJJbmZvKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7ZnVuY3Rpb24gcHJvZ3JhbVdpdGhEZXB0aChpLCBmbiwgZGF0YSAvKiwgJGRlcHRoICovKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICB2YXIgcHJvZyA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gIH07XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmV4cG9ydHMucHJvZ3JhbVdpdGhEZXB0aCA9IHByb2dyYW1XaXRoRGVwdGg7ZnVuY3Rpb24gcHJvZ3JhbShpLCBmbiwgZGF0YSkge1xuICB2YXIgcHJvZyA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YSk7XG4gIH07XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0cy5wcm9ncmFtID0gcHJvZ3JhbTtmdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gIHZhciBvcHRpb25zID0geyBwYXJ0aWFsOiB0cnVlLCBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtmdW5jdGlvbiBub29wKCkgeyByZXR1cm4gXCJcIjsgfVxuXG5leHBvcnRzLm5vb3AgPSBub29wOyIsIlwidXNlIHN0cmljdFwiO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJcIiArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTYWZlU3RyaW5nOyIsIlwidXNlIHN0cmljdFwiO1xuLypqc2hpbnQgLVcwMDQgKi9cbnZhciBTYWZlU3RyaW5nID0gcmVxdWlyZShcIi4vc2FmZS1zdHJpbmdcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiwgdmFsdWUpIHtcbiAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpIHtcbiAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7dmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmV4cG9ydHMudG9TdHJpbmcgPSB0b1N0cmluZztcbi8vIFNvdXJjZWQgZnJvbSBsb2Rhc2hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9sb2Rhc2gvYmxvYi9tYXN0ZXIvTElDRU5TRS50eHRcbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG4vLyBmYWxsYmFjayBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmlcbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBTYWZlU3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICB9IGVsc2UgaWYgKCFzdHJpbmcgJiYgc3RyaW5nICE9PSAwKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cblxuICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICBzdHJpbmcgPSBcIlwiICsgc3RyaW5nO1xuXG4gIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO2Z1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnRzLmlzRW1wdHkgPSBpc0VtcHR5OyIsIi8vIENyZWF0ZSBhIHNpbXBsZSBwYXRoIGFsaWFzIHRvIGFsbG93IGJyb3dzZXJpZnkgdG8gcmVzb2x2ZVxuLy8gdGhlIHJ1bnRpbWUgb24gYSBzdXBwb3J0ZWQgcGF0aC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUnKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgcGFyc2VRdWVyeVN0cmluZzogZnVuY3Rpb24ocXVlcnlTdHJpbmcpe1xuICAgIHZhciBwYXJhbXMgPSB7fVxuICAgIGlmKHF1ZXJ5U3RyaW5nKXtcbiAgICAgIF8uZWFjaChcbiAgICAgICAgXy5tYXAoZGVjb2RlVVJJKHF1ZXJ5U3RyaW5nKS5zcGxpdCgvJi9nKSxmdW5jdGlvbihlbCxpKXtcbiAgICAgICAgICB2YXIgYXV4ID0gZWwuc3BsaXQoJz0nKSwgbyA9IHt9XG4gICAgICAgICAgaWYoYXV4Lmxlbmd0aCA+PSAxKXtcbiAgICAgICAgICAgIHZhciB2YWwgPSB1bmRlZmluZWRcbiAgICAgICAgICAgIGlmKGF1eC5sZW5ndGggPT0gMilcbiAgICAgICAgICAgICAgdmFsID0gYXV4WzFdXG4gICAgICAgICAgICBvW2F1eFswXV0gPSB2YWxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG9cbiAgICAgIH0pLFxuICAgICAgICBmdW5jdGlvbihvKXtcbiAgICAgICAgICBfLmV4dGVuZChwYXJhbXMsbylcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuLCByZWFkQ29va2llOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICh3aW5kb3cuY29va2llc1tuYW1lXSkgcmV0dXJuIHdpbmRvdy5jb29raWVzW25hbWVdO1xuXG4gICAgYyA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpXG4gICAgY29va2llcyA9IHt9XG5cblxuICAgIGMuZm9yRWFjaChmdW5jdGlvbihjb29raWUpIHtcbiAgICAgIHZhciBDID0gY29va2llLnNwbGl0KCc9JylcbiAgICAgIHdpbmRvdy5jb29raWVzW0NbMF0udHJpbSgpXSA9IENbMV1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHdpbmRvdy5jb29raWVzW25hbWVdXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBmZXRjaFRva2VuOiBmdW5jdGlvbihjb2RlLCBuZXh0KSB7XG4gICAgdmFyIF90aGlzID0gdGhpc1xuICAgICQuZ2V0SlNPTignL2F1dGhlbnRpY2F0ZS8nICsgY29kZSwgZnVuY3Rpb24oanNvbikge1xuICAgICAgX3RoaXMuc2V0VG9rZW4oanNvbi50b2tlbilcbiAgICAgIG5leHQoKVxuICAgIH0pXG4gIH1cbiwgc2V0VG9rZW46IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpXG4gICAgd2luZG93LmNvb2tpZXMudG9rZW4gPSB0b2tlblxuICAgIC8vIFNldCAxIGRheSBleHBpcnk/XG4gICAgZG9jdW1lbnQuY29va2llID0gJ3Rva2VuPScgKyB0b2tlbiArICc7IGV4cGlyZXM9JyArIGQuc2V0RGF0ZShkLmdldERhdGUoKSArIDEpICsgJzsgcGF0aD0vJ1xuICB9XG4sIGdldFRva2VuOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRva2VuID0gd2luZG93LnJlYWRDb29raWUoJ3Rva2VuJylcbiAgICByZXR1cm4gdG9rZW4gfHwgdGhpcy5hdXRoZW50aWNhdGUoKVxuICB9XG4sIGF1dGhlbnRpY2F0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpXG4gICAgICAsIHJlZyA9IG5ldyBSZWdFeHAoJ14uKycgKyB3aW5kb3cubG9jYXRpb24uaG9zdClcbiAgICAgICwgdXJsUGF0aCA9IGVuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKS5yZXBsYWNlKHJlZywgJycpKVxuXG4gICAgZG9jdW1lbnQuY29va2llID0gJ2xhc3RVcmw9JyArIHVybFBhdGggKyAnOyBwYXRoPS8nXG4gICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoJy9hdXRoZW50aWNhdGUnKVxuICB9XG4sIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5jb29raWVzID0ge31cbiAgICBkb2N1bWVudC5jb29raWUgPSBcInRva2VuPTsgZXhwaXJlcz1UaHUsIDAxIEphbiAxOTcwIDAwOjAwOjAwIFVUQzsgbGFzdFVybD07IGV4cGlyZXM9VGh1LCAwMSBKYW4gMTk3MCAwMDowMDowMCBVVENcIlxuICB9XG4sIGNoZWNrVXNlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICEhd2luZG93LnJlYWRDb29raWUoJ3Rva2VuJykgfHwgdGhpcy5hdXRoZW50aWNhdGUoKVxuICB9XG59XG4iLCJ2YXIgYXV0aCA9IHJlcXVpcmUoJy4uL2xpYi9hdXRoJylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2hhID0gdGhpcy5nZXQoJ3NoYScpXG4gICAgdGhpcy5zZXQoJ2lkJywgc2hhKVxuICB9XG4sIHVybDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVybCA9IHRoaXMuZ2V0KCd1cmwnKVxuICAgIHJldHVybiB1cmwgPyB1cmxcbiAgICAgICAgICAgICAgIDogJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJ1xuICAgICAgICAgICAgICAgICAgKyB0aGlzLmdldCgnb3duZXInKVxuICAgICAgICAgICAgICAgICAgKyAnLydcbiAgICAgICAgICAgICAgICAgICsgdGhpcy5nZXQoJ3JlcG8nKVxuICAgICAgICAgICAgICAgICAgKyAnL2NvbW1pdHMvJ1xuICAgICAgICAgICAgICAgICAgKyB0aGlzLmdldCgnc2hhJylcbiAgfVxuLCBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAsIGFkZDogdHJ1ZVxuICAgICwgY2FjaGU6IHRydWVcbiAgICAsIGhlYWRlcnM6IHsnQXV0aG9yaXphdGlvbicgOid0b2tlbiAnICsgYXV0aC5nZXRUb2tlbigpIH1cbiAgICB9XG4gICAgXy5leHRlbmQob3B0aW9ucywgZGVmYXVsdHMpXG4gICAgcmV0dXJuIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoLmNhbGwodGhpcywgb3B0aW9ucylcbiAgfVxuLCBpbmRleDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5pbmRleE9mKHRoaXMpXG4gIH1cbiwgbnh0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmF0KHRoaXMuaW5kZXgoKSArIDEpIHx8IHRoaXNcbiAgfVxuLCBwcmV2OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmF0KHRoaXMuaW5kZXgoKSAtIDEpIHx8IHRoaXNcbiAgfVxuLCBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodGhpcy5nZXQoJ2NvbW1pdCcpLmNvbW1pdHRlci5kYXRlKVxuICB9XG4sXG59KVxuXG5cbiIsInZhciBhdXRoID0gcmVxdWlyZSgnLi4vbGliL2F1dGgnKVxudmFyIENvbW1pdCA9IHJlcXVpcmUoJy4vY29tbWl0JylcblxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uKG1vZGVscywgb3B0cykge1xuICAgIC8vIFRPRE86IFNldCB0aGVzZSB0aGluZ3MgYXMgYXR0cmlidXRlcyBvbiB0aGUgY29sbGVjdGlvblxuICAgIHRoaXMucGF0aCA9IG9wdHMucGF0aFxuICAgIHRoaXMuc2hhID0gb3B0cy5zaGFcbiAgICB0aGlzLm93bmVyID0gb3B0cy5vd25lclxuICAgIHRoaXMucmVwbyA9IG9wdHMucmVwb1xuICB9XG4sIG1vZGVsOiBDb21taXRcbiwgY29tcGFyYXRvcjogZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBkYXRlQSA9IChhLmdldCgnY29tbWl0JykuY29tbWl0dGVyLmRhdGUpXG4gICAgICAsIGRhdGVCID0gKGIuZ2V0KCdjb21taXQnKS5jb21taXR0ZXIuZGF0ZSlcbiAgICByZXR1cm4gZGF0ZUEgPCBkYXRlQiA/IDFcbiAgICAgICAgIDogZGF0ZUEgPiBkYXRlQiA/IC0xXG4gICAgICAgICA6IDBcbiAgfVxuLCBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIHJlbW92ZTogZmFsc2VcbiAgICAsIGFkZDogdHJ1ZVxuICAgICwgY2FjaGU6IHRydWVcbiAgICAsIGhlYWRlcnM6IHsnQXV0aG9yaXphdGlvbicgOid0b2tlbiAnICsgYXV0aC5nZXRUb2tlbigpIH1cbiAgICB9XG4gICAgXy5leHRlbmQob3B0aW9ucywgZGVmYXVsdHMpXG4gICAgcmV0dXJuIEJhY2tib25lLkNvbGxlY3Rpb24ucHJvdG90eXBlLmZldGNoLmNhbGwodGhpcywgb3B0aW9ucylcbiAgfVxuLCB1cmw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1cmwgPSBbW1xuICAgICAgICAnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcydcbiAgICAgICwgdGhpcy5vd25lclxuICAgICAgLCB0aGlzLnJlcG9cbiAgICAgICwgJ2NvbW1pdHMnXG4gICAgICBdLmpvaW4oJy8nKVxuICAgICwgJz9wYXRoPSdcbiAgICAsICh0aGlzLnBhdGggfHwgJycpXG4gICAgLCAnJnNoYT0nXG4gICAgLCAodGhpcy5zaGEgfHwgJycpXG4gICAgXS5qb2luKCcnKVxuXG4gICAgaWYgKHRoaXMudW50aWwpIHtcbiAgICAgIHVybCA9IHVybCArICcmdW50aWw9JyArIHRoaXMudW50aWxcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2luY2UpIHtcbiAgICAgIHVybCA9IHVybCArICcmc2luY2U9JyArIHRoaXMuc2luY2VcbiAgICB9XG5cbiAgICByZXR1cm4gdXJsXG4gIH1cbiwgcmVtb3ZlRHVwczogZnVuY3Rpb24oKSB7XG4gICAgLy8gSEFBQUFDS1xuICAgIHZhciBvID0ge30sIGR1cHMgPSBbXVxuICAgIHRoaXMuZWFjaChmdW5jdGlvbihjKSB7XG4gICAgICBpZiAob1tjLmdldCgnc2hhJyldKSBkdXBzLnB1c2goYylcbiAgICAgIG9bYy5nZXQoJ3NoYScpXSA9IGNcbiAgICB9KVxuICAgIGNvbnNvbGUubG9nKCdkdXBzOicsIGR1cHMpXG4gICAgdGhpcy5yZW1vdmUoZHVwcylcbiAgfVxufSlcbiIsInZhciBhdXRoID0gcmVxdWlyZSgnLi4vbGliL2F1dGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIHVybDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjb250ZW50c191cmwnKVxuICB9XG4sIGZldGNoOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgaGVhZGVyczogeydBdXRob3JpemF0aW9uJyA6J3Rva2VuICcgKyBhdXRoLmdldFRva2VuKCkgfVxuICAgIH1cbiAgICBfLmV4dGVuZChvcHRpb25zLCBkZWZhdWx0cylcbiAgICByZXR1cm4gQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuZmV0Y2guY2FsbCh0aGlzLCBvcHRpb25zKVxuICB9XG59KVxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgdXJsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlcnMvJyArIHRoaXMuZ2V0KCd1c2VybmFtZScpXG4gIH1cbn0pXG5cbiIsIi8vIEhFTFBFUlNcbnZhciBwYXJzZVF1ZXJ5U3RyaW5nID0gcmVxdWlyZSgnLi9oZWxwZXJzJykucGFyc2VRdWVyeVN0cmluZ1xudmFyIGF1dGggPSByZXF1aXJlKCcuL2xpYi9hdXRoJylcblxuLy8gTU9ERUxTXG52YXIgQ29tbWl0ID0gcmVxdWlyZSgnLi9tb2RlbHMvY29tbWl0JylcbnZhciBDb21taXRzTGlzdCA9IHJlcXVpcmUoJy4vbW9kZWxzL2NvbW1pdHNfY29sbGVjdGlvbicpXG5cbi8vIFZJRVdTXG52YXIgSW5kZXhWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9pbmRleF92aWV3JylcbnZhciBVc2VyVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvdXNlcicpXG52YXIgVXNlcnNWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy91c2VycycpXG52YXIgQ29tbWl0VmlldyA9IHJlcXVpcmUoJy4vdmlld3MvY29tbWl0JylcbnZhciBDb21taXRzVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvY29tbWl0cycpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XG4gIHJvdXRlczoge1xuICAgICcnOiAnaW5kZXgnXG4gICwgJ2F1dGgoLykoPypxdWVyeVN0cmluZyknOiAnYXV0aCdcbiAgLCAnc2lnbmluKC8pJzogJ3NpZ25pbidcbiAgLCAnc2lnbm91dCgvKSc6ICdzaWdub3V0J1xuICAsICd1c2Vycy86dXNlcm5hbWUoLyknOiAndXNlcidcbiAgLCAndXNlcnMoLyknOiAndXNlcnMnXG4gICwgJzpvd25lci86cmVwby9ibG9iLzpzaGEvKnBhdGgnOiAnY29tbWl0cydcbiAgfVxuLCBpbmRleDogZnVuY3Rpb24oKSB7XG4gICAgbmV3IEluZGV4Vmlldyh7IGVsOiAnI2NvbnRlbnQnIH0pXG4gIH1cbiwgYXV0aDogZnVuY3Rpb24ocXVlcnlTdHJpbmcpIHtcbiAgICB2YXIgcGFyYW1zID0gcGFyc2VRdWVyeVN0cmluZyhxdWVyeVN0cmluZylcbiAgICAgICwgX3RoaXMgPSB0aGlzXG4gICAgICAsIGRlc3QgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LnJlYWRDb29raWUoJ2xhc3RVcmwnKSkgfHwgJy8nXG5cbiAgICBpZiAocGFyYW1zLmNvZGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBVVRIOiBnZXR0aW5nIHRva2VuJylcbiAgICAgIGF1dGguZmV0Y2hUb2tlbihwYXJhbXMuY29kZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdSZWRpcmVjdGluZyB0bzonLCBkZXN0KVxuICAgICAgICBfdGhpcy5uYXZpZ2F0ZShkZXN0LCB7IHRyaWdnZXI6IHRydWUgfSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGNvZGUgcGFyYW1ldGVyIHByb3ZpZGVkJylcbiAgICAgIC8vIHRoaXMuc2lnbmluKClcbiAgICB9XG4gIH1cbiwgc2lnbmluOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKClcbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBVVRIOiB0b2tlbiBleGlzdHMhJylcbiAgICAgIHRoaXMubmF2aWdhdGUoJy8nLCB7IHRyaWdnZXI6IHRydWUgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0FVVEg6IG5vIHRva2VuLCBzaWduIGluJylcbiAgICAgIGF1dGguYXV0aGVudGljYXRlKClcbiAgICB9XG4gIH1cbiwgc2lnbm91dDogZnVuY3Rpb24oKSB7XG4gICAgYXV0aC5kZXN0cm95KClcbiAgICB0aGlzLm5hdmlnYXRlKCcvJywgeyB0cmlnZ2VyOiB0cnVlIH0pXG4gIH1cbiwgdXNlcnM6IGZ1bmN0aW9uKCkge1xuICAgIG5ldyBVc2Vyc1ZpZXcoKVxuICB9XG4sIHVzZXI6IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gICAgbmV3IFVzZXJWaWV3KHsgdXNlcm5hbWU6IHVzZXJuYW1lIH0pXG4gIH1cbiwgY29tbWl0czogZnVuY3Rpb24ob3duZXIsIHJlcG8sIHNoYSwgcGF0aCkge1xuICAgIGlmIChhdXRoLmNoZWNrVXNlcigpKSB7XG4gICAgICBpZiAoIXBhdGgpIHJldHVybiBjb25zb2xlLmVycm9yKCdubyBwYXRoIGRldGVjdGVkIScpO1xuICAgICAgdmFyIGNvbW1pdHMgPSBuZXcgQ29tbWl0c0xpc3QoW10sIHtcbiAgICAgICAgb3duZXI6IG93bmVyXG4gICAgICAsIHJlcG86IHJlcG9cbiAgICAgICwgcGF0aDogcGF0aFxuICAgICAgLCBzaGE6IHNoYVxuICAgICAgfSlcbiAgICAgIGNvbW1pdHMuZmV0Y2goe1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihjb21taXRzKSB7XG4gICAgICAgICAgbmV3IENvbW1pdHNWaWV3KHsgY29sbGVjdGlvbjogY29tbWl0cyB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxufSlcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbiwgc2VsZj10aGlzO1xuXG5mdW5jdGlvbiBwcm9ncmFtMShkZXB0aDAsZGF0YSkge1xuICBcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyO1xuICBidWZmZXIgKz0gXCJcXG4gIDxwcmUgY2xhc3M9XFxcInByZVxcXCI+PGNvZGUgY2xhc3M9XFxcImNvZGVcXFwiPlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5maWxlQ29udGVudHMpIHsgc3RhY2sxID0gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KTsgfVxuICBlbHNlIHsgaGVscGVyID0gKGRlcHRoMCAmJiBkZXB0aDAuZmlsZUNvbnRlbnRzKTsgc3RhY2sxID0gdHlwZW9mIGhlbHBlciA9PT0gZnVuY3Rpb25UeXBlID8gaGVscGVyLmNhbGwoZGVwdGgwLCB7aGFzaDp7fSxkYXRhOmRhdGF9KSA6IGhlbHBlcjsgfVxuICBidWZmZXIgKz0gZXNjYXBlRXhwcmVzc2lvbihzdGFjazEpXG4gICAgKyBcIjwvY29kZT48L3ByZT5cXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG5mdW5jdGlvbiBwcm9ncmFtMyhkZXB0aDAsZGF0YSkge1xuICBcbiAgXG4gIHJldHVybiBcIlxcbiAgUGxlYXNlIHNlbGVjdCBhIGZpbGVcXG5cIjtcbiAgfVxuXG4gIGJ1ZmZlciArPSBcIjxwPlxcbiAgPHN0cm9uZz5JbmRleDo8L3N0cm9uZz4gXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9IChkZXB0aDAgJiYgZGVwdGgwLmNvbW1pdCkpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEuY2lkKSksdHlwZW9mIHN0YWNrMSA9PT0gZnVuY3Rpb25UeXBlID8gc3RhY2sxLmFwcGx5KGRlcHRoMCkgOiBzdGFjazEpKVxuICAgICsgXCI8YnI+XFxuICA8c3Ryb25nPlNoYTo8L3N0cm9uZz4gXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAmJiBkZXB0aDAuY29tbWl0KSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5hdHRyaWJ1dGVzKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5zaGEpKSx0eXBlb2Ygc3RhY2sxID09PSBmdW5jdGlvblR5cGUgPyBzdGFjazEuYXBwbHkoZGVwdGgwKSA6IHN0YWNrMSkpXG4gICAgKyBcIjxicj5cXG4gIDxzdHJvbmc+TWVzc2FnZTo8L3N0cm9uZz4gXCJcbiAgICArIGVzY2FwZUV4cHJlc3Npb24oKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoZGVwdGgwICYmIGRlcHRoMC5jb21taXQpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmF0dHJpYnV0ZXMpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNvbW1pdCkpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEubWVzc2FnZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPGJyPlxcbiAgPHN0cm9uZz5EYXRlOjwvc3Ryb25nPiBcIlxuICAgICsgZXNjYXBlRXhwcmVzc2lvbigoKHN0YWNrMSA9ICgoc3RhY2sxID0gKChzdGFjazEgPSAoKHN0YWNrMSA9ICgoc3RhY2sxID0gKGRlcHRoMCAmJiBkZXB0aDAuY29tbWl0KSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5hdHRyaWJ1dGVzKSksc3RhY2sxID09IG51bGwgfHwgc3RhY2sxID09PSBmYWxzZSA/IHN0YWNrMSA6IHN0YWNrMS5jb21taXQpKSxzdGFjazEgPT0gbnVsbCB8fCBzdGFjazEgPT09IGZhbHNlID8gc3RhY2sxIDogc3RhY2sxLmNvbW1pdHRlcikpLHN0YWNrMSA9PSBudWxsIHx8IHN0YWNrMSA9PT0gZmFsc2UgPyBzdGFjazEgOiBzdGFjazEuZGF0ZSkpLHR5cGVvZiBzdGFjazEgPT09IGZ1bmN0aW9uVHlwZSA/IHN0YWNrMS5hcHBseShkZXB0aDApIDogc3RhY2sxKSlcbiAgICArIFwiPGJyPlxcbjwvcD5cXG5cIjtcbiAgc3RhY2sxID0gaGVscGVyc1snaWYnXS5jYWxsKGRlcHRoMCwgKGRlcHRoMCAmJiBkZXB0aDAuZmlsZUNvbnRlbnRzKSwge2hhc2g6e30saW52ZXJzZTpzZWxmLnByb2dyYW0oMywgcHJvZ3JhbTMsIGRhdGEpLGZuOnNlbGYucHJvZ3JhbSgxLCBwcm9ncmFtMSwgZGF0YSksZGF0YTpkYXRhfSk7XG4gIGlmKHN0YWNrMSB8fCBzdGFjazEgPT09IDApIHsgYnVmZmVyICs9IHN0YWNrMTsgfVxuICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJjb21taXQtY29udHJvbHNcXFwiPlxcbiAgQ2xpY2ssIGRyYWcsIGFuZCBzY3JvbGwgdGltZWxpbmUgdG8gbmF2aWdhdGUgdGltZWxpbmUgPGEgaHJlZj1cXFwiI1xcXCIgaWQ9XFxcInJlc2V0LXRpbWVsaW5lXFxcIj4oUmVzZXQgdmlldyk8L2E+XFxuICA8ZGl2IGlkPVxcXCJ0aW1lbGluZVxcXCI+PC9kaXY+XFxuICA8ZGl2IGNsYXNzPVxcXCJjb21taXQtbmF2XFxcIj5cXG4gICAgPGJ1dHRvbiBpZD1cXFwib2xkZXItY29tbWl0XFxcIj5PbGRlcjwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGlkPVxcXCJuZXdlci1jb21taXRcXFwiPk5ld2VyPC9idXR0b24+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGlkPVxcXCJjb21taXRcXFwiPjwvZGl2PlxcblwiO1xuICB9KTtcbiIsIi8vIGhic2Z5IGNvbXBpbGVkIEhhbmRsZWJhcnMgdGVtcGxhdGVcbnZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICBcblxuXG4gIHJldHVybiBcIjxoMj5HaXQgVGltZSBNYWNoaW5lPC9oMj5cXG48cD5UaW1lIG1hY2hpbmUgZm9yIHlvdXIgZmlsZXMgb24gZ2l0aHViISBBbiBlYXNpZXIgd2F5IHRvIHZpZXcgdGhlIGhpc3Rvcnkgb2YgYSBzaW5nbGUgZmlsZS48L3A+XFxuPHA+VXNlZnVsIGZvciByZW1lbWJlcmluZyBcXFwiaG93IHRoYXQgbWV0aG9kIHVzZWQgdG8gd29ya1xcXCIgb3IgZmluZGluZyBcXFwidGhhdCBsaW5lIHlvdSBkZWxldGVkIHdlZWtzIGFnbyBidXQgZGlkIGVuZCB1cCBuZWVkaW5nIGFmdGVyYWxsXFxcIjwvcD5cXG48YSBocmVmPVxcXCJzaWduaW5cXFwiPlNpZ24gaW4gd2l0aCBHaXRIdWI8L2E+PGJyPlxcbjxhIGhyZWY9XFxcInNpZ25vdXRcXFwiPlNpZ25vdXQ8L2E+XFxuXFxuPGgzPlN0ZXAgMSAtIEluc3RhbGwgYnJvd3NlciBleHRlbnNpb248L2gzPlxcbjxwPkV4dGVuc2lvbnMgY29taW5nIHNvb24hPC9wPlxcbjxwPjxpbWcgc3JjPVxcXCJpbWFnZXMvYnJvd3Nlcl9jaHJvbWUucG5nXFxcIj48L3A+XFxuXFxuPGgzPlN0ZXAgMiAtIEZpbmQgYSBmaWxlIG9uIGdpdGh1YjwvaDM+XFxuPHA+VGhlIGJyb3dzZXIgZXh0ZW5zaW9uIGFkZHMgYSBuZXcgYnV0dG9uIHRvIHRoZSBmaWxlIHZpZXc8L3A+XFxuPHA+PGltZyBzcmM9XFxcImltYWdlcy9naXRodWJfYnV0dG9uLnBuZ1xcXCI+PC9wPlxcblxcbjxoMz5TdGVwIDMgLSBUcmF2ZWwgdGhyb3VnaCB0aW1lITwvaDM+XFxuPHA+V2F0Y2ggbGluZXMgb2YgY29kZSBjaGFuZ2Ugd2l0aCBlYWNoIGNvbW1pdCE8L3A+XFxuPHA+PGltZyBzcmM9XFxcImltYWdlcy90aW1lX21hY2hpbmVfZXhhbXBsZS5wbmdcXFwiPjwvcD5cXG5cXG48aDM+RXhhbXBsZTo8L2gzPlxcbjxwPlxcbiAgT25lIGNvbW1pdCBmb3IgYSBmaWxlOiA8YSBocmVmPVxcXCIvcGF0bW9vZC9odWdlZ2lmL2Jsb2IvYTU2YzIzYzdmOTUyNGY2YjdmNzFhZTMxNmNmMWM0MzE3ODI2NmJjMi9qcy9tYWluLmpzXFxcIj4vcGF0bW9vZC9odWdlZ2lmL2Jsb2IvYTU2YzIzYzdmOTUyNGY2YjdmNzFhZTMxNmNmMWM0MzE3ODI2NmJjMi9qcy9tYWluLmpzPC9hPlxcbjwvcD5cXG5cIjtcbiAgfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFycyA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgdmFyIGJ1ZmZlciA9IFwiXCIsIHN0YWNrMSwgaGVscGVyLCBmdW5jdGlvblR5cGU9XCJmdW5jdGlvblwiLCBlc2NhcGVFeHByZXNzaW9uPXRoaXMuZXNjYXBlRXhwcmVzc2lvbjtcblxuXG4gIGJ1ZmZlciArPSBcIjxwPlVzZXIgSUQ6IFwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5pZCkgeyBzdGFjazEgPSBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pOyB9XG4gIGVsc2UgeyBoZWxwZXIgPSAoZGVwdGgwICYmIGRlcHRoMC5pZCk7IHN0YWNrMSA9IHR5cGVvZiBoZWxwZXIgPT09IGZ1bmN0aW9uVHlwZSA/IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSkgOiBoZWxwZXI7IH1cbiAgYnVmZmVyICs9IGVzY2FwZUV4cHJlc3Npb24oc3RhY2sxKVxuICAgICsgXCI8L3A+XFxuXCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYnNmeS9ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGgxPkhlbGxvIEpvZTwvaDI+XFxuXCI7XG4gIH0pO1xuIiwidmFyIENvbW1pdCA9IHJlcXVpcmUoJy4uL21vZGVscy9jb21taXQnKVxudmFyIENvbnRlbnQgPSByZXF1aXJlKCcuLi9tb2RlbHMvY29udGVudCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICBlbDogJyNjb21taXQnXG4sIHRlbXBsYXRlOiByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvY29tbWl0JylcbiwgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0cykge1xuICAgIHRoaXMucGF0aCA9IG9wdHMucGF0aFxuICAgIHRoaXMuZ2V0RmlsZUxpc3QoKVxuICB9XG4sIGdldEZpbGVMaXN0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzXG4gICAgaWYgKHRoaXMubW9kZWwuZ2V0KCdmaWxlcycpKSB7XG4gICAgICB0aGlzLmdldENvbnRlbnRzKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tb2RlbC5mZXRjaCh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLmdldENvbnRlbnRzKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbiwgZ2V0Q29udGVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnBhdGgpIHtcbiAgICAgIC8vIEdldCBjb250ZW50cyBoZXJlXG4gICAgICB2YXIgcGF0aCA9IHRoaXMucGF0aFxuICAgICAgICAsIF90aGlzID0gdGhpc1xuICAgICAgICAsIGZpbGUgPSBfLmZpbmRXaGVyZSh0aGlzLm1vZGVsLmdldCgnZmlsZXMnKSwgeyBmaWxlbmFtZTogcGF0aCB9KVxuICAgICAgICAsIGNvbnRlbnQgPSBuZXcgQ29udGVudChmaWxlKVxuXG4gICAgICBjb250ZW50LmZldGNoKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oY29udGVudCkge1xuICAgICAgICAgIHZhciBjb250ZW50U3RyaW5nID0gYXRvYihjb250ZW50LmF0dHJpYnV0ZXMuY29udGVudClcbiAgICAgICAgICBfdGhpcy5yZW5kZXIoY29udGVudFN0cmluZylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXIoKVxuICAgIH1cbiAgfVxuLCByZW5kZXI6IGZ1bmN0aW9uKGZpbGVDb250ZW50cykge1xuICAgIHdpbmRvdy5BcHAucm91dGVyLm5hdmlnYXRlKHRoaXMucGVybWFsaW5rKCkpXG4gICAgJCh0aGlzLmVsKS5odG1sKHRoaXMudGVtcGxhdGUoeyBjb21taXQ6IHRoaXMubW9kZWwsIGZpbGVDb250ZW50czogZmlsZUNvbnRlbnRzfSkpXG4gICAgJCgncHJlIGNvZGUnKS5lYWNoKGZ1bmN0aW9uKGksIGJsb2NrKSB7XG4gICAgICBobGpzLmhpZ2hsaWdodEJsb2NrKGJsb2NrKVxuICAgIH0pXG5cbiAgICAvL1NldCBhIGdvb2QgaGVpZ2h0XG4gICAgdmFyIGlkZWFsSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpIC0gJCgnI2NvbW1pdCcpLm9mZnNldCgpLnRvcFxuICAgICQodGhpcy5lbCkuY3NzKCdoZWlnaHQnLCBpZGVhbEhlaWdodClcblxuICAgIHRoaXMuYWRkTGluZU51bWJlcnMoKVxuICB9XG4sIGFkZExpbmVOdW1iZXJzOiBmdW5jdGlvbigpIHtcbiAgICAkKCdwcmUgY29kZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGxpbmVzID0gJCh0aGlzKS50ZXh0KCkuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDFcbiAgICAgICAgdmFyICRudW1iZXJpbmcgPSAkKCc8dWwvPicpLmFkZENsYXNzKCdwcmUtbnVtYmVyaW5nJylcbiAgICAgICAgJCh0aGlzKVxuICAgICAgICAgIC5hZGRDbGFzcygnaGFzLW51bWJlcmluZycpXG4gICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgLmFwcGVuZCgkbnVtYmVyaW5nKVxuICAgICAgICBmb3IoaSA9IDE7IGkgPD0gbGluZXM7IGkrKyApe1xuICAgICAgICAgICRudW1iZXJpbmcuYXBwZW5kKCQoJzxsaS8+JykudGV4dChpKSlcbiAgICAgICAgfVxuICAgIH0pXG4gIH1cbiwgcGVybWFsaW5rOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaHRtbF9wYXRoID0gdGhpcy5tb2RlbC5nZXQoJ2h0bWxfdXJsJykubWF0Y2goL2dpdGh1Yi5jb20oLispJC8pWzFdXG4gICAgcmV0dXJuIGh0bWxfcGF0aC5yZXBsYWNlKCdjb21taXQnLCAnYmxvYicpICsgJy8nICsgdGhpcy5wYXRoXG4gIH1cbn0pXG5cbiIsInZhciBDb21taXRWaWV3ID0gcmVxdWlyZSgnLi9jb21taXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgZWw6ICcjY29udGVudCdcbiwgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jb21taXRzJylcbiwgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0cykge1xuICAgIC8vIFRPRE86IHNldCB0aGUgaW5pdGlhbCBjb21taXQgdG8gdGhlIHVybCBzaGEgaWYgaXQgZXhpc3RzLCB0aGVuIG1ha2UgdGhlIHNoYSBudWxsXG4gICAgdGhpcy5jb21taXQgPSB0aGlzLmNvbGxlY3Rpb24uYXQoMClcbiAgICB0aGlzLnJlbmRlcigpXG4gICAgdGhpcy5uZXdlc3RDb21taXQgPSBudWxsXG4gICAgdGhpcy5vbGRlc3RDb21taXQgPSBudWxsXG4gIH1cbiwgZXZlbnRzOiB7XG4gICAgJ2NsaWNrICNvbGRlci1jb21taXQnOiAnb2xkZXJDb21taXQnXG4gICwgJ2NsaWNrICNuZXdlci1jb21taXQnOiAnbmV3ZXJDb21taXQnXG4gICwgJ2NsaWNrICNyZXNldC10aW1lbGluZSc6ICdyZXNldFRpbWVsaW5lV2luZG93J1xuICB9XG4sIG9sZGVyQ29tbWl0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dENvbW0gPSB0aGlzLmNvbW1pdC5ueHQoKVxuICAgIGlmICh0aGlzLmNvbW1pdCA9PT0gdGhpcy5jb21taXQubnh0KCkgJiYgbmV4dENvbW0gIT0gdGhpcy5vbGRlc3RDb21taXQpIHtcbiAgICAgIHRoaXMuZmV0Y2hPbGRlcigpXG4gICAgICB0aGlzLm9sZGVzdENvbW1pdCA9IHRoaXMuY29tbWl0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWl0ID0gdGhpcy5jb21taXQubnh0KClcbiAgICAgIHRoaXMucmVuZGVyQ29tbWl0KClcbiAgICB9XG4gIH1cbiwgbmV3ZXJDb21taXQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcmV2Q29tbSA9IHRoaXMuY29tbWl0LnByZXYoKVxuICAgIGlmICh0aGlzLmNvbW1pdCA9PT0gcHJldkNvbW0gJiYgcHJldkNvbW0gIT0gdGhpcy5uZXdlc3RDb21taXQpIHtcbiAgICAgIHRoaXMuZmV0Y2hOZXdlcigpXG4gICAgICB0aGlzLm5ld2VzdENvbW1pdCA9IHRoaXMuY29tbWl0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWl0ID0gcHJldkNvbW1cbiAgICAgIHRoaXMucmVuZGVyQ29tbWl0KClcbiAgICB9XG4gIH1cbiwgZmV0Y2hPbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb2xsZWN0aW9uLnNoYSA9IHRoaXMuY29tbWl0LmdldCgnc2hhJylcbiAgICB0aGlzLmNvbGxlY3Rpb24udW50aWwgPSB0aGlzLmNvbW1pdC5nZXQoJ2NvbW1pdCcpLmNvbW1pdHRlci5kYXRlXG4gICAgdGhpcy5mZXRjaE1vcmUodGhpcy5vbGRlckNvbW1pdC5iaW5kKHRoaXMpKVxuICB9XG4sIGZldGNoTmV3ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29sbGVjdGlvbi5zaGEgPSB0aGlzLmNvbW1pdC5nZXQoJ3NoYScpXG4gICAgdGhpcy5jb2xsZWN0aW9uLnNpbmNlID0gdGhpcy5jb21taXQuZ2V0KCdjb21taXQnKS5jb21taXR0ZXIuZGF0ZVxuICAgIHRoaXMuZmV0Y2hNb3JlKHRoaXMubmV3ZXJDb21taXQuYmluZCh0aGlzKSlcbiAgfVxuLCBmZXRjaE1vcmU6IGZ1bmN0aW9uKG5leHQpIHtcbiAgICAvLyBUT0RPOiBQcmV2ZW50IHRoZSBzYW1lIGNvbW1pdCBjb21pbmcgYmFjayBvdmVyIGFuZCBvdmVyIGFnYWluXG4gICAgY29uc29sZS5sb2coJ2ZldGNoaW5nIG1vcmUgY29tbWl0cycpXG4gICAgdmFyIF90aGlzID0gdGhpc1xuICAgIHRoaXMuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih0b3VjaGVkKSB7XG4gICAgICAgIF90aGlzLmNvbGxlY3Rpb24uc2luY2UgPSBudWxsXG4gICAgICAgIF90aGlzLmNvbGxlY3Rpb24udW50aWwgPSBudWxsXG5cbiAgICAgICAgLy8gVE9ETzogUHJldmVudCBwYWdlIHBvc2l0aW9uIGZyb20gY2hhbmdpbmcgYWZ0ZXIgcmUtcmVuZGVyaW5nIGZ1bGwgdGVtcGxhdGVcbiAgICAgICAgX3RoaXMucmVuZGVyKClcbiAgICAgICAgbmV4dCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuLCBnb1RvQ29tbWl0OiBmdW5jdGlvbihzaGEpIHtcbiAgICB0aGlzLmNvbW1pdCA9IHRoaXMuY29sbGVjdGlvbi5maW5kV2hlcmUoe3NoYTogc2hhfSlcbiAgICB0aGlzLnJlbmRlckNvbW1pdCgpXG4gIH1cbiwgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMuZWwpLmh0bWwodGhpcy50ZW1wbGF0ZSh0aGlzLmNvbGxlY3Rpb24pKVxuICAgIHRoaXMuY29sbGVjdGlvbi5yZW1vdmVEdXBzKClcbiAgICB0aGlzLnJlbmRlclRpbWVsaW5lKClcbiAgICB0aGlzLnJlbmRlckNvbW1pdCgpXG4gIH1cbiwgcmVuZGVyQ29tbWl0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuY29tbWl0KSBjb25zb2xlLmVycm9yKCdObyBjb21taXQgZm91bmQhJylcbiAgICBuZXcgQ29tbWl0Vmlldyh7IG1vZGVsOiB0aGlzLmNvbW1pdCwgcGF0aDogdGhpcy5jb2xsZWN0aW9uLnBhdGggfSlcbiAgICB0aGlzLnRpbWVsaW5lLnNldFNlbGVjdGlvbih0aGlzLmNvbW1pdC5nZXQoJ3NoYScpKVxuICB9XG5cbiAgLy9UT0RPOiBtb3ZlIHRoaXMgdG8gYSBuZXcgdmlldz9cbiwgcmVuZGVyVGltZWxpbmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXNcblxuICAgIC8vIEdldCBkYXRlIGxpbWl0cyB0byByZXN0cmljdCB0aGUgdGltZWxpbmVcbiAgICB2YXIgbWluID0gdGhpcy5jb2xsZWN0aW9uLm1pbihmdW5jdGlvbihjb21taXQpIHtcbiAgICAgIHJldHVybiBjb21taXQuZGF0ZSgpXG4gICAgfSlcbiAgICB2YXIgbWF4ID0gdGhpcy5jb2xsZWN0aW9uLm1heChmdW5jdGlvbihjb21taXQpIHtcbiAgICAgIHJldHVybiBjb21taXQuZGF0ZSgpXG4gICAgfSlcblxuICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZWxpbmUnKVxuICAgICAgLCBkYXRhID0gbmV3IHZpcy5EYXRhU2V0KClcbiAgICAgICwgb3B0aW9ucyA9IHtcbiAgICAgICAgICBoZWlnaHQ6IDIyMFxuICAgICAgICAvL1RPRE86IHNldCBzYW5lIHJhbmdlcyB0aGF0IGRvbnQgY3V0IG9mZiB0aGUgbGFiZWxzXG4gICAgICAgIC8vICwgbWF4OiBuZXcgRGF0ZShtYXguZGF0ZSgpLnNldERhdGUobWluLmRhdGUoKS5nZXREYXRlKCkgKyAyKSlcbiAgICAgICAgLy8gLCBtaW46IG5ldyBEYXRlKG1pbi5kYXRlKCkuc2V0RGF0ZShtaW4uZGF0ZSgpLmdldERhdGUoKSAtIDIpKVxuICAgICAgICB9XG5cbiAgICB0aGlzLmNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbihjb21taXQpIHtcbiAgICAgIHZhciBtc2cgPSBjb21taXQuZ2V0KCdjb21taXQnKS5tZXNzYWdlXG4gICAgICBpZiAobXNnLmxlbmd0aCA+PSAyMCkgbXNnID0gbXNnLnNsaWNlKDAsIDE3KSArICcuLi4nXG4gICAgICBkYXRhLmFkZCh7XG4gICAgICAgIGlkOiBjb21taXQuZ2V0KCdzaGEnKVxuICAgICAgLCBjb250ZW50OiBtc2dcbiAgICAgICwgc3RhcnQ6IG5ldyBEYXRlKGNvbW1pdC5nZXQoJ2NvbW1pdCcpLmNvbW1pdHRlci5kYXRlKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy50aW1lbGluZSA9IG5ldyB2aXMuVGltZWxpbmUoY29udGFpbmVyLCBkYXRhLCBvcHRpb25zKVxuXG4gICAgLy8gYWRkIGV2ZW50IGxpc3RlbmVyXG4gICAgdGhpcy50aW1lbGluZS5vbignc2VsZWN0JywgZnVuY3Rpb24ocHJvcGVydGllcykge1xuICAgICAgdGhpcy5mb2N1cyhwcm9wZXJ0aWVzLml0ZW1zWzBdKVxuICAgICAgX3RoaXMuZ29Ub0NvbW1pdChwcm9wZXJ0aWVzLml0ZW1zWzBdKVxuICAgIH0pXG4gIH1cbiwgcmVzZXRUaW1lbGluZVdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aW1lbGluZS5maXQoKVxuICB9XG59KVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9pbmRleCcpXG4sIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVuZGVyKClcbiAgfVxuLCByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICQodGhpcy5lbCkuaHRtbCh0aGlzLnRlbXBsYXRlKCkpXG4gIH1cblxufSlcbiIsInZhciBVc2VyID0gcmVxdWlyZSgnLi4vbW9kZWxzL3VzZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgZWw6ICcjY29udGVudCdcbiwgdGVtcGxhdGU6IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy91c2VyJylcbiwgaW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXNcbiAgICAgLCB1c2VyID0gbmV3IFVzZXIob3B0cylcbiAgICB1c2VyLmZldGNoKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgX3RoaXMucmVuZGVyKHVzZXIuYXR0cmlidXRlcylcbiAgICAgIH1cbiAgICB9KVxuICB9XG4sIHJlbmRlcjogZnVuY3Rpb24odXNlcikge1xuICAgIGNvbnNvbGUubG9nKHVzZXIuYXR0cmlidXRlcylcbiAgICAkKHRoaXMuZWwpLmh0bWwodGhpcy50ZW1wbGF0ZSh1c2VyKSlcbiAgfVxufSlcbiIsIm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICBlbDogJyNjb250ZW50J1xuLCB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vdGVtcGxhdGVzL3VzZXJzJylcbiwgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICB9XG4sIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdHMgPSB7fVxuICAgICQodGhpcy5lbCkuaHRtbCh0aGlzLnRlbXBsYXRlKVxuICB9XG5cbn0pXG4iXX0=
