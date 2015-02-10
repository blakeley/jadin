var Midi = require('../Midi');
var Note = require('../Note');
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

var note = new Note({pitch: 60}, {pitch: 60});

describe('Note', function(){
  it('should construct a Note instance', function(){
    expect(note).to.not.be.null();
  });

  it('#pitch should return this note\'s pitch', function(){
    expect(note.pitch).to.equal(60);
  });

  it('#track should return the associated Track object', function(){
    expect(cScaleMidi.tracks[1].notes[0].track).to.equal(cScaleMidi.tracks[1]);
  });


})
