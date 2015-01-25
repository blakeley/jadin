var MidiReader = require('../MidiReader');
var expect = require('chai').expect;

var cScaleMidiReader = new MidiReader();

it('should construct a MidiReader instance', function(){
  expect(cScaleMidiReader).to.not.be.null();
});

