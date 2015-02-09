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
    var currentTick = 0;
    while (!trackReader.isAtEndOfFile()) {
      var event = trackReader.readEvent();
      currentTick += event.deltaTime;
      event.tick  = currentTick;
      this.events.push(event);

      switch(event.subtype){
        case 'noteOn':
          noteOnEvents[event.pitch] = event;
          break;
        case 'noteOff':
          if (noteOnEvents[event.pitch] === undefined) throw "noteOff event without corresponding noteOn event";
          var noteOnEvent = noteOnEvents[event.pitch];
          note = {
            pitch: event.pitch
          };
          this.notes.push(note);
          break;
      }
    }
  }
};


Midi.prototype.tickToSecond = function(tick) {
  var currentTick = 0;
  var currentTempo = 500000;
  var totalTime = 0;
  for (var i = 0; i < this.events.length; i++) {
    event = this.events[i]
    if(event.tick >= tick){
      totalTime += ((tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
      break;
    }
    if(event.subtype == 'setTempo'){
      totalTime += ((event.tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
      currentTick = event.tick;
      currentTempo = event.tempo;
    }
  }

  return totalTime;
}


module.exports = Midi;
