import Midi from '../src/Midi';
import Event from '../src/Event';
import {expect} from 'chai';
import fs from 'fs';

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

describe('Event', function(){
  it('#new should construct an Event instance', function(){
    expect(new Event()).to.not.be.null();
  });

  it('#tick should return the MIDI tick of this Event', function(){
    expect(cScaleMidi.events[20].tick).to.equal(480);    
  });

  it('#track should return the associated Track object', function(){
    expect(cScaleMidi.events[20].track).to.equal(cScaleMidi.tracks[2]);
  });

  it('#midi should return the associated Midi object', function(){
    expect(cScaleMidi.events[20].midi).to.equal(cScaleMidi);
  });

  it('#second should return the second of this Event', function(){
    expect(cScaleMidi.events[20].second).to.equal(0.5);    
  });
});
