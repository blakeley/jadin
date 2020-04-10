import Track from "./Track";
import Note from "./Note";
import Midi from "./Midi";
export declare class Event<T extends RawEvent = RawEvent> {
    readonly raw: T;
    readonly track: Track;
    readonly tick: number;
    constructor(raw: T, track: Track, tick: number);
    get midi(): Midi;
    get second(): number;
}
export interface BaseEvent<T extends string> {
    deltaTime: number;
    type: T;
}
export interface MetaEvent<T extends string> extends BaseEvent<"meta"> {
    subtype: T;
}
export interface SequenceNumberEvent extends MetaEvent<"sequenceNumber"> {
    number: number;
}
export interface TextEvent extends MetaEvent<"text"> {
    text: string;
}
export interface CopyrightNoticeEvent extends MetaEvent<"copyrightNotice"> {
    text: string;
}
export interface TrackNameEvent extends MetaEvent<"trackName"> {
    text: string;
}
export interface InstrumentNameEvent extends MetaEvent<"instrumentName"> {
    text: string;
}
export interface LyricsEvent extends MetaEvent<"lyrics"> {
    text: string;
}
export interface MarkerEvent extends MetaEvent<"marker"> {
    text: string;
}
export interface CuePointEvent extends MetaEvent<"cuePoint"> {
    text: string;
}
export interface ProgramNameEvent extends MetaEvent<"programName"> {
    text: string;
}
export interface DeviceNameEvent extends MetaEvent<"deviceName"> {
    text: string;
}
export interface ChannelPrefixEvent extends MetaEvent<"channelPrefix"> {
    channel: number;
}
export interface PortPrefixEvent extends MetaEvent<"portPrefix"> {
    port: number;
}
export interface EndOfTrackEvent extends MetaEvent<"endOfTrack"> {
}
export interface SetTempoEvent extends MetaEvent<"setTempo"> {
    microsecondsPerBeat: number;
}
export interface SmpteOffsetEvent extends MetaEvent<"smpteOffset"> {
    frameRate: number;
    hours: number;
    minutes: number;
    seconds: number;
    frames: number;
    subframes: number;
}
export interface TimeSignatureEvent extends MetaEvent<"timeSignature"> {
    numerator: number;
    denominator: number;
    metronome: number;
    thirtySeconds: number;
}
export interface KeySignatureEvent extends MetaEvent<"keySignature"> {
    key: number;
    scale: number;
}
export interface SequencerSpecificEvent extends MetaEvent<"sequencerSpecific"> {
    data: string;
}
export interface UnknownMetaEvent extends MetaEvent<"unknown"> {
    data: string;
}
export interface ChannelEvent<T extends string> extends BaseEvent<"channel"> {
    channel: number;
    subtype: T;
}
export interface NoteOffEvent extends ChannelEvent<"noteOff"> {
    noteNumber: number;
    velocity: number;
    note?: Note;
}
export interface NoteOnEvent extends ChannelEvent<"noteOn"> {
    noteNumber: number;
    velocity: number;
    note?: Note;
}
export interface NoteAftertouchEvent extends ChannelEvent<"noteAftertouch"> {
    noteNumber: number;
    amount: number;
}
export interface ProgramChangeEvent extends ChannelEvent<"programChange"> {
    value: number;
}
export interface ChannelAftertouchEvent extends ChannelEvent<"channelAftertouch"> {
    amount: number;
}
export interface PitchBendEvent extends ChannelEvent<"pitchBend"> {
    value: number;
}
export interface UnknownChannelEvent extends ChannelEvent<"unknown"> {
    data: number;
}
export interface ControllerEvent extends ChannelEvent<"controller"> {
    controllerType: number;
    value: number;
}
export interface SysExEvent extends BaseEvent<"sysEx"> {
    data: string;
}
export interface DividedSysExEvent extends BaseEvent<"dividedSysEx"> {
    data: number[];
}
export declare type RawEvent = SequenceNumberEvent | TextEvent | CopyrightNoticeEvent | TrackNameEvent | InstrumentNameEvent | LyricsEvent | MarkerEvent | CuePointEvent | DeviceNameEvent | ProgramNameEvent | ChannelPrefixEvent | PortPrefixEvent | EndOfTrackEvent | SetTempoEvent | SmpteOffsetEvent | TimeSignatureEvent | KeySignatureEvent | SequencerSpecificEvent | UnknownMetaEvent | NoteOffEvent | NoteOnEvent | NoteAftertouchEvent | ProgramChangeEvent | ChannelAftertouchEvent | PitchBendEvent | UnknownChannelEvent | ControllerEvent | SysExEvent | DividedSysExEvent;
