var MidiReader = require('./MidiReader');
var Note = require('./Note');

function Track(data) {
  this.events = [];
  this.notes = [];

  var reader = new MidiReader(data);
  var noteOnEvents = {}
  var currentTick = 0;
  while (!reader.isAtEndOfFile()) {
    var event = reader.readEvent();
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
        var note = new Note(noteOnEvent, event);
        this.notes.push(note);
        break;
    }
  }

}



module.exports = Track;
