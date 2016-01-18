import MidiReader from './MidiReader';
import Note from './Note';

export default class Track {
  constructor(data='') {
    this.events = [];
    this.notes = [];
    this._noteOnEvents = {}

    let reader = new MidiReader(data);
    let currentTick = 0;
    while (!reader.isAtEndOfFile()) {
      const event = reader.readEvent();
      currentTick += event.deltaTime;
      event.tick  = currentTick;
      this.addEvent(event);
    }
  }

  addEvent(event){
    event.track = this;
    this.events.push(event);
    switch(event.subtype){
      case 'noteOn':
        const invalidEvent = this._noteOnEvents[event.number]
        if(!!invalidEvent){ // previous noteOn event was invalid
          this.events.splice(this.events.indexOf(invalidEvent), 1); // remove that event
        }
        this._noteOnEvents[event.number] = event;
        break;
      case 'noteOff':
        const noteOnEvent = this._noteOnEvents[event.number];
        if (!!noteOnEvent){
          this._noteOnEvents[event.number] = undefined;
          const note = new Note(noteOnEvent, event);
          note.track = this;
          this.notes.push(note);
        } else { // this noteOff event is invalid
          this.events.pop(); // remove this event
        }
        break;
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
