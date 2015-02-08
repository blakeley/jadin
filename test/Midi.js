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
    expect(cScaleMidi.events.length).to.equal(27);
  });

  it('#events.@each.startTick should return the MIDI tick at which this event starts', function(){
    expect(cScaleMidi.events[0].startTick).to.equal(0);
    expect(cScaleMidi.events[6].startTick).to.equal(0);
    expect(cScaleMidi.events[7].startTick).to.equal(1920);
    expect(cScaleMidi.events[8].startTick).to.equal(2400);
    expect(cScaleMidi.events[9].startTick).to.equal(2400);
    expect(cScaleMidi.events[10].startTick).to.equal(2880);
    expect(cScaleMidi.events[16].startTick).to.equal(0);
    expect(cScaleMidi.events[19].startTick).to.equal(480);
  });

  it('#notes should return an array of all notes', function(){
    expect(cScaleMidi.notes).to.not.be.undefined();
    expect(cScaleMidi.notes.length).to.equal(8);
  });
})
