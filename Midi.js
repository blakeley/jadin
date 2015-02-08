var MidiReader = require('./MidiReader');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readInt(2);
  var numberOfTracks = headerReader.readInt(2);
  this.ppqn = headerReader.readInt(2); // assumes metrical timing

  this.events = [];
  this.notes = [];
  for (var i = 0; i < numberOfTracks; i++) {
    var trackChunk = reader.readChunk();
    var trackReader = new MidiReader(trackChunk.data);
    var noteOnEvents = {}
    var totalTicks = 0;
    while (!trackReader.isAtEndOfFile()) {
      var event = trackReader.readEvent();
      totalTicks += event.deltaTime;
      event.startTick  = totalTicks;
      this.events.push(event);
    }
  }


};

module.exports = Midi;
