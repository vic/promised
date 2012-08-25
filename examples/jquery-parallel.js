var mecha  = require('mecha')
  , expect = require('chai').expect

  // libraries
  , Q      = require( 'q' )
  , async  = require( 'async' )
  , P      = require( '../promised' ).Q(Q)

  // example objects
  , a = Q.defer()
  , b = Q.defer()
  , c = Q.defer()

async.parallel( P.get(a, b), P.set(c) )

c.promise.then( function( result ) {
  mecha.log( "Result is", result )
}, function( error ) {
  mecha.log( "ERROR is", error )
})

setTimeout( function() { a.resolve( "Hello" ) }, 400 )
setTimeout( function() { b.resolve( "World" ) }, 200 )

describe("Convert a Q deferred into a callback", function(){

  it("should resolve c to an array", function(done){
    c.promise.then(function( result ) {
      expect(result).to.include("Hello", "World")
      done()
    })
  })

  it("should leave the array in correct order", function(done){
    c.promise.then(function( result ) {
      expect(result[0]).to.equal("Hello")
      expect(result[1]).to.equal("World")
      done()
    })
  })

})

mecha({reporter: 'nyan'})
