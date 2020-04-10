import { Event, RawEvent, NoteOffEvent, NoteOnEvent } from "./Event";
import Note from "./Note";

export default class Cursor {
  index: number;
  second: number;
  notesOn: Set<number>;

  constructor(private readonly events: Event[]) {
    this.index = 0;
    this.second = 0;
    this.notesOn = new Set();
  }

  get nextEvent() {
    return this.events[this.index];
  }

  get previousEvent() {
    return this.events[this.index - 1];
  }

  forward(second: number): Event[] {
    this.second = second;

    const events: Event[] = [];
    while (!!this.nextEvent && this.nextEvent.second! <= second) {
      const event = this.nextEvent;
      events.push(event);

      if (event.raw.type === "channel") {
        if (event.raw.subtype === "noteOn") {
          this.notesOn.add(event.raw.noteNumber);
        } else if (event.raw.subtype === "noteOff") {
          this.notesOn.delete(event.raw.noteNumber);
        }
      }

      this.index++;
    }

    return events;
  }

  backward(second: number): Event[] {
    this.second = second;

    const events: Event[] = [];
    while (!!this.previousEvent && this.previousEvent.second! > second) {
      const event = this.previousEvent;
      events.push(this.previousEvent);

      if (event.raw.type === "channel") {
        if (event.raw.subtype === "noteOn") {
          this.notesOn.delete(event.raw.noteNumber);
        } else if (event.raw.subtype === "noteOff") {
          this.notesOn.add(event.raw.noteNumber);
        }
      }

      this.index--;
    }

    return events;
  }
}
