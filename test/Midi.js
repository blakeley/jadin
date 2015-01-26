var Midi = require('../Midi');
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'utf8');
var cScaleMidi = new Midi(cScaleData);

describe('Midi', function(){
  it('should construct a Midi instance', function(){
    expect(cScaleMidi).to.not.be.null()
  });

  it('#format should return the MIDI format', function(){
    expect(cScaleMidi.format).to.equal(1);
  });

  it('#ppqn should return the number of pulses per quarter note', function(){
    expect(cScaleMidi.ppqn).to.equal(96);
  })

})
