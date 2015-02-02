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

  it('#readInt(1) should read an the next byte as an 8-bit integer', function(){
    var reader = new MidiReader('\x00\x01\x02\x03');
    expect(reader.readInt(1)).to.equal(0)
    expect(reader.position).to.equal(1)
    expect(reader.readInt(1)).to.equal(1)
    expect(reader.position).to.equal(2)
    expect(reader.readInt(1)).to.equal(2)
    expect(reader.readInt(1)).to.equal(3)
  });

  it('#readInt(2) should read the next 2 bytes as a 16-bit integer', function(){
    var reader = new MidiReader('\x00\x01\x02\x03');
    expect(reader.readInt(2)).to.equal(1);
    expect(reader.position).to.equal(2)
    expect(reader.readInt(2)).to.equal(2*256+3);
    expect(reader.position).to.equal(4)
  });

  it('#readInt(3) should read the next 3 bytes as a 24-bit integer', function(){
    var reader = new MidiReader('\x00\x00\x00\x01\x02\x03');
    expect(reader.readInt(3)).to.equal(0);
    expect(reader.position).to.equal(3)
    expect(reader.readInt(3)).to.equal(1*256*256+2*256+3);
    expect(reader.position).to.equal(6)
  });

  it('#readInt(4) should read the next 4 bytes as a 32-bit integer', function(){
    var reader = new MidiReader('\x00\x00\x00\x00\x01\x02\x03\x04');
    expect(reader.readInt(4)).to.equal(0);
    expect(reader.position).to.equal(4)
    expect(reader.readInt(4)).to.equal(16909060);
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

  it('#readEvent should read a noteOff event', function(){
    // deltaTime, 8n, pitch, velocity 
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
    // deltaTime, 9n, pitch, velocity
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

  it('#readEvent should read an aftertouch event', function(){
    // deltaTime, an, pitch, pressure
    var reader = new MidiReader('\x00\xa1\x40\x35');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('aftertouch');
    expect(e.channel).to.equal(1);
    expect(e.pitch).to.equal(64);
    expect(e.pressure).to.equal(53);    
  });

  it('#readEvent should read a controller event', function(){
    // deltaTime, bn, controller, value
    var reader = new MidiReader('\x00\xb1\x41\x36');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('controller');
    expect(e.controller).to.equal(65);
    expect(e.value).to.equal(54);
  });

  it('#readEvent should read a program event', function(){
    // deltaTime, cn, program
    var reader = new MidiReader('\x00\xc1\x42');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('program');
    expect(e.program).to.equal(66);
  });

  it('#readEvent should read a channelPressure event', function(){
    // deltaTime, dn, pressure
    var reader = new MidiReader('\x00\xd1\x43');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('channelPressure');
    expect(e.pressure).to.equal(67);
  });

  it('#readEvent should read a channelPressure event', function(){
    // deltaTime, dn, pressure
    var reader = new MidiReader('\x00\xd1\x43');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('channelPressure');
    expect(e.pressure).to.equal(67);
  });

  it('#readEvent should read a pitchBend event', function(){
    // deltaTime, en, lsb, msb
    var reader = new MidiReader('\x00\xe1\x05\x03');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('channel');
    expect(e.subtype).to.equal('pitchBend');
    expect(e.value).to.equal(389);    
  });

  it('#readEvent should read a sequenceNumber meta event', function(){
    var reader = new MidiReader('\x00\xff\x00\x02\x01\x03')
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('sequenceNumber');
    expect(e.number).to.equal(259);
  });

  it('#readEvent should read a text meta event', function(){
    var reader = new MidiReader('\x00\xff\x01\x09some text');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('text');
    expect(e.text).to.equal('some text');
  });

  it('#readEvent should read a copyright meta event', function(){
    var reader = new MidiReader('\x00\xff\x02\x0f© Noteriver.com');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('copyright');
    expect(e.text).to.equal('© Noteriver.com');
  });

  it('#readEvent should read a trackName meta event', function(){
    var reader = new MidiReader('\x00\xff\x03\x0eUnknown Song 1');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('trackName');
    expect(e.text).to.equal('Unknown Song 1');
  });

  it('#readEvent should read an instrumentName meta event', function(){
    var reader = new MidiReader('\x00\xff\x04\x07Cowbell');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('instrumentName');
    expect(e.text).to.equal('Cowbell');
  });

  it('#readEvent should read a lyric meta event', function(){
    var reader = new MidiReader('\x00\xff\x05\x04hey!');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('lyric');
    expect(e.text).to.equal('hey!');
  });

  it('#readEvent should read a marker meta event', function(){
    var reader = new MidiReader('\x00\xff\x06\x05Verse');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('marker');
    expect(e.text).to.equal('Verse');
  });

  it('#readEvent should read a cuePoint meta event', function(){
    var reader = new MidiReader('\x00\xff\x07\x05Solo');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('cuePoint');
    expect(e.text).to.equal('Solo');
  });

  it('#readEvent should read a programName meta event', function(){
    var reader = new MidiReader('\x00\xff\x08\x08drum kit');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('programName');
    expect(e.text).to.equal('drum kit');
  });

  it('#readEvent should read a deviceName meta event', function(){
    var reader = new MidiReader('\x00\xff\x09\x05Casio');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('deviceName');
    expect(e.text).to.equal('Casio');
  });

  it('#readEvent should read a channelPrefix meta event', function(){
    var reader = new MidiReader('\x00\xff\x20\x01\x02');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('channelPrefix');
    expect(e.text).to.equal(2);
  });

  it('#readEvent should read a port meta event', function(){
    var reader = new MidiReader('\x00\xff\x21\x01\x03');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('port');
    expect(e.port).to.equal(3);
  });

  it('#readEvent should read an endOfTrack meta event', function(){
    var reader = new MidiReader('\x00\xff\x2f\x00');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('endOfTrack');
  });

  it('#readEvent should read a setTempo meta event', function(){
    var reader = new MidiReader('\x00\xFF\x51\x03\x07\xA1\x20');
    e = reader.readEvent();
    expect(e.deltaTime).to.equal(0);
    expect(e.type).to.equal('meta');
    expect(e.subtype).to.equal('setTempo');
    expect(e.microsecondsPerBeat).to.equal(500000);
  });

})





