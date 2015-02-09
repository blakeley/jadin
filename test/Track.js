var Track = require('../Track');
var MidiReader = require('../MidiReader')
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var reader = new MidiReader(cScaleData);
var headerData = reader.readChunk();
var track1Data = reader.readChunk();
var track2Data = reader.readChunk();
var track3Data = reader.readChunk();
var track2 = new Track(track2Data);

describe('Track', function(){
  it('should construct a Track instance', function(){
    expect(track2).to.not.be.null()
  });
})
