import { Event, RawEvent } from "./Event";
export default class Cursor {
    private readonly events;
    index: number;
    second: number;
    notesOn: Set<number>;
    constructor(events: Event[]);
    get nextEvent(): Event<RawEvent>;
    get previousEvent(): Event<RawEvent>;
    forward(second: number): Event[];
    backward(second: number): Event[];
}
