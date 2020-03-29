import Midi from '../src/Midi';
import {expect} from 'chai';
import * as fs from 'fs';
import Cursor from '../src/Cursor';

const cScaleData = fs.readFileSync('./fixtures/c.mid', 'binary');
const cScaleMidi = new Midi(cScaleData);

describe('Midi', function(){
  it('#constructor should construct a Midi instance given binary data', function(){
    expect(cScaleMidi).to.not.be.null;
  });

  it('#constructor should construct a default Midi instance given no arguments', function() {
    const defaultMidi = new Midi();
    expect(defaultMidi).to.not.be.null;
    expect(defaultMidi.format).to.equal(0);
    expect(defaultMidi.ppqn).to.equal(480);
    expect(defaultMidi.notes).to.not.be.null;
    expect(defaultMidi.notesOnAt(0)).to.not.be.null;
    expect(defaultMidi.duration).to.equal(0);
    expect(defaultMidi.tickToSecond(960)).to.equal(1);
  });

  it('#format should return the MIDI format', function(){
    expect(cScaleMidi.format).to.equal(1);
  });

  it('#ppqn should return the number of pulses per quarter note', function(){
    expect(cScaleMidi.ppqn).to.equal(480);
  });

  it('#tracks should return an array of all tracks', function(){
    expect(cScaleMidi.tracks.length).to.equal(3);
  });

  it('#createTrack should create a new Track', function(){
    const defaultMidi = new Midi();
    expect(defaultMidi.tracks.length).to.equal(1);
    defaultMidi.createTrack();
    expect(defaultMidi.tracks.length).to.equal(2);    
  });

  it('#events should return an array of all events', function(){
    expect(cScaleMidi.events).to.not.be.undefined;
    expect(cScaleMidi.events.length).to.equal(28);
  });

  it('#events.@each.tick should return the MIDI tick at which this event starts', function(){
    expect(cScaleMidi.events[0].tick).to.equal(0);
    expect(cScaleMidi.events[6].tick).to.equal(0);
    expect(cScaleMidi.events[8].tick).to.equal(1920);
    expect(cScaleMidi.events[9].tick).to.equal(2400);
    expect(cScaleMidi.events[10].tick).to.equal(2400);
    expect(cScaleMidi.events[11].tick).to.equal(2880);
    expect(cScaleMidi.events[17].tick).to.equal(0);
    expect(cScaleMidi.events[20].tick).to.equal(480);
  });

  it('#notes should return an array of all notes', function(){
    expect(cScaleMidi.notes).to.not.be.undefined;
    expect(cScaleMidi.notes.length).to.equal(8);
  });

  it('#tickToSecond should convert a MIDI ticks to playback seconds', function(){
    expect(cScaleMidi.tickToSecond(0)).to.equal(0);
    expect(cScaleMidi.tickToSecond(480)).to.equal(0.5);
    expect(cScaleMidi.tickToSecond(960)).to.equal(1.0);
    expect(cScaleMidi.tickToSecond(1200)).to.equal(1.25);
  });

  it('#tickToSecond should account for tempo changes', function(){
    expect(cScaleMidi.tickToSecond(1920)).to.equal(1.9375);
    expect(cScaleMidi.tickToSecond(2400)).to.equal(2.1875);
    expect(cScaleMidi.tickToSecond(4800)).to.equal(3.4375);
    expect(cScaleMidi.tickToSecond(48000)).to.equal(25.9375);
  });

  it('#tickToSecond should be memoized', function(){
    expect(cScaleMidi.tickToSecond(960)).to.equal(1.0);
    expect(cScaleMidi.tickToSecond(960)).to.equal(1.0);
    expect(cScaleMidi["_tickToSecond"][960]).to.equal(1.0);
  });

  it('#tempoEvents should return all setTempo events', function(){
    expect(cScaleMidi.tempoEvents).to.not.be.undefined;
    expect(cScaleMidi.tempoEvents.length).to.equal(2);
  });

  it('#duration should return the duration of this Midi in seconds', function(){
    expect(cScaleMidi.duration).to.equal(2.9375);
  });

  it('#notesOnAt should return all notes on at the given second', function(){
    expect(cScaleMidi.notesOnAt(-1).length).to.equal(0);
    expect(cScaleMidi.notesOnAt(.50).length).to.equal(2);
    expect(cScaleMidi.notesOnAt(.50)[0]).to.equal(cScaleMidi.tracks[2].notes[0]);
    expect(cScaleMidi.notesOnAt(1.9375).length).to.equal(2);
    expect(cScaleMidi.notesOnAt(1.9375)[0]).to.equal(cScaleMidi.tracks[1].notes[0]);
    expect(cScaleMidi.notesOnAt(1.9375)[1]).to.equal(cScaleMidi.tracks[2].notes[3]);
  });

  it('#notesOnDuring should return all notes on at the given second', function(){
    expect(cScaleMidi.notesOnDuring(-2,-1).length).to.equal(0);
    expect(cScaleMidi.notesOnDuring(0,0.75).length).to.equal(2);
    expect(cScaleMidi.notesOnDuring(0,0.75)[0]).to.equal(cScaleMidi.tracks[2].notes[0]);
    expect(cScaleMidi.notesOnDuring(0,2).length).to.equal(5);
    expect(cScaleMidi.notesOnDuring(0,2)[0]).to.equal(cScaleMidi.tracks[1].notes[0]);
    expect(cScaleMidi.notesOnDuring(0,2)[1]).to.equal(cScaleMidi.tracks[2].notes[0]);
  });

  it('#newCursor should create a new cursor', function(){
    expect(cScaleMidi.newCursor()).to.be.an.instanceof(Cursor);
  });

  it('#newCursor should order its events by ascending tick', function(){
    const cursor = cScaleMidi.newCursor();

    expect(cursor.events[0].tick!).to.be.lte(cursor.events[1].tick!);
    expect(cursor.events[1].tick!).to.be.lte(cursor.events[2].tick!);
    expect(cursor.events[2].tick!).to.be.lte(cursor.events[3].tick!);
  });
});
