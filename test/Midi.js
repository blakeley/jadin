var Midi = require('../Midi');
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var cScaleMidi = new Midi(cScaleData);

describe('Midi', function(){
  it('should construct a Midi instance', function(){
    expect(cScaleMidi).to.not.be.null()
  });

  it('#format should return the MIDI format', function(){
    expect(cScaleMidi.format).to.equal(1);
  });

  it('#ppqn should return the number of pulses per quarter note', function(){
    expect(cScaleMidi.ppqn).to.equal(480);
  });

  it('#events should return an array of all events', function(){
    expect(cScaleMidi.events).to.not.be.undefined();
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
    expect(cScaleMidi.notes).to.not.be.undefined();
    expect(cScaleMidi.notes.length).to.equal(8);
  });

  it('#tickToSecond should convert a MIDI ticks to playback seconds', function(){
    expect(cScaleMidi.tickToSecond(0)).to.equal(0);
    expect(cScaleMidi.tickToSecond(480)).to.equal(0.5);
    expect(cScaleMidi.tickToSecond(960)).to.equal(1.0);
  });



})
