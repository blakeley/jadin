var Track = require('../Track');
var MidiReader = require('../MidiReader')
var fs = require('fs');
var expect = require('chai').expect;

var cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');
var reader = new MidiReader(cScaleData);
var headerChunk = reader.readChunk();
var track1Chunk = reader.readChunk();
var track2Chunk = reader.readChunk();
var track3Chunk = reader.readChunk();
var track2 = new Track(track2Chunk.data);

describe('Track', function(){
  it('should construct a Track instance', function(){
    expect(track2).to.not.be.null()
  });

  it('#events should return an array of all events', function(){
    expect(track2.events).to.not.be.undefined();
    expect(track2.events.length).to.equal(11);    
  });

  it('#notes should return an array of all notes', function(){
    expect(track2.notes).to.not.be.undefined();
    expect(track2.notes.length).to.equal(4);
  });

})
