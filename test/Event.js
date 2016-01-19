import Midi from '../src/Midi';
import Event from '../src/Event';
import {expect} from 'chai';

let midi = new Midi();
let track = midi.createTrack();
let event = new Event()
event.tick = 480;
track.addEvent(event)

describe('Event', function(){
  it('#new should construct an Event instance', function(){
    expect(event).to.not.be.null();
  });

  it('#midi should return the associated Midi object', function(){
    expect(event.midi).to.equal(midi);
  });

  it('#second should return the second of this Event', function(){
    expect(event.second).to.equal(0.5);
  });
});
