import { Event, NoteOnEvent, NoteOffEvent } from "./Event";
import Track from "./Track";
export default class Note {
    private readonly onEvent;
    private readonly offEvent;
    private readonly track;
    constructor(onEvent: Event<NoteOnEvent>, offEvent: Event<NoteOffEvent>, track: Track);
    get onTick(): number;
    get offTick(): number;
    get midi(): import("./Midi").default;
    get number(): number;
    get onSecond(): number;
    get offSecond(): number;
    get duration(): number;
    onAt(second: number): boolean;
    onDuring(onSecond: number, offSecond: number): boolean;
}
