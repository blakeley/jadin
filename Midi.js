var MidiReader = require('./MidiReader');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readInt(2);
  var numberOfTracks = headerReader.readInt(2);
  this.ppqn = headerReader.readInt(2); // assumes metrical timing
  
  this.events = [];
  for (var i = 0; i < numberOfTracks; i++) {
    var trackChunk = reader.readChunk();
    if (trackChunk.type != 'MTrk') {
      throw "Unexpected chunk type - expected MTrk, got " + trackChunk.type;
    }
    var trackReader = new MidiReader(trackChunk.data);
    while (!trackReader.isAtEndOfFile()) {
      var event = trackReader.readEvent();
      this.events.push(event);
    }
  }


};

module.exports = Midi;
