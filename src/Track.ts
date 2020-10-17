import MidiReader from "./MidiReader";
import Note from "./Note";
import {
  Event,
  RawEvent,
  NoteOnEvent,
  NoteOffEvent,
  InstrumentNameEvent,
} from "./Event";
import Midi from "./Midi";

export default class Track {
  events: Event[];
  notes: Note[];
  _noteOnEvents: { [key: number]: Event<NoteOnEvent> };
  midi!: Midi;
  patch: number | null = null;

  constructor(data = "") {
    this.events = [];
    this.notes = [];
    this._noteOnEvents = {};

    let reader = new MidiReader(data);
    let currentTick = 0;
    while (!reader.isAtEndOfFile()) {
      const rawEvent = reader.readEvent()!;
      currentTick += rawEvent.deltaTime;
      this.addEvent(rawEvent, currentTick);
    }
    // remove unpaired noteOn events
    for (const number in this._noteOnEvents) {
      this.removeEvent(this._noteOnEvents[number]);
    }
  }

  addEvent(rawEvent: RawEvent, tick: number): Event {
    const event = new Event(rawEvent, this, tick);
    this.events.push(event);

    if (rawEvent.type === "channel") {
      switch (rawEvent.subtype) {
        case "noteOn":
          const invalidEvent = this._noteOnEvents[rawEvent.noteNumber];
          if (!!invalidEvent) {
            // previous noteOn event was invalid
            this.removeEvent(invalidEvent);
          }
          this._noteOnEvents[rawEvent.noteNumber] = event as Event<NoteOnEvent>;
          break;
        case "noteOff":
          const noteOnEvent = this._noteOnEvents[rawEvent.noteNumber];
          if (!noteOnEvent || noteOnEvent.tick! >= event.tick!) {
            // this noteOff event is invalid - needs corresponding preceding noteOn event
            this.removeEvent(event);
          } else {
            const note = new Note(
              noteOnEvent,
              event as Event<NoteOffEvent>,
              this
            );
            this.notes.push(note);
            delete this._noteOnEvents[rawEvent.noteNumber];
          }
          break;
        case "programChange":
          this.patch = rawEvent.value;
          break;
      }
    }

    return event;
  }

  removeEvent(event: Event<RawEvent>) {
    const index = this.events.lastIndexOf(event); // index will typically be near the end of the array
    this.events.splice(index, 1);
  }

  get index() {
    return this.midi.tracks.indexOf(this);
  }

  notesOnAt(second: number) {
    return this.notes.filter(function (note) {
      return note.onAt(second);
    });
  }

  notesOnDuring(onSecond: number, offSecond: number) {
    return this.notes.filter(function (note) {
      return note.onDuring(onSecond, offSecond);
    });
  }

  get instrumentName() {
    return this.events.find(
      (event): event is Event<InstrumentNameEvent> =>
        event.raw.type === "meta" && event.raw.subtype === "instrumentName"
    )?.raw.text;
  }
}
