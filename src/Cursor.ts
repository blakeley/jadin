import { Event } from "./Event";

export default class Cursor {
  index: number;
  second: number;

  constructor(private readonly events: Event[]) {
    this.index = 0;
    this.second = 0;
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
      events.push(this.nextEvent);

      this.index++;
    }
    return events;
  }

  backward(second: number): Event[] {
    this.second = second;

    const events: Event[] = [];
    while (!!this.previousEvent && this.previousEvent.second! > second) {
      events.push(this.previousEvent);

      this.index--;
    }
    return events;
  }
}
