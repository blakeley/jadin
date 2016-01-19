import MidiReader from './MidiReader';
import Note from './Note';
import Event from './Event';
import Midi from './Midi';

export default class Track {
  events: Event[];
  notes: Note[];
  _noteOnEvents: {[key: number]: Event};
  midi: Midi;

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
    // remove unpaired noteOn events
    for(const number in this._noteOnEvents){
      this.removeEvent(this._noteOnEvents[number]);
    }
  }

  addEvent(event: Event){
    event.track = this;
    this.events.push(event);
    switch(event.subtype){
      case 'noteOn':
        const invalidEvent = this._noteOnEvents[event.number];
        if(!!invalidEvent){ // previous noteOn event was invalid
          this.removeEvent(invalidEvent);
        }
        this._noteOnEvents[event.number] = event;
        break;
      case 'noteOff':
        const noteOnEvent = this._noteOnEvents[event.number];
        if(!noteOnEvent || noteOnEvent.tick >= event.tick){
          // this noteOff event is invalid - needs corresponding preceding noteOn event
          this.removeEvent(event);
        } else {
          const note = new Note(noteOnEvent, event);
          note.track = this;
          this.notes.push(note);
          delete this._noteOnEvents[event.number];
        }
        break;
    }
  }

  removeEvent(event){
    const index = this.events.lastIndexOf(event); // index will typically be near the end of the array
    this.events.splice(index, 1)
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
