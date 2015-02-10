var Track = require('../Track');
var MidiReader = require('../MidiReader')
var Midi = require('../Midi');
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

describe('Track', function(){
  it('should construct a Track instance', function(){
    expect(new Track('')).to.not.be.null()
  });

  it('#events should return an array of all events', function(){
    expect(cScaleMidi.tracks[0].events).to.not.be.undefined();
    expect(cScaleMidi.tracks[0].events.length).to.equal(6);
    expect(cScaleMidi.tracks[1].events.length).to.equal(11);
  });

  it('#notes should return an array of all notes', function(){
    expect(cScaleMidi.tracks[1].notes).to.not.be.undefined();
    expect(cScaleMidi.tracks[1].notes.length).to.equal(4);
  });

  it('#midi should return the associated Midi object', function(){
    expect(cScaleMidi.tracks[1].midi).to.equal(cScaleMidi);
  });

})
