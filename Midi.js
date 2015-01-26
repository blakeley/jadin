var MidiReader = require('./MidiReader');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readValue();
  var numberOfTracks = headerReader.readValue();
  this.ppqn = headerReader.readValue(); // assumes metrical timing
  

};

module.exports = Midi;
