import Event from './Event';
import Track from './Track';
export default class Note {
    onEvent: Event;
    offEvent: Event;
    track: Track;
    constructor(onEvent?: Event, offEvent?: Event);
    get onTick(): number | undefined;
    set onTick(value: number | undefined);
    get offTick(): number;
    set offTick(value: number);
    get midi(): import("./Midi").default;
    get number(): number | undefined;
    set number(value: number | undefined);
    get onSecond(): number | null;
    get offSecond(): number | null;
    get duration(): number;
    onAt(second: number): boolean;
    onDuring(onSecond: number, offSecond: number): boolean;
}
