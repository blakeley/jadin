var MidiReader = require('./MidiReader');
var Track = require ('./Track');

function Midi(data) {
  var reader = new MidiReader(data);

  var headerChunk = reader.readChunk();
  var headerReader = new MidiReader(headerChunk.data);
  this.format = headerReader.readInt(2);
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
  }
};


Midi.prototype.tickToSecond = function(tick) {
  var currentTick = 0;
  var currentTempo = 500000;
  var totalTime = 0;
  for (var i = 0; i < this.events.length; i++) {
    event = this.events[i]
    if(event.tick >= tick){
      break;
    }
    if(event.subtype == 'setTempo'){
      totalTime += ((event.tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
      currentTick = event.tick;
      currentTempo = event.tempo;
    }
  }

  totalTime += ((tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
  return totalTime;

}


module.exports = Midi;
