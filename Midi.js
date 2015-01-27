var MidiReader = require('./MidiReader');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readInt16();
  var numberOfTracks = headerReader.readInt16();
  this.ppqn = headerReader.readInt16(); // assumes metrical timing
  

};

module.exports = Midi;
