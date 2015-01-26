var MidiReader = require('./MidiReader');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readValue();
  

};

module.exports = Midi;
