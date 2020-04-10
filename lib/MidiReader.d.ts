import { RawEvent } from "./event";
export default class MidiReader {
    data: string;
    position: number;
    lastStatusByte: number;
    constructor(data: string);
    read(length: number): string;
    readInt(numberOfBytes: number): number;
    readVLQ(): number;
    readEvent(): RawEvent;
    readChunk(): {
        type: string;
        length: number;
        data: string;
    };
    isAtEndOfFile(): boolean;
}
