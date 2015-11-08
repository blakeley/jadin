import MidiReader from './MidiReader';
import Note from './Note';

export default class Track {
  constructor(data) {
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
          noteOnEvents[event.number] = event;
          break;
        case 'noteOff':
          if (noteOnEvents[event.number] === undefined) throw "noteOff event without corresponding noteOn event";
          var noteOnEvent = noteOnEvents[event.number];
          var note = new Note(noteOnEvent, event);
          note.track = this;
          this.notes.push(note);
          break;
      }
    }
  }

  get index() {
    return this.midi.tracks.indexOf(this);
  }

  notesOnAt(second) {
    return this.notes.filter(function(note){
      return note.onAt(second);
    });
  }

  notesOnDuring(onSecond, offSecond) {
    return this.notes.filter(function(note){
      return note.onDuring(onSecond, offSecond);
    });
  }
}
