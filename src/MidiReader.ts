import {
  ProgramNameEvent,
  DeviceNameEvent,
  SequenceNumberEvent,
  TextEvent,
  CopyrightNoticeEvent,
  TrackNameEvent,
  InstrumentNameEvent,
  LyricsEvent,
  MarkerEvent,
  CuePointEvent,
  ChannelPrefixEvent,
  PortPrefixEvent,
  EndOfTrackEvent,
  SetTempoEvent,
  SmpteOffsetEvent,
  TimeSignatureEvent,
  KeySignatureEvent,
  SequencerSpecificEvent,
  UnknownMetaEvent,
  SysExEvent,
  DividedSysExEvent,
  NoteOffEvent,
  NoteOnEvent,
  NoteAftertouchEvent,
  ControllerEvent,
  ProgramChangeEvent,
  ChannelAftertouchEvent,
  PitchBendEvent,
  UnknownChannelEvent,
  RawEvent,
} from "./event";

export default class MidiReader {
  data: string;
  position: number;
  lastStatusByte!: number;

  constructor(data: string) {
    this.data = data;
    this.position = 0;
  }

  read(length: number): string {
    const result = this.data.substr(this.position, length);
    this.position += length;
    return result;
  }

  readInt(numberOfBytes: number) {
    let result = 0;

    while (numberOfBytes > 0) {
      result <<= 8;
      result += this.data.charCodeAt(this.position);
      this.position += 1;
      numberOfBytes -= 1;
    }

    return result;
  }

  readVLQ() {
    let result = 0;
    let octet;

    do {
      result <<= 7;
      octet = this.readInt(1);
      result += octet & 0x7f;
    } while (octet & 0x80);

    return result;
  }

