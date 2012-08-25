# Promised #.

Convert back and forth from javascript Promises to Callbacks

This library works on both node and browser.
Currently it supports jQuery and Q promises.

[jQuery]: [http://api.jquery.com/category/deferred-object]
[Q]: [http://documentup.com/kriskowal/q/]

## API ##

In the following signatures `callback<e,s>` means a function that
takes two arguments, one for error and the second for success. And
`callback<v>` is a function that takes a single value; in node
API these kind of callbacks are used for predicates, functions that
either invoke the callback with true or false, that's why each of
the following functions has a `p.` version which works with this
kind of predicate callbacks.

### Deferred generator to Callback receiver ###

`P(function, receiver, args...)` -> `function(args..., callback<e,s>)`

`P.p(function, receiver, args...)` -> `function(args..., callback<v>)`

This transformation takes a function that will return a _deferred_ and
will transform it into a function that expects any number of arguments
and a _callback_ as the last one.

```
P(jQuery.ajax, jQuery)

// is equivalent to
function(args..., callback) {
  var deferred = jQuery.ajax(args...)
    , promise = deferred.promise()
  promise.then(callbackSuccess, callbackError)
}
```

Functions returned by `P` can be curried by using it's `curry` method.
This way you can add arguments to the function without yet invoking it.

`_.curry(args...)` -> `function(args..., callback<e,s>)`

### Forward a Promise to Callback arguments ###

`P.fwd(promise, callback<e, s>)`

`P.p.fwd(promise, callback<v>)`

When the given _promise_ is resolved/rejected, the _callback_ is called
accordingly.


### Turn a Deferred into a Callback ###

`P.bwd(deferred)` -> `function(error, success)`

`P.p.bwd(deferred)` -> `function(value)`

When the returned _callback_ is given an error argument, the
_deferred_ will be rejected, otherwise it will be resolved.

### Turn a Promise into a Function that takes a callback and resolves ###

`P.get(promise)` -> `function(callback<e,s>){ resolve(s)/reject(e) }`
`P.p.get(promise)` -> `function(callback<v>){ promise.resolve(v) }`

If given multiple _promise_s, `.get` will return an array of functions.

### Turn a Deferred into a Function (callback) that resolves/rejects ###

`P.set(deferred)` -> `function(error, success) { resolve(success)/reject(error) }`
`P.p.set(deferred)` -> `function(value) { resolve(value) }`

If `p.set` is given multiple _deferred_s each of them will be resolved
to the corresponding argument the _callback_ is called with.
If `.set` is given multiple _deferred_s all of them will be
resolved/rejected to the same value.


