var MidiReader = require('../MidiReader');
var expect = require('chai').expect;
var fs = require('fs');

var cScaleData = fs.readFileSync('fixtures/c.mid', 'utf8');
var cScaleMidiReader = new MidiReader(cScaleData);

it('should construct a MidiReader instance', function(){
  expect(cScaleMidiReader).to.not.be.null();
});

it('#read should return the requested number of bytes', function(){
  result = cScaleMidiReader.read(4);
  expect(result).to.equal('MThd');
});
