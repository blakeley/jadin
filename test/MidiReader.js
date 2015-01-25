var MidiReader = require('../MidiReader');
var expect = require('chai').expect;
var fs = require('fs');

var cScaleData = fs.readFileSync('fixtures/c.mid');
var cScaleMidiReader = new MidiReader(cScaleData);

it('should construct a MidiReader instance', function(){
  expect(cScaleMidiReader).to.not.be.null();
});

