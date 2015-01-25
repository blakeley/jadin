var Midi = require('../midi');
var expect = require('chai').expect;

it('should construct a Midi object', function(){
  expect(new Midi('stream')).to.not.be.null();
})
