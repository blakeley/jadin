var Midi = require('../Midi');
var Note = require('../Note');
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

describe('Note', function(){
  it('should construct a Note instance', function(){
    expect(new Note({}, {})).to.not.be.null();
  });

  it('#pitch should return this note\'s pitch', function(){
    expect(cScaleMidi.tracks[1].notes[0].pitch).to.equal(65);
  });

  it('#track should return the associated Track object', function(){
    expect(cScaleMidi.tracks[1].notes[0].track).to.equal(cScaleMidi.tracks[1]);
  });

  it('#midi should return the associated Midi object', function(){
    expect(cScaleMidi.tracks[1].notes[0].midi).to.equal(cScaleMidi);
  });

  it('#onTick should return the MIDI tick starting this Note', function(){
    expect(cScaleMidi.tracks[1].notes[0].onTick).to.equal(1920);    
  });

  it('#offTick should return the MIDI tick ending this Note', function(){
    expect(cScaleMidi.tracks[1].notes[0].offTick).to.equal(2400);    
  });

  it('#onSecond should return the second starting this Note', function(){
    expect(cScaleMidi.tracks[1].notes[0].onSecond).to.equal(1.9375);    
  });

  it('#offSecond should return the second ending this Note', function(){
    expect(cScaleMidi.tracks[1].notes[0].offSecond).to.equal(2.1875);    
  });

  it('#duration should return the duration of this Note in seconds', function(){
    expect(cScaleMidi.tracks[1].notes[0].duration).to.equal(0.25);
  });


})
