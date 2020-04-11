import MidiReader from "./MidiReader";
import Track from "./Track";
import Cursor from "./Cursor";
import { RawEvent, SetTempoEvent, Event } from "./Event";
import Note from "./Note";

declare global {
  interface Array<T> {
    last(): T | undefined;
  }
}

Array.prototype.last = function () {
  return this[this.length - 1];
};

export default class Midi {
  format: number;
  ppqn: number;
  tracks: Track[];
  private _tickToSecond: { [key: number]: number };
  private _tempoEvents: Event<SetTempoEvent>[];

  constructor(data?: string) {
    this.format = 0;
    this.ppqn = 480;
    this.tracks = [];
    this._tickToSecond = {};
    this._tempoEvents = [];

    if (!!data) {
      const reader = new MidiReader(data);

      const headerChunk = reader.readChunk();
      const headerReader = new MidiReader(headerChunk.data);
      this.format = headerReader.readInt(2);
      if (this.format == 2) throw "MIDI format 2 not supported";
      const numberOfTracks = headerReader.readInt(2);
      this.ppqn = headerReader.readInt(2); // assumes metrical timing

      for (let i = 0; i < numberOfTracks; i++) {
        const trackChunk = reader.readChunk();
        this.createTrack(trackChunk.data);
      }
    } else {
      const tempoTrack = this.createTrack();
    }
  }

  createTrack(data?: string) {
    const track = new Track(data);
    track.midi = this;
    this.tracks.push(track);
    return track;
  }

  newCursor() {
    return new Cursor(
      this.events.sort(function (e1, e2) {
        return e1.tick! - e2.tick!;
      })
    );
  }

  get notes() {
    return this.tracks
      .map(function (track) {
        return track.notes;
      })
      .reduce(function (a, b) {
        return a.concat(b);
      });
  }

  get events() {
    return this.tracks
      .map(function (track) {
        return track.events;
      })
      .reduce(function (a, b) {
        return a.concat(b);
      });
    //.sort(function(e1,e2){return e1.tick < e2.tick});
  }

  get tempoEvents(): Event<SetTempoEvent>[] {
    if (this._tempoEvents.length > 0) return this._tempoEvents; // return if memoized

    function isSetTempoEvent(
      event: Event<RawEvent>
    ): event is Event<SetTempoEvent> {
      return event.raw.type === "meta" && event.raw.subtype === "setTempo";
    }
    // format 0: All events are on the zeroth track, including tempo events
    // format 1: All tempo events are on the zeroth track
    // format 2: Every track has tempo events (not supported)
    return this.tracks[0].events.filter(isSetTempoEvent);
  }

  get duration() {
    return Math.max(
      ...this.tracks.map((track) => track.notes.last()?.offSecond || 0)
    );
  }

  tickToSecond(tick: number) {
    if (this._tickToSecond[tick]) return this._tickToSecond[tick];

    var currentTick = 0;
    var currentTempo = 500000;
    var totalTime = 0;
    for (var i = 0; i < this.tempoEvents.length; i++) {
      var event = this.tempoEvents[i];
      if (event.tick! >= tick) break;
      totalTime +=
        (((event.tick! - currentTick) / this.ppqn) * currentTempo) / 1000000.0;
      currentTick = event.tick!;
      currentTempo = event.raw.microsecondsPerBeat;
    }

    totalTime +=
      (((tick - currentTick) / this.ppqn) * currentTempo) / 1000000.0;
    return (this._tickToSecond[tick] = totalTime);
  }

  notesOnAt(second: number): Note[] {
    return [].concat(
      ...(this.tracks.map((track) => track.notesOnAt(second)) as any)
    );
  }

  notesOnDuring(onSecond: number, offSecond: number): Note[] {
    return [].concat(
      ...(this.tracks.map((track) =>
        track.notesOnDuring(onSecond, offSecond)
      ) as any)
    );
  }
}
