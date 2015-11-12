import Midi from '../src/Midi';
import Note from '../src/Note';
import {expect} from 'chai';
import fs from 'fs';

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

describe('Note', function(){
  it('should construct a Note instance', function(){
    expect(new Note()).to.not.be.null();
  });

  it('#number should return this note\'s MIDI number', function(){
    expect(cScaleMidi.tracks[1].notes[0].number).to.equal(65);
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

  it('#onTick= should not set the onTick to be greater than the offTick', function(){
    const note = new Note(60, 2, 4)
    try {
      note.onTick = 5;
    } catch(e) {
      expect(note.onTick).to.equal(2);
    }
  });

  it('#offTick= should not set the offTick to be less than the onTick', function(){
    const note = new Note(60, 2, 4)
    try {
      note.offTick = 1;
    } catch(e) {
      expect(note.offTick).to.equal(4);
    }
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

  it('#onAt should return true when a note is on at the given second', function(){
    expect(cScaleMidi.tracks[2].notes[0].onAt(0)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onAt(0.25)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onAt(0.50)).to.be.true;
  });

  it('#onAt should return false when a note is not on at the given second', function(){
    expect(cScaleMidi.tracks[2].notes[0].onAt(-1)).to.be.false;
    expect(cScaleMidi.tracks[2].notes[0].onAt(1)).to.be.false;
  });

  it('#onDuring should return true when a note is on during the given time range', function(){
    expect(cScaleMidi.tracks[2].notes[0].onDuring(-0.50, 0)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(0, 0.50)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(0.50, 1)).to.be.true;
  });

  it('#onDuring should return false when a note is not on during the given time range', function(){
    expect(cScaleMidi.tracks[2].notes[0].onDuring(-1, -.01)).to.be.false;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(0.51, 1)).to.be.false;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(20, 30)).to.be.false;
  });
});
