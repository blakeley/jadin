import Note from './Note';
import Event from './Event';
import Midi from './Midi';
export default class Track {
    events: Event[];
    notes: Note[];
    _noteOnEvents: {
        [key: number]: Event;
    };
    midi: Midi;
    constructor(data?: string);
    addEvent(event: Event): void;
    removeEvent(event: Event): void;
    get index(): number;
    notesOnAt(second: number): Note[];
    notesOnDuring(onSecond: number, offSecond: number): Note[];
}
