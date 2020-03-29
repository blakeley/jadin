import Track from '../src/Track';
import Midi from '../src/Midi';
import Note from '../src/Note';
import Event from '../src/Event';
import {expect} from 'chai';
import * as fs from 'fs';

var chai = require('chai');
chai.use(require('chai-change'));

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

describe('Track', function(){
  it('#constructor should construct a Track instance given binary track data', function(){
    expect(new Track('\x00\x91\x3e\x34\x00\x81\x3e\x34')).to.be.a('Track');
  });

  it('#constructor should construct a Track instance given no arguments', function(){
    const defaultTrack = new Track();
    expect(new Track()).to.be.a('Track');
  });

  it('#addEvent should add an event to this track\'s array of events', function(){
    const track = new Track();
    const event = new Event();
    expect(function(){
      track.addEvent(event);
    }).to.change(function(){
      return track.events.length
    }, {
      by: 1
    } as any);
  });

  it('#addEvent should associate itself to the given event', function(){
    const track = new Track();
    const event = new Event();
    track.addEvent(event);
    expect(event.track).to.equal(track);
  });

  it('#addEvent should create a new note from a noteOn/noteOff pair', function(){
    const track = new Track();
    expect(function(){
      track.addEvent({subtype: 'noteOn', number: 60} as Event);
      track.addEvent({subtype: 'noteOff', number: 60} as Event);
    }).to.change(function(){
      return track.notes.length
    }, {
      by: 1
    } as any);
  });

  it('#addEvent should create new events from a noteOn/noteOff pair', function(){
    const track = new Track();
    expect(track.events.length).to.equal(0);
    expect(function(){
      track.addEvent({subtype: 'noteOn', number: 60} as Event);
      track.addEvent({subtype: 'noteOff', number: 60} as Event);
    }).to.change(function(){
      return track.events.length
    }, {
      by: 2
    } as any);
  });

  it('#addEvent should ignore unpaired noteOn events', function(){
    const track = new Track();
    expect(function(){
      track.addEvent({subtype: 'noteOn', number: 60} as Event);
      track.addEvent({subtype: 'noteOn', number: 60} as Event);
    }).to.change(function(){
      return track.events.length
    }, {
      by: 1
    } as any);
  });

  it('addEvent should not create a new note from a removed noteOn event', function(){
    const track = new Track();
    track.addEvent({subtype: 'noteOn', number: 60} as Event);
    track.addEvent({subtype: 'noteOn', number: 60} as Event);
    track.addEvent({subtype: 'noteOff', number: 60} as Event)
    expect(track.events[0]).to.equal(track.notes[0].onEvent);
  });

  it('#addEvent should ignore unpaired noteOff events', function(){
    const track = new Track();
    expect(function(){
      track.addEvent({subtype: 'noteOff', number: 60} as Event);
      track.addEvent({subtype: 'noteOn', number: 60} as Event);
      track.addEvent({subtype: 'noteOff', number: 60} as Event);
      track.addEvent({subtype: 'noteOff', number: 60} as Event);
    }).to.change(function(){
      return track.events.length
    }, {
      by: 2
    } as any);
  });

  it('#addEvent should ignore noteOff events following simultaneous noteOn events', function(){
    const track = new Track();
    expect(function(){
      track.addEvent({tick: 480, 'subtype': 'noteOn', number: 60} as Event);
      track.addEvent({tick: 480, 'subtype': 'noteOff', number: 60} as Event);
    }).to.change(function(){
      return track.events.length
    }, {
      by: 1
    } as any);
  });

  it('#removeEvent should remove the given event from the events array', function(){
    const track = new Track();
    const event = new Event();
    track.addEvent({tick: 0} as Event);
    track.addEvent(event);
    track.addEvent({tick: 2} as Event);
    expect(function(){
      track.removeEvent(event);
    }).to.change(function(){
      return track.events.length;
    }, {
      by: -1
    } as any);
  });

  it('#constructor should remove unpaired noteOn events', function(){
    const track = new Track('\x00\x91\x3e\x34');
    expect(track.events.length).to.equal(0);
  })

  it('#events should return an array of all events', function(){
    expect(cScaleMidi.tracks[0].events).to.not.be.undefined('') ;
    expect(cScaleMidi.tracks[0].events.length).to.equal(6);
    expect(cScaleMidi.tracks[1].events.length).to.equal(11);
  });

  it('#notes should return an array of all notes', function(){
    expect(cScaleMidi.tracks[1].notes).to.not.be.undefined('');
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

  it('#index should return the index of this track', function(){
    expect(cScaleMidi.tracks[0].index).to.equal(0);
    expect(cScaleMidi.tracks[1].index).to.equal(1);
    expect(cScaleMidi.tracks[2].index).to.equal(2);
  });

  it('#notesOnDuring should return the notes on this track which are on during the given time range', function(){
    expect(cScaleMidi.tracks[2].notesOnDuring(-2,-1).length).to.equal(0);
    expect(cScaleMidi.tracks[2].notesOnDuring(0,0.75).length).to.equal(2);
    expect(cScaleMidi.tracks[2].notesOnDuring(0,0.75)[0]).to.equal(cScaleMidi.tracks[2].notes[0]);
    expect(cScaleMidi.tracks[2].notesOnDuring(0,2).length).to.equal(4);
  });
})
