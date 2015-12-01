import MidiReader from './MidiReader';
import Note from './Note';

export default class Track {
  constructor(data='') {
    this.events = [];
    this.notes = [];

    let reader = new MidiReader(data);
    let noteOnEvents = {}
    let currentTick = 0;
    while (!reader.isAtEndOfFile()) {
      const event = reader.readEvent();
      currentTick += event.deltaTime;
      event.tick  = currentTick;
      this.events.push(event);
      switch(event.subtype){
        case 'noteOn':
          noteOnEvents[event.number] = event;
          break;
        case 'noteOff':
          if (noteOnEvents[event.number] === undefined) throw "noteOff event without corresponding noteOn event";
          const noteOnEvent = noteOnEvents[event.number];
          const note = new Note(noteOnEvent, event);
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
