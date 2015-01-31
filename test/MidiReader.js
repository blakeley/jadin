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
    var reader = new MidiReader('MThd\x00etc.');
    expect(reader.read(4)).to.equal('MThd');
    expect(reader.position).to.equal(4);
    expect(reader.read(1)).to.equal('\x00');
    expect(reader.position).to.equal(5);
  });

  it('#readInt8 should read an the next byte as an 8-bit integer', function(){
    var reader = new MidiReader('\x00\x01\x02\x03');
    expect(reader.readInt8()).to.equal(0)
    expect(reader.position).to.equal(1)
    expect(reader.readInt8()).to.equal(1)
    expect(reader.position).to.equal(2)
    expect(reader.readInt8()).to.equal(2)
    expect(reader.readInt8()).to.equal(3)
  });

  it('#readInt16 should read the next 2 bytes as a 16-bit big-endian binary number', function(){
    var reader = new MidiReader('\x00\x01\x02\x03');
    expect(reader.readInt16()).to.equal(1);
    expect(reader.position).to.equal(2)
    expect(reader.readInt16()).to.equal(2*256+3);
    expect(reader.position).to.equal(4)
  });

  it('#readInt32 should read the next 4 bytes as a 32-bit big-endian binary number', function(){
    var reader = new MidiReader('\x00\x00\x00\x00\x01\x02\x03\x04');
    expect(reader.readInt32()).to.equal(0);
    expect(reader.position).to.equal(4)
    expect(reader.readInt32()).to.equal(16909060);
    expect(reader.position).to.equal(8)
  });

  it('#readVLQ should read the next variable number of bytes as a variable length quantity', function(){
    var reader = new MidiReader('\x00\x08\x81\x00\x86\xc3\x17');
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
    chunk = cScaleMidiReader.readChunk();
    expect(chunk.type).to.equal('MThd');
    expect(chunk.length).to.equal(6);
    expect(chunk.data).to.equal('\x00\x01\x00\x02\x00`');
    expect(cScaleMidiReader.position).to.equal(14)
  });

  it('#readEvent should read a noteOff event', function(){
    // deltaTime, status?, 8n, note, velocity 
    var reader = new MidiReader('\x00\x81\x3c\x32');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('noteOff');
    expect(e.channel).to.equal(1);
    expect(e.pitch).to.equal(60);
    expect(e.velocity).to.equal(50);
  });

  it('#readEvent should read a noteOff event during a running status', function(){
    var reader = new MidiReader('\x00\x81\x3c\x32\x01\x3d\x33');
    reader.readEvent();
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(1);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('noteOff');
    expect(e.channel).to.equal(1);
    expect(e.pitch).to.equal(61);
    expect(e.velocity).to.equal(51);
  });

  it('#readEvent should read a noteOn event', function(){
    // deltaTime, status?, 9n, note, velocity
    var reader = new MidiReader('\x00\x91\x3e\x34');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('noteOn');
    expect(e.channel).to.equal(1);
    expect(e.pitch).to.equal(62);
    expect(e.velocity).to.equal(52);
  });

  it('#readEvent should read a noteOn event with velocity zero as a noteOff event', function(){
    var reader = new MidiReader('\x00\x91\x3f\x00');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('noteOff');
    expect(e.channel).to.equal(1);
    expect(e.pitch).to.equal(63);
    expect(e.velocity).to.equal(0);
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



  