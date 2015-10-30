(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Midi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./MidiReader":2,"./Track":4}],2:[function(require,module,exports){
function MidiReader(data) {
  this.data = data;
  this.position = 0;
};

MidiReader.prototype.read = function(length) {
  var result = this.data.substr(this.position, length);
  this.position += length;
  return result;
}

MidiReader.prototype.readInt = function(numberOfBytes) {
  var result = 0;

  while(numberOfBytes > 0){
    result <<= 8;
    result += this.data.charCodeAt(this.position);
    this.position += 1;
    numberOfBytes -= 1;
  }

  return result;
}

MidiReader.prototype.readVLQ = function() {
  var result = 0;

  do {
    result <<= 7;
    octet = this.readInt(1);
    result += (octet & 0x7f);
  } while (octet & 0x80)

  return result;
}

MidiReader.prototype.readEvent = function() {
  var event = {};
  event.deltaTime = this.readVLQ();

  var firstByte = this.readInt(1);
  if(firstByte == 0xff){
    event.type = 'meta';
    var subtypeByte = this.readInt(1);
    var length = this.readVLQ();
    switch(subtypeByte){
      case 0x00:
        event.subtype = 'sequenceNumber';
        if (length != 2) throw "Length for this sequenceNumber event was " + length + ", but must be 2";
        event.number = this.readInt(2);
        return event;
      case 0x01:
        event.subtype = 'text';
        event.text = this.read(length);
        return event;
      case 0x02:
        event.subtype = 'copyright';
        event.text = this.read(length);
        return event;
      case 0x03:
        event.subtype = 'trackName';
        event.text = this.read(length);
        return event;
      case 0x04:
        event.subtype = 'instrumentName';
        event.text = this.read(length);
        return event;
      case 0x05:
        event.subtype = 'lyric';
        event.text = this.read(length);
        return event;
      case 0x06:
        event.subtype = 'marker';
        event.text = this.read(length);
        return event;
      case 0x07:
        event.subtype = 'cuePoint';
        event.text = this.read(length);
        return event;
      case 0x08:
        event.subtype = 'programName';
        event.text = this.read(length);
        return event;
      case 0x09:
        event.subtype = 'deviceName';
        event.text = this.read(length);
        return event;
      case 0x20:
        event.subtype = 'channelPrefix';
        event.text = this.readInt(1);
        if (length != 1) throw "Length for this midiChannelPrefix event was " + length + ", but must be 1";
        return event;
      case 0x21:
        event.subtype = 'port';
        event.port = this.readInt(1);
        if (length != 1) throw "Length for this port event was " + length + ", but must be 1";
        return event;
      case 0x2f:
        event.subtype = 'endOfTrack';
        if (length != 0) throw "Length for this endOfTrack event was " + length + ", but must be 0";
        return event;
      case 0x51:
        event.subtype = 'setTempo';
        if (length != 3) throw "Length for this setTempo event was " + length + ", but must be 3";
        event.tempo = this.readInt(3);
        return event;
      case 0x54:
        event.subtype = 'smpteOffset';
        if (length != 5) throw "Length for this smpteOffset event was " + length + ", but must be 5";
        var hourByte = this.readInt(1);
        event.frameRate = {0: 24, 1: 25, 2: 29.97, 3: 30}[hourByte >> 6];
        event.hours = hourByte & 0x1f;
        event.minutes = this.readInt(1);
        event.seconds = this.readInt(1);
        event.frames = this.readInt(1);
        event.subframes = this.readInt(1);
        return event;
      case 0x58:
        event.subtype = 'timeSignature';
        if (length != 4) throw "Length for this timeSignature event was " + length + ", but must be 4";
        event.numerator = this.readInt(1);
        event.denominator = Math.pow(2, this.readInt(1));
        event.metronome = this.readInt(1);
        event.thirtySeconds = this.readInt(1);
        return event;
      case 0x59:
        event.subtype = 'keySignature';
        if (length != 2) throw "Length for this keySignature event was " + length + ", but must be 2";
        event.key = this.readInt(1);
        if (event.key > 127) event.key = 128 - event.key;
        event.scale = {0: 'major', 1: 'minor'}[this.readInt(1)];
        return event;
      case 0x7f:
        event.subtype = 'sequencerSpecific';
        event.data = this.read(length);
        return event;
    }
  } else if(firstByte == 0xf0) {
    event.type = 'sysEx';
    var length = this.readVLQ();
    event.data = this.read(length);
    return event;
  } else {
    event.type = 'channel';
    var statusByte, dataByte1;
    if(firstByte < 0x80){ // running status; first byte is the first data byte
      dataByte1 = firstByte;
      statusByte = this.lastStatusByte; 
    } else { // new status; first byte is the status byte
      dataByte1 = this.readInt(1);
      statusByte = firstByte;
      this.lastStatusByte = statusByte;
    }

    event.channel = statusByte & 0x0f;
    var eventSubtype = statusByte >> 4;
    switch(eventSubtype) {
      case 0x8:
        event.subtype = 'noteOff';
        event.number = dataByte1;
        event.velocity = this.readInt(1);
        return event;
      case 0x9:
        event.number = dataByte1;
        event.velocity = this.readInt(1);
        event.subtype = (event.velocity==0 ? 'noteOff' : 'noteOn')
        return event;
      case 0xa:
        event.subtype = 'aftertouch';
        event.number = dataByte1;
        event.pressure = this.readInt(1);
        return event;
      case 0xb:
        event.subtype = 'controller';
        event.controller = dataByte1;
        event.value = this.readInt(1);
        return event;
      case 0xc:
        event.subtype = 'program';
        event.program = dataByte1;
        return event;
      case 0xd:
        event.subtype = 'channelPressure';
        event.pressure = dataByte1;
        return event;
      case 0xe:
        event.subtype = 'pitchBend';
        event.value = (this.readInt(1) << 7) + dataByte1
        return event;
    }    
  }





}


MidiReader.prototype.readChunk = function(){
  var type = this.read(4);
  var length = this.readInt(4);
  var data = this.read(length);
  return {
    type: type,
    length: length,
    data: data,
  };
};

MidiReader.prototype.isAtEndOfFile = function(){
  return this.position >= this.data.length;
}

module.exports = MidiReader;

},{}],3:[function(require,module,exports){
function Note(onEvent, offEvent) {
  this.number = onEvent.number;
  this.onTick = onEvent.tick;
  this.offTick = offEvent.tick;

  Object.defineProperty(this, 'midi', {
    get: function() {
      return this.track.midi;
    }
  });

  Object.defineProperty(this, 'onSecond', {
    get: function() {
      return this.midi.tickToSecond(this.onTick);
    }
  });

  Object.defineProperty(this, 'offSecond', {
    get: function() {
      return this.midi.tickToSecond(this.offTick);
    }
  });

  Object.defineProperty(this, 'duration', {
    get: function() {
      return this.offSecond - this.onSecond;
    }
  });
};

Note.prototype.onAt = function(second){
  return this.onSecond <= second && second <= this.offSecond;  
};

Note.prototype.onDuring = function(onSecond, offSecond){
  return this.onSecond <= offSecond && this.offSecond >= onSecond;
};



module.exports = Note;

},{}],4:[function(require,module,exports){
var MidiReader = require('./MidiReader');
var Note = require('./Note');

function Track(data) {
  this.events = [];
  this.notes = [];

  var reader = new MidiReader(data);
  var noteOnEvents = {}
  var currentTick = 0;
  while (!reader.isAtEndOfFile()) {
    var event = reader.readEvent();
    currentTick += event.deltaTime;
    event.tick  = currentTick;
    this.events.push(event);
    switch(event.subtype){
      case 'noteOn':
        noteOnEvents[event.number] = event;
        break;
      case 'noteOff':
        if (noteOnEvents[event.number] === undefined) throw "noteOff event without corresponding noteOn event";
        var noteOnEvent = noteOnEvents[event.number];
        var note = new Note(noteOnEvent, event);
        note.track = this;
        this.notes.push(note);
        break;
    }
  }

  Object.defineProperty(this, 'index', {
    get: function() {
      return this.midi.tracks.indexOf(this);
    }
  });
}

Track.prototype.notesOnAt = function(second){
  return this.notes.filter(function(note){
    return note.onAt(second);
  });
};

Track.prototype.notesOnDuring = function(onSecond, offSecond){
  return this.notes.filter(function(note){
    return note.onDuring(onSecond, offSecond);
  });
};



module.exports = Track;

},{"./MidiReader":2,"./Note":3}]},{},[1])(1)
});