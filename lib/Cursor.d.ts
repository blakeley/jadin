import Event from "./Event";
interface Callback {
    (event: Event): void;
}
export default class Cursor {
    events: Event[];
    index: number;
    second: number;
    constructor(events: Event[]);
    get nextEvent(): Event;
    get previousEvent(): Event;
    forward(second: number, callbacks?: {
        [key: string]: Callback;
    }): void;
    backward(second: number, callbacks?: {
        [key: string]: Callback;
    }): void;
}
export {};
