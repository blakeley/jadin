var MidiReader = require('./MidiReader');
var Track = require ('./Track');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readInt(2);
  if(this.format == 2) throw "MIDI format 2 not supported";
  var numberOfTracks = headerReader.readInt(2);
  this.ppqn = headerReader.readInt(2); // assumes metrical timing

  this.tracks = [];
  for (var i = 0; i < numberOfTracks; i++) {
    var trackChunk = reader.readChunk();
    var track = new Track(trackChunk.data);
    track.midi = this;
    this.tracks.push(track);
  }
};

Midi.prototype = {
  get notes(){
    return this.tracks
      .map(function(track){return track.notes})
      .reduce(function(a,b){return a.concat(b)});
  },

  get events(){
    return this.tracks
      .map(function(track){return track.events})
      .reduce(function(a,b){return a.concat(b)});
  },

  get tempoEvents(){
    if(this._tempoEvents) return this._tempoEvents; // return if memoized

    // format 0: All events are on the zeroth track, including tempo events
    // format 1: All tempo events are on the zeroth track
    // format 2: Every track has tempo events (not supported)
    return this._tempoEvents = this.tracks[0].events.filter(function(event){
      return event.subtype == 'setTempo';
    })
  },

  get duration(){
    return this.notes
      .map(function(note){return note.offSecond})
      .reduce(function(a,b){return Math.max(a,b)})
  },
};

Midi.prototype.tickToSecond = function(tick) {
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
  return totalTime;
};

Midi.prototype.notesOnAt = function(second) {
  return [].concat.apply([], this.tracks.map(function(track){
    return track.notesOnAt(second);
  }));
};

Midi.prototype.notesOnDuring = function(onSecond, offSecond) {
  return [].concat.apply([], this.tracks.map(function(track){
    return track.notesOnDuring(onSecond, offSecond);
  }));
};

module.exports = Midi;
