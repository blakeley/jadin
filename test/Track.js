var Track = require('../Track');
var MidiReader = require('../MidiReader')
var Midi = require('../Midi');
var Note = require('../Note');
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
    expect(cScaleMidi.tracks[1].notes[0].constructor).to.equal(Note);
  });

  it('#midi should return the associated Midi object', function(){
    expect(cScaleMidi.tracks[1].midi).to.equal(cScaleMidi);
  });

  it('#index should return the index of this track', function(){
    expect(cScaleMidi.tracks[0].index).to.equal(0);
    expect(cScaleMidi.tracks[1].index).to.equal(1);
    expect(cScaleMidi.tracks[2].index).to.equal(2);
  });

  it('#notesOnAt should return the notes on this track which are on at the given time', function(){
    expect(cScaleMidi.tracks[2].notesOnAt(-1).length).to.equal(0);
    expect(cScaleMidi.tracks[2].notesOnAt(.50).length).to.equal(2);
    expect(cScaleMidi.tracks[2].notesOnAt(.50)[0]).to.equal(cScaleMidi.tracks[2].notes[0]);
    expect(cScaleMidi.tracks[2].notesOnAt(1.9375).length).to.equal(1);
    expect(cScaleMidi.tracks[1].notesOnAt(1.9375).length).to.equal(1);
  });

})
