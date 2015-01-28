var MidiReader = require('../MidiReader');
var expect = require('chai').expect;
var fs = require('fs');

var cScaleData = fs.readFileSync('fixtures/c.mid', 'utf8');

describe('MidiReader', function(){
  it('should construct a MidiReader instance', function(){
    var cScaleMidiReader = new MidiReader(cScaleData);
    expect(cScaleMidiReader).to.not.be.null();
  });

  it('#read should read and return the requested number of bytes', function(){
    var reader = new MidiReader('MThd\u0000etc.');
    expect(reader.read(4)).to.equal('MThd');
    expect(reader.position).to.equal(4);
    expect(reader.read(1)).to.equal('\u0000');
    expect(reader.position).to.equal(5);
  });

  it('#readInt8 should read an the next byte as an 8-bit integer', function(){
    var reader = new MidiReader('\u0000\u0001\u0002\u0003');
    expect(reader.readInt8()).to.equal(0)
    expect(reader.position).to.equal(1)
    expect(reader.readInt8()).to.equal(1)
    expect(reader.position).to.equal(2)
    expect(reader.readInt8()).to.equal(2)
    expect(reader.readInt8()).to.equal(3)
  });

  it('#readInt16 should read the next 2 bytes as a 16-bit big-endian binary number', function(){
    var reader = new MidiReader('\u0000\u0001\u0002\u0003');
    expect(reader.readInt16()).to.equal(1);
    expect(reader.position).to.equal(2)
    expect(reader.readInt16()).to.equal(2*256+3);
    expect(reader.position).to.equal(4)
  });

  it('#readInt32 should read the next 4 bytes as a 32-bit big-endian binary number', function(){
    var reader = new MidiReader('\u0000\u0000\u0000\u0000\u0001\u0002\u0003\u0004');
    expect(reader.readInt32()).to.equal(0);
    expect(reader.position).to.equal(4)
    expect(reader.readInt32()).to.equal(16909060);
    expect(reader.position).to.equal(8)
  });

  it('#readVLQ should read the next variable number of bytes as a variable length quantity', function(){
    var reader = new MidiReader('\u0000\u0008\u0081\u0000\u0086\u00c3\u0017');
    expect(reader.readVLQ()).to.equal(0);
    expect(reader.position).to.equal(1)
    expect(reader.readVLQ()).to.equal(8);
    expect(reader.position).to.equal(2)
    expect(reader.readVLQ()).to.equal(128);
    expect(reader.position).to.equal(4)
    expect(reader.readVLQ()).to.equal(106903);
    expect(reader.position).to.equal(7)
  });

  it('#readChunk should read a MIDI "chunk"', function(){
    var cScaleMidiReader = new MidiReader(cScaleData);
    chunk = cScaleMidiReader.readChunk()
    expect(chunk.type).to.equal('MThd');
    expect(chunk.length).to.equal(6);
    expect(chunk.data).to.equal('\u0000\u0001\u0000\u0002\u0000`');
    expect(cScaleMidiReader.position).to.equal(14)
  });

  it('#isAtEndOfFile should return false before reading the entire file', function(){
    var cScaleMidiReader = new MidiReader(cScaleData);
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    header = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    track1 = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
  });

  it('#isAtEndOfFile should return true after reading the entire file', function(){
    var cScaleMidiReader = new MidiReader(cScaleData);
    header = cScaleMidiReader.readChunk();
    track1 = cScaleMidiReader.readChunk();
    track2 = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(true);
  });
})



  