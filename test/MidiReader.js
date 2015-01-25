var MidiReader = require('../MidiReader');
var expect = require('chai').expect;
var fs = require('fs');

var cScaleData = fs.readFileSync('fixtures/c.mid', 'utf8');
var cScaleMidiReader = new MidiReader(cScaleData);

describe('MidiReader', function(){
  beforeEach(function(){
    //cScaleMidiReader.position = 0;
  });  

  it('should construct a MidiReader instance', function(){
    expect(cScaleMidiReader).to.not.be.null();
  });

  it('#read should read and return the requested number of bytes', function(){
    cScaleMidiReader.positio = 0;
    result = cScaleMidiReader.read(4);
    expect(result).to.equal('MThd');
    expect(cScaleMidiReader.position).to.equal(4);
  });

  it('#readLength should read the next 4 bytes as a 32-bit MSB-first binary number', function(){
    cScaleMidiReader.position = 4
    expect(cScaleMidiReader.readLength()).to.equal(6);
    expect(cScaleMidiReader.position).to.equal(8)
  });

  it('#readChunk should read a MIDI "chunk"', function(){
    cScaleMidiReader.position = 0;
    chunk = cScaleMidiReader.readChunk()
    expect(chunk.type).to.equal('MThd');
    expect(chunk.length).to.equal(6);
    expect(chunk.data).to.equal('\u0000\u0001\u0000\u0002\u0000`');
    expect(cScaleMidiReader.position).to.equal(14)
  })

})