  readEvent(): RawEvent {
    const deltaTime = this.readVLQ();
    const firstByte = this.readInt(1);
    if (firstByte == 0xff) {
      const type = "meta";
      const subtypeByte = this.readInt(1);
      const length = this.readVLQ();

      switch (subtypeByte) {
        case 0x00:
          if (length != 2) {
            throw (
              "Length for this sequenceNumber event was " +
              length +
              ", but must be 2"
            );
          }
          return <SequenceNumberEvent>{
            deltaTime,
            type,
            subtype: "sequenceNumber",
            number: this.readInt(2),
          };
        case 0x01:
          return <TextEvent>{
            deltaTime,
            type,
            subtype: "text",
            text: this.read(length),
          };
        case 0x02:
          return <CopyrightNoticeEvent>{
            deltaTime,
            type,
            subtype: "copyrightNotice",
            text: this.read(length),
          };
        case 0x03:
          return <TrackNameEvent>{
            deltaTime,
            type,
            subtype: "trackName",
            text: this.read(length),
          };
        case 0x04:
          return <InstrumentNameEvent>{
            deltaTime,
            type,
            subtype: "instrumentName",
            text: this.read(length),
          };
        case 0x05:
          return <LyricsEvent>{
            deltaTime,
            type,
            subtype: "lyrics",
            text: this.read(length),
          };
        case 0x06:
          return <MarkerEvent>{
            deltaTime,
            type,
            subtype: "marker",
            text: this.read(length),
          };
        case 0x07:
          return <CuePointEvent>{
            deltaTime,
            type,
            subtype: "cuePoint",
            text: this.read(length),
          };
        case 0x08:
          return <ProgramNameEvent>{
            deltaTime,
            type,
            subtype: "programName",
            text: this.read(length),
          };
        case 0x09:
          return <DeviceNameEvent>{
            deltaTime,
            type,
            subtype: "deviceName",
            text: this.read(length),
          };
        case 0x20:
          if (length !== 1)
            throw new Error(
              "Expected length for channelPrefix event is 1, got " + length
            );

          return <ChannelPrefixEvent>{
            deltaTime,
            type,
            subtype: "channelPrefix",
            channel: this.readInt(1),
          };
        case 0x21:
          if (length !== 1)
            throw new Error(
              "Length for this channelPrefex event was " +
                length +
                ", but must be 1"
            );
          return <PortPrefixEvent>{
            deltaTime,
            type,
            subtype: "portPrefix",
            port: this.readInt(1),
          };
        case 0x2f:
          if (length !== 0)
            throw new Error(
              "Length for this endOfTrack event was " +
                length +
                ", but must be 0"
            );
          return <EndOfTrackEvent>{
            deltaTime,
            type,
            subtype: "endOfTrack",
          };
        case 0x51:
          if (length !== 3)
            throw new Error(
              `Length for this setTempo event was ${length}, but must be 3`
            );
          return <SetTempoEvent>{
            deltaTime,
            type,
            subtype: "setTempo",
            microsecondsPerBeat: this.readInt(3),
          };
        case 0x54:
          if (length !== 5)
            throw new Error(
              `Length for this smpteOffset event was ${length}, but must be 5`
            );

          const table: { [key: number]: number } = {
            0: 24,
            1: 25,
            2: 29.97,
            3: 30,
          };

          const hourByte = this.readInt(1);
          return <SmpteOffsetEvent>{
            deltaTime,
            type,
            subtype: "smpteOffset",
            frameRate: table[hourByte >> 6],
            hours: hourByte & 0x1f,
            minutes: this.readInt(1),
            seconds: this.readInt(1),
            frames: this.readInt(1),
            subframes: this.readInt(1),
          };
        case 0x58:
          if (length !== 4)
            throw new Error(
              "Expected length for timeSignature event is 4, got " + length
            );
          return <TimeSignatureEvent>{
            deltaTime,
            type,
            subtype: "timeSignature",
            numerator: this.readInt(1),
            denominator: Math.pow(2, this.readInt(1)),
            metronome: this.readInt(1),
            thirtySeconds: this.readInt(1),
          };

        case 0x59:
          if (length !== 2)
            throw new Error(
              "Expected length for keySignature event is 2, got " + length
            );
          let key = this.readInt(1);
          if (key > 127) key = 128 - key;
          const scale = ({ 0: "major", 1: "minor" } as any)[this.readInt(1)];
          return <KeySignatureEvent>{
            deltaTime,
            type,
            subtype: "keySignature",
            key,
            scale,
          };
        case 0x7f:
          return <SequencerSpecificEvent>{
            deltaTime,
            type,
            subtype: "sequencerSpecific",
            data: this.read(length),
          };
        default:
          return <UnknownMetaEvent>{
            deltaTime,
            type,
            subtype: "unknown",
            data: this.read(length),
          };
      }
    } else if (firstByte == 0xf0) {
      const length = this.readVLQ();
      return <SysExEvent>{
        deltaTime,
        type: "sysEx",
        data: this.read(length),
      };
    } else {
      let statusByte, dataByte1;
      if (firstByte < 0x80) {
        // running status; first byte is the first data byte
        dataByte1 = firstByte;
        statusByte = this.lastStatusByte;
      } else {
        // new status; first byte is the status byte
        dataByte1 = this.readInt(1);
        statusByte = firstByte;
        this.lastStatusByte = statusByte;
      }

      const channel = statusByte & 0x0f;
      const eventSubtype = statusByte >> 4;
      const type = "channel";
      switch (eventSubtype) {
        case 0x8:
          return <NoteOffEvent>{
            deltaTime,
            type,
            channel,
            subtype: "noteOff",
            noteNumber: dataByte1,
            velocity: this.readInt(1),
          };
        case 0x9:
          const velocity = this.readInt(1);
          return <NoteOnEvent | NoteOffEvent>{
            deltaTime,
            type,
            channel,
            subtype: velocity === 0 ? "noteOff" : "noteOn",
            noteNumber: dataByte1,
            velocity: velocity,
          };
        case 0xa:
          return <NoteAftertouchEvent>{
            deltaTime,
            type,
            channel,
            subtype: "noteAftertouch",
            noteNumber: dataByte1,
            amount: this.readInt(1),
          };
        case 0xb:
          return <ControllerEvent>{
            deltaTime,
            type,
            channel,
            subtype: "controller",
            controllerType: dataByte1,
            value: this.readInt(1),
          };
        case 0xc:
          return <ProgramChangeEvent>{
            deltaTime,
            type,
            channel,
            subtype: "programChange",
            value: dataByte1,
          };
        case 0xd:
          return <ChannelAftertouchEvent>{
            deltaTime,
            type,
            channel,
            subtype: "channelAftertouch",
            amount: dataByte1,
          };
        case 0x0e:
          return <PitchBendEvent>{
            deltaTime,
            type,
            channel,
            subtype: "pitchBend",
            value: dataByte1 + (this.readInt(1) << 7),
          };
        default:
          return <UnknownChannelEvent>{
            deltaTime,
            type,
            channel,
            subtype: "unknown",
            data: this.readInt(1),
          };
      }
    }
  }

  readChunk() {
    const type = this.read(4);
    const length = this.readInt(4);
    const data = this.read(length);

    return {
      type: type,
      length: length,
      data: data,
    };
  }

  isAtEndOfFile() {
    return this.position >= this.data.length;
  }
}
