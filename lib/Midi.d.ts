import Track from "./Track";
import Cursor from "./Cursor";
import Event from "./Event";
import Note from "./Note";
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
    get events(): Event[];
    get tempoEvents(): Event[];
    get duration(): number | null;
    tickToSecond(tick: number): number;
    notesOnAt(second: number): Note[];
    notesOnDuring(onSecond: number, offSecond: number): Note[];
}
