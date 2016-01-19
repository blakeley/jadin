import MidiReader from './MidiReader';
import Track from './Track';
import Cursor from './Cursor';
import Event from './Event';

export default class Midi {
  format = 0;
  ppqn = 480;
  tracks: Track[] = [];
  private _tickToSecond: {[key: number]: number} = {};
  private _tempoEvents: Event[] = [];

  constructor(data: string = '') {
    if(!!data){
      const reader = new MidiReader(data);

      const headerChunk = reader.readChunk();
      const headerReader = new MidiReader(headerChunk.data);
      this.format = headerReader.readInt(2);
      if(this.format == 2) throw "MIDI format 2 not supported";
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

  createTrack(data: string = '') {
    const track = new Track(data);
    track.midi = this;
    this.tracks.push(track);
    return track;
  }

  newCursor() {
    return new Cursor(this.events.sort(function(e1,e2){return e1.tick - e2.tick}));
  }

  get notes() {
    return this.tracks
      .map(function(track){return track.notes})
      .reduce(function(a,b){return a.concat(b)});
  }

  get events() {
    return this.tracks
      .map(function(track){return track.events})
      .reduce(function(a,b){return a.concat(b)});
      //.sort(function(e1,e2){return e1.tick < e2.tick});
  }

  get tempoEvents() {
    if(this._tempoEvents) return this._tempoEvents; // return if memoized

    // format 0: All events are on the zeroth track, including tempo events
    // format 1: All tempo events are on the zeroth track
    // format 2: Every track has tempo events (not supported)
    return this._tempoEvents = this.tracks[0].events.filter(function(event){
      return event.subtype == 'setTempo';
    })
  }

  get duration() {
    return this.notes
      .map(function(note){return note.offSecond})
      .reduce(function(a,b){return Math.max(a,b)}, 0)
  }

  tickToSecond(tick) {
    if(this._tickToSecond[tick]) return this._tickToSecond[tick]

    var currentTick = 0;
    var currentTempo = 500000;
    var totalTime = 0;
    for (var i = 0; i < this.tempoEvents.length; i++) {
      var event = this.tempoEvents[i];
      if(event.tick >= tick) break;
      totalTime += ((event.tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
      currentTick = event.tick;
      currentTempo = event.tempo;
    }

    totalTime += ((tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
    return this._tickToSecond[tick] = totalTime;
  }

  notesOnAt(second) {
    return [].concat.apply([], this.tracks.map(function(track){
      return track.notesOnAt(second);
    }));
  }

  notesOnDuring(onSecond, offSecond) {
    return [].concat.apply([], this.tracks.map(function(track){
      return track.notesOnDuring(onSecond, offSecond);
    }));
  }
}
