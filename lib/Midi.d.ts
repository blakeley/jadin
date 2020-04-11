import Track from "./Track";
import Cursor from "./Cursor";
import { RawEvent, SetTempoEvent, Event } from "./Event";
import Note from "./Note";
declare global {
    interface Array<T> {
        last(): T | undefined;
    }
}
export default class Midi {
    format: number;
    ppqn: number;
    tracks: Track[];
    private _tickToSecond;
    private _tempoEvents;
    constructor(data?: string);
    createTrack(data?: string): Track;
    newCursor(): Cursor;
    get notes(): Note[];
    get events(): Event<RawEvent>[];
    get tempoEvents(): Event<SetTempoEvent>[];
    get duration(): number;
    tickToSecond(tick: number): number;
    notesOnAt(second: number): Note[];
    notesOnDuring(onSecond: number, offSecond: number): Note[];
}
