import Event from "./Event";
export default class MidiReader {
    data: string;
    position: number;
    lastStatusByte: number;
    constructor(data: string);
    read(length: number): string;
    readInt(numberOfBytes: number): number;
    readVLQ(): number;
    readEvent(): Event | undefined;
    readChunk(): {
        type: string;
        length: number;
        data: string;
    };
    isAtEndOfFile(): boolean;
}
