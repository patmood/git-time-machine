var _ = require('underscore')

module.exports.parseQueryString = function(queryString){
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
