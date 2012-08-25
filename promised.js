new (function(module){

  var identity = function(i) { return i }

  var Promised = function(deferrer, promiser) {

    if(!deferrer){
      deferrer = identity
    }
    if(!promiser){
      promiser = identity
    }

    var fwd = function(p) {
      return function(arg, callback){
        var promise = promiser(arg)
        if(p) {
          promise.then(function(value){ callback(value) })
        } else {
          promise.then(function(value){ callback(null, value) },
                       function(value){ callback(value) })
        }
      }
    }

    var bwd = function(p) {
      return function(arg){
        return function(error, value) {
          var deferred = deferrer(arg)
          if (p && arguments.length < 2) {
            deferred.resolve(arguments[0])
          } else if(p) {
            deferred.resolve(Array.prototype.slice.apply(arguments, []))
          } else if (error) {
            deferred.reject(error)
          } else if (arguments.length > 2) {
            deferred.resolve(Array.prototype.slice.apply(arguments, [2]))
          } else {
            deferred.resolve(value)
          }
        }
      }
    }

    var ret = function(p) {
      return function(f, reciever){
        var args = Array.prototype.slice.apply(arguments, [2])
          , curry = function(){
          var args = Array.prototype.slice.apply(arguments, [])
            , func = function(){
            var argv = Array.prototype.slice.apply(arguments, [])
              , callback = argv.pop()
              , value = f.apply(reciever, args.concat(argv))
              , deferred = deferrer(value)
            fwd(p)(deferred, callback)
          }
          func.curry = curry
          return func
        }
        return curry.apply(null, args)
      }
    }

    var get = function(p) {
      return function() {
        var promises = Array.prototype.slice.apply(arguments, [])
          , callbacks = []
          , getter = function(arg) {
            callbacks.push(function(callback) {
              fwd(p)(arg, callback)
            })
          }
        promises.forEach(getter)
        return callbacks.length == 1 ? callbacks[0] : callbacks
      }
    }

    var set = function(p) {
      return function() {
        var deferreds = Array.prototype.slice.apply(arguments, [])
          , callbacks = []
          , setter = function(arg) {
            callbacks.push(bwd(p)(arg))
          }
        deferreds.forEach(setter)
        return function(){
          if(p) {
            for(var i in callbacks){
              callbacks[i].apply(this, arguments[i])
            }
          } else {
            for(var i in callbacks){
              callbacks[i].apply(this, arguments)
            }
          }
        }
      }
    }

    var promised       = ret(false)
        promised.fwd   = fwd(false)
        promised.bwd   = bwd(false)
        promised.get   = get(false)
        promised.set   = set(false)

        promised.p     = ret(true)
        promised.p.fwd = fwd(true)
        promised.p.bwd = bwd(true)
        promised.p.get = get(true)
        promised.p.set = set(true)

    return promised
  }

  Promised.$ = function($) {
    return Promised(function(value){
      if(value && typeof value.promise === 'function') {
        return value
      } else {
        return $.Deferred().resolve(value)
      }
    }, function(deferred){
      return deferred.promise()
    })
  }

  Promised.Q = function(Q) {
    return Promised(function(value){
      if(value && typeof value.promise === 'object') {
        return value
      } else {
        var deferred = Q.defer()
        deferred.resolve(value)
        return deferred
      }
    }, function(deferred){
      return deferred.promise
    })
  }

  module.exports = Promised})( typeof module !== 'undefined' ? module : new function(global, name){
  Object.defineProperty(this, 'exports', {
    set: function(value){ global[name] = value },
    get: function() { return global[name] }
  })
}(this, 'promised'))
