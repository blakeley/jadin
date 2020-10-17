import Note from "./Note";
import { Event, RawEvent, NoteOnEvent } from "./Event";
import Midi from "./Midi";
export default class Track {
    events: Event[];
    notes: Note[];
    _noteOnEvents: {
        [key: number]: Event<NoteOnEvent>;
    };
    midi: Midi;
    patch: number | null;
    constructor(data?: string);
    addEvent(rawEvent: RawEvent, tick: number): Event;
    removeEvent(event: Event<RawEvent>): void;
    get index(): number;
    notesOnAt(second: number): Note[];
    notesOnDuring(onSecond: number, offSecond: number): Note[];
    get instrumentName(): string | undefined;
}
