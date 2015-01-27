var MidiReader = require('../MidiReader');
var expect = require('chai').expect;
var fs = require('fs');

var cScaleData = fs.readFileSync('fixtures/c.mid', 'utf8');
var cScaleMidiReader;

describe('MidiReader', function(){
  beforeEach(function(){
    cScaleMidiReader = new MidiReader(cScaleData);
  });  

  it('should construct a MidiReader instance', function(){
    expect(cScaleMidiReader).to.not.be.null();
  });

  it('#read should read and return the requested number of bytes', function(){
    result = cScaleMidiReader.read(4);
    expect(result).to.equal('MThd');
    expect(cScaleMidiReader.position).to.equal(4);
  });

  it('#readInt8 should read an 8-bit integer', function(){
    header = cScaleMidiReader.readChunk();
    track1 = cScaleMidiReader.readChunk();
    track1Reader = new MidiReader(track1.data);
    expect(track1Reader.readInt8()).to.equal(0);
    track2 = cScaleMidiReader.readChunk();
    track2Reader = new MidiReader(track2.data);
    expect(track2Reader.readInt8()).to.equal(0);
  });

  it('#readInt16 should read the next 2 bytes as a 16-bit big-endian binary number', function(){
    cScaleMidiReader.position = 8
    expect(cScaleMidiReader.readInt16()).to.equal(1);
    expect(cScaleMidiReader.readInt16()).to.equal(2);
    expect(cScaleMidiReader.readInt16()).to.equal(96);
  });

  it('#readInt32 should read the next 4 bytes as a 32-bit big-endian binary number', function(){
    cScaleMidiReader.position = 4
    expect(cScaleMidiReader.readInt32()).to.equal(6);
    expect(cScaleMidiReader.position).to.equal(8)
  });

  it('#readChunk should read a MIDI "chunk"', function(){
    chunk = cScaleMidiReader.readChunk()
    expect(chunk.type).to.equal('MThd');
    expect(chunk.length).to.equal(6);
    expect(chunk.data).to.equal('\u0000\u0001\u0000\u0002\u0000`');
    expect(cScaleMidiReader.position).to.equal(14)
  });

  it('#isAtEndOfFile should return false before reading the entire file', function(){
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    header = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    track1 = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
  });

  it('#isAtEndOfFile should return true after reading the entire file', function(){
    header = cScaleMidiReader.readChunk();
    track1 = cScaleMidiReader.readChunk();
    track2 = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(true);
  });
})



  