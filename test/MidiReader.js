import MidiReader from '../src/MidiReader';
import {expect} from 'chai';
import fs from 'fs';

const cScaleData = fs.readFileSync('fixtures/c.mid', 'binary');

describe('MidiReader', function(){
  it('should construct a MidiReader instance', function(){
    const cScaleMidiReader = new MidiReader(cScaleData);
    expect(cScaleMidiReader).to.not.be.null();
  });

  it('#read should read and return the requested number of bytes', function(){
    const reader = new MidiReader('MThd\x00etc.');
    expect(reader.read(4)).to.equal('MThd');
    expect(reader.position).to.equal(4);
    expect(reader.read(1)).to.equal('\x00');
    expect(reader.position).to.equal(5);
  });

  it('#readInt(1) should read an the next byte as an 8-bit integer', function(){
    const reader = new MidiReader('\x00\x01\x02\x03');
    expect(reader.readInt(1)).to.equal(0)
    expect(reader.position).to.equal(1)
    expect(reader.readInt(1)).to.equal(1)
    expect(reader.position).to.equal(2)
    expect(reader.readInt(1)).to.equal(2)
    expect(reader.readInt(1)).to.equal(3)
  });

  it('#readInt(2) should read the next 2 bytes as a 16-bit integer', function(){
    const reader = new MidiReader('\x00\x01\x02\x03');
    expect(reader.readInt(2)).to.equal(1);
    expect(reader.position).to.equal(2)
    expect(reader.readInt(2)).to.equal(2*256+3);
    expect(reader.position).to.equal(4)
  });

  it('#readInt(3) should read the next 3 bytes as a 24-bit integer', function(){
    const reader = new MidiReader('\x00\x00\x00\x01\x02\x03');
    expect(reader.readInt(3)).to.equal(0);
    expect(reader.position).to.equal(3)
    expect(reader.readInt(3)).to.equal(1*256*256+2*256+3);
    expect(reader.position).to.equal(6)
  });

  it('#readInt(4) should read the next 4 bytes as a 32-bit integer', function(){
    const reader = new MidiReader('\x00\x00\x00\x00\x01\x02\x03\x04');
    expect(reader.readInt(4)).to.equal(0);
    expect(reader.position).to.equal(4)
    expect(reader.readInt(4)).to.equal(16909060);
    expect(reader.position).to.equal(8)
  });

  it('#readVLQ should read the next constiable number of bytes as a constiable length quantity', function(){
    const reader = new MidiReader('\x00\x08\x81\x00\x86\xc3\x17');
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
    const cScaleMidiReader = new MidiReader(cScaleData);
    const chunk = cScaleMidiReader.readChunk();
    expect(chunk.type).to.equal('MThd');
    expect(chunk.length).to.equal(6);
    expect(chunk.data).to.equal('\x00\x01\x00\x03\x01à');
    expect(cScaleMidiReader.position).to.equal(14)
  });

  it('#isAtEndOfFile should return false before reading the entire file', function(){
    const cScaleMidiReader = new MidiReader(cScaleData);
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    const header = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    const track1 = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
    const track2 = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(false);
  });

  it('#isAtEndOfFile should return true after reading the entire file', function(){
    const cScaleMidiReader = new MidiReader(cScaleData);
    const header = cScaleMidiReader.readChunk();
    const track1 = cScaleMidiReader.readChunk();
    const track2 = cScaleMidiReader.readChunk();
    const finalTrack = cScaleMidiReader.readChunk();
    expect(cScaleMidiReader.isAtEndOfFile()).to.equal(true);
  });

  it('#readEvent should read a noteOff event', function(){
    // deltaTime, 8n, number, velocity 
    const reader = new MidiReader('\x00\x81\x3c\x32');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('noteOff');
    expect(event.channel).to.equal(1);
    expect(event.number).to.equal(60);
    expect(event.velocity).to.equal(50);
  });

  it('#readEvent should read a noteOff event during a running status', function(){
    const reader = new MidiReader('\x00\x81\x3c\x32\x01\x3d\x33');
    reader.readEvent();
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(1);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('noteOff');
    expect(event.channel).to.equal(1);
    expect(event.number).to.equal(61);
    expect(event.velocity).to.equal(51);
  });

  it('#readEvent should read a noteOn event', function(){
    // deltaTime, 9n, number, velocity
    const reader = new MidiReader('\x00\x91\x3e\x34');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('noteOn');
    expect(event.channel).to.equal(1);
    expect(event.number).to.equal(62);
    expect(event.velocity).to.equal(52);
  });

  it('#readEvent should read a noteOn event with velocity zero as a noteOff event', function(){
    const reader = new MidiReader('\x00\x91\x3f\x00');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('noteOff');
    expect(event.channel).to.equal(1);
    expect(event.number).to.equal(63);
    expect(event.velocity).to.equal(0);
  });

  it('#readEvent should read an aftertouch event', function(){
    // deltaTime, an, number, pressure
    const reader = new MidiReader('\x00\xa1\x40\x35');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('aftertouch');
    expect(event.channel).to.equal(1);
    expect(event.number).to.equal(64);
    expect(event.pressure).to.equal(53);    
  });

  it('#readEvent should read a controller event', function(){
    // deltaTime, bn, controller, value
    const reader = new MidiReader('\x00\xb1\x41\x36');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('controller');
    expect(event.controller).to.equal(65);
    expect(event.value).to.equal(54);
  });

  it('#readEvent should read a program event', function(){
    // deltaTime, cn, program
    const reader = new MidiReader('\x00\xc1\x42');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('program');
    expect(event.program).to.equal(66);
  });

  it('#readEvent should read a channelPressure event', function(){
    // deltaTime, dn, pressure
    const reader = new MidiReader('\x00\xd1\x43');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('channelPressure');
    expect(event.pressure).to.equal(67);
  });

  it('#readEvent should read a channelPressure event', function(){
    // deltaTime, dn, pressure
    const reader = new MidiReader('\x00\xd1\x43');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('channelPressure');
    expect(event.pressure).to.equal(67);
  });

  it('#readEvent should read a pitchBend event', function(){
    // deltaTime, en, lsb, msb
    const reader = new MidiReader('\x00\xe1\x05\x03');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('channel');
    expect(event.subtype).to.equal('pitchBend');
    expect(event.value).to.equal(389);    
  });

  it('#readEvent should read a sequenceNumber meta event', function(){
    const reader = new MidiReader('\x00\xff\x00\x02\x01\x03')
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('sequenceNumber');
    expect(event.number).to.equal(259);
  });

  it('#readEvent should read a text meta event', function(){
    const reader = new MidiReader('\x00\xff\x01\x09some text');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('text');
    expect(event.text).to.equal('some text');
  });

  it('#readEvent should read a copyright meta event', function(){
    const reader = new MidiReader('\x00\xff\x02\x0f© Noteriver.com');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('copyright');
    expect(event.text).to.equal('© Noteriver.com');
  });

  it('#readEvent should read a trackName meta event', function(){
    const reader = new MidiReader('\x00\xff\x03\x0eUnknown Song 1');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('trackName');
    expect(event.text).to.equal('Unknown Song 1');
  });

  it('#readEvent should read an instrumentName meta event', function(){
    const reader = new MidiReader('\x00\xff\x04\x07Cowbell');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('instrumentName');
    expect(event.text).to.equal('Cowbell');
  });

  it('#readEvent should read a lyric meta event', function(){
    const reader = new MidiReader('\x00\xff\x05\x04hey!');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('lyric');
    expect(event.text).to.equal('hey!');
  });

  it('#readEvent should read a marker meta event', function(){
    const reader = new MidiReader('\x00\xff\x06\x05Verse');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('marker');
    expect(event.text).to.equal('Verse');
  });

  it('#readEvent should read a cuePoint meta event', function(){
    const reader = new MidiReader('\x00\xff\x07\x05Solo');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('cuePoint');
    expect(event.text).to.equal('Solo');
  });

  it('#readEvent should read a programName meta event', function(){
    const reader = new MidiReader('\x00\xff\x08\x08drum kit');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('programName');
    expect(event.text).to.equal('drum kit');
  });

  it('#readEvent should read a deviceName meta event', function(){
    const reader = new MidiReader('\x00\xff\x09\x05Casio');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('deviceName');
    expect(event.text).to.equal('Casio');
  });

  it('#readEvent should read a channelPrefix meta event', function(){
    const reader = new MidiReader('\x00\xff\x20\x01\x02');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('channelPrefix');
    expect(event.text).to.equal(2);
  });

  it('#readEvent should read a port meta event', function(){
    const reader = new MidiReader('\x00\xff\x21\x01\x03');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('port');
    expect(event.port).to.equal(3);
  });

  it('#readEvent should read an endOfTrack meta event', function(){
    const reader = new MidiReader('\x00\xff\x2f\x00');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('endOfTrack');
  });

  it('#readEvent should read a setTempo meta event', function(){
    const reader = new MidiReader('\x00\xff\x51\x03\x07\xA1\x20');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('setTempo');
    expect(event.tempo).to.equal(500000);
  });

  it('#readEvent should read a smpteOffset meta event', function(){
    const reader = new MidiReader('\x00\xff\x54\x05\xc1\x02\x03\x04\x05');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('smpteOffset');
    expect(event.frameRate).to.equal(30);
    expect(event.hours).to.equal(1);
    expect(event.minutes).to.equal(2);
    expect(event.seconds).to.equal(3);
    expect(event.frames).to.equal(4)
    expect(event.subframes).to.equal(5);
  });

  it('#readEvent should read a timeSignature meta event', function(){
    const reader = new MidiReader('\x00\xff\x58\x04\x03\x02\x18\x08');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('timeSignature');
    expect(event.numerator).to.equal(3);
    expect(event.denominator).to.equal(4);
    expect(event.metronome).to.equal(24);
    expect(event.thirtySeconds).to.equal(8);
  });

  it('#readEvent should read a keySignature meta event', function(){
    const reader = new MidiReader('\x00\xff\x59\x02\x83\x01');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('keySignature');
    expect(event.key).to.equal(-3);
    expect(event.scale).to.equal('minor');
  });

  it('#readEvent should read a sequencerSpecific meta event', function(){
    const reader = new MidiReader('\x00\xff\x7f\x04\x41\x04\x01\x56');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('meta');
    expect(event.subtype).to.equal('sequencerSpecific');
    expect(event.data).to.equal('\x41\x04\x01\x56');
  });

  it('#readEvent should read sysEx events', function(){
    const reader = new MidiReader('\x00\xf0\x05\x7e\x00\x09\x01\xf7');
    const event = reader.readEvent();
    expect(event.deltaTime).to.equal(0);
    expect(event.type).to.equal('sysEx');
    expect(event.data).to.equal('\x7e\x00\x09\x01\xf7');
  });
});
