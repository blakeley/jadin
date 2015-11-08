(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Midi = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _MidiReader = require('./MidiReader');

var _MidiReader2 = _interopRequireDefault(_MidiReader);

var _Track = require('./Track');

var _Track2 = _interopRequireDefault(_Track);

var Midi = (function () {
  function Midi(data) {
    _classCallCheck(this, Midi);

    var reader = new _MidiReader2['default'](data);

    var headerChunk = reader.readChunk();
    var headerReader = new _MidiReader2['default'](headerChunk.data);
    this.format = headerReader.readInt(2);
    if (this.format == 2) throw "MIDI format 2 not supported";
    var numberOfTracks = headerReader.readInt(2);
    this.ppqn = headerReader.readInt(2); // assumes metrical timing

    this.tracks = [];
    for (var i = 0; i < numberOfTracks; i++) {
      var trackChunk = reader.readChunk();
      var track = new _Track2['default'](trackChunk.data);
      track.midi = this;
      this.tracks.push(track);
    }

    this._tickToSecond = {};
  }

  _createClass(Midi, [{
    key: 'tickToSecond',
    value: function tickToSecond(tick) {
      if (this._tickToSecond[tick]) return this._tickToSecond[tick];

      var currentTick = 0;
      var currentTempo = 500000;
      var totalTime = 0;
      for (var i = 0; i < this.tempoEvents.length; i++) {
        var event = this.tempoEvents[i];
        if (event.tick >= tick) break;
        totalTime += (event.tick - currentTick) / this.ppqn * currentTempo / 1000000.0;
        currentTick = event.tick;
        currentTempo = event.tempo;
      }

      totalTime += (tick - currentTick) / this.ppqn * currentTempo / 1000000.0;
      return this._tickToSecond[tick] = totalTime;
    }
  }, {
    key: 'notesOnAt',
    value: function notesOnAt(second) {
      return [].concat.apply([], this.tracks.map(function (track) {
        return track.notesOnAt(second);
      }));
    }
  }, {
    key: 'notesOnDuring',
    value: function notesOnDuring(onSecond, offSecond) {
      return [].concat.apply([], this.tracks.map(function (track) {
        return track.notesOnDuring(onSecond, offSecond);
      }));
    }
  }, {
    key: 'notes',
    get: function get() {
      return this.tracks.map(function (track) {
        return track.notes;
      }).reduce(function (a, b) {
        return a.concat(b);
      });
    }
  }, {
    key: 'events',
    get: function get() {
      return this.tracks.map(function (track) {
        return track.events;
      }).reduce(function (a, b) {
        return a.concat(b);
      });
    }
  }, {
    key: 'tempoEvents',
    get: function get() {
      if (this._tempoEvents) return this._tempoEvents; // return if memoized

      // format 0: All events are on the zeroth track, including tempo events
      // format 1: All tempo events are on the zeroth track
      // format 2: Every track has tempo events (not supported)
      return this._tempoEvents = this.tracks[0].events.filter(function (event) {
        return event.subtype == 'setTempo';
      });
    }
  }, {
    key: 'duration',
    get: function get() {
      return this.notes.map(function (note) {
        return note.offSecond;
      }).reduce(function (a, b) {
        return Math.max(a, b);
      });
    }
  }]);

  return Midi;
})();

exports['default'] = Midi;
module.exports = exports['default'];
},{"./MidiReader":2,"./Track":4}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MidiReader = (function () {
  function MidiReader(data) {
    _classCallCheck(this, MidiReader);

    this.data = data;
    this.position = 0;
  }

  _createClass(MidiReader, [{
    key: 'read',
    value: function read(length) {
      var result = this.data.substr(this.position, length);
      this.position += length;
      return result;
    }
  }, {
    key: 'readInt',
    value: function readInt(numberOfBytes) {
      var result = 0;

      while (numberOfBytes > 0) {
        result <<= 8;
        result += this.data.charCodeAt(this.position);
        this.position += 1;
        numberOfBytes -= 1;
      }

      return result;
    }
  }, {
    key: 'readVLQ',
    value: function readVLQ() {
      var result = 0;
      var octet = undefined;

      do {
        result <<= 7;
        octet = this.readInt(1);
        result += octet & 0x7f;
      } while (octet & 0x80);

      return result;
    }
  }, {
    key: 'readEvent',
    value: function readEvent() {
      var event = {};
      event.deltaTime = this.readVLQ();

      var firstByte = this.readInt(1);
      if (firstByte == 0xff) {
        event.type = 'meta';
        var subtypeByte = this.readInt(1);
        var length = this.readVLQ();
        switch (subtypeByte) {
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
            event.frameRate = ({ 0: 24, 1: 25, 2: 29.97, 3: 30 })[hourByte >> 6];
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
            event.scale = ({ 0: 'major', 1: 'minor' })[this.readInt(1)];
            return event;
          case 0x7f:
            event.subtype = 'sequencerSpecific';
            event.data = this.read(length);
            return event;
        }
      } else if (firstByte == 0xf0) {
        event.type = 'sysEx';
        var length = this.readVLQ();
        event.data = this.read(length);
        return event;
      } else {
        event.type = 'channel';
        var statusByte, dataByte1;
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

        event.channel = statusByte & 0x0f;
        var eventSubtype = statusByte >> 4;
        switch (eventSubtype) {
          case 0x8:
            event.subtype = 'noteOff';
            event.number = dataByte1;
            event.velocity = this.readInt(1);
            return event;
          case 0x9:
            event.number = dataByte1;
            event.velocity = this.readInt(1);
            event.subtype = event.velocity == 0 ? 'noteOff' : 'noteOn';
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
            event.value = (this.readInt(1) << 7) + dataByte1;
            return event;
        }
      }
    }
  }, {
    key: 'readChunk',
    value: function readChunk() {
      var type = this.read(4);
      var length = this.readInt(4);
      var data = this.read(length);
      return {
        type: type,
        length: length,
        data: data
      };
    }
  }, {
    key: 'isAtEndOfFile',
    value: function isAtEndOfFile() {
      return this.position >= this.data.length;
    }
  }]);

  return MidiReader;
})();

exports['default'] = MidiReader;
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Note = (function () {
  function Note(onEvent, offEvent) {
    _classCallCheck(this, Note);

    this.number = onEvent.number;
    this.onTick = onEvent.tick;
    this.offTick = offEvent.tick;
  }

  _createClass(Note, [{
    key: "onAt",
    value: function onAt(second) {
      return this.onSecond <= second && second <= this.offSecond;
    }
  }, {
    key: "onDuring",
    value: function onDuring(onSecond, offSecond) {
      return this.onSecond <= offSecond && this.offSecond >= onSecond;
    }
  }, {
    key: "midi",
    get: function get() {
      return this.track.midi;
    }
  }, {
    key: "onSecond",
    get: function get() {
      return this.midi.tickToSecond(this.onTick);
    }
  }, {
    key: "offSecond",
    get: function get() {
      return this.midi.tickToSecond(this.offTick);
    }
  }, {
    key: "duration",
    get: function get() {
      return this.offSecond - this.onSecond;
    }
  }]);

  return Note;
})();

exports["default"] = Note;
module.exports = exports["default"];
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _MidiReader = require('./MidiReader');

var _MidiReader2 = _interopRequireDefault(_MidiReader);

var _Note = require('./Note');

var _Note2 = _interopRequireDefault(_Note);

var Track = (function () {
  function Track(data) {
    _classCallCheck(this, Track);

    this.events = [];
    this.notes = [];

    var reader = new _MidiReader2['default'](data);
    var noteOnEvents = {};
    var currentTick = 0;
    while (!reader.isAtEndOfFile()) {
      var event = reader.readEvent();
      currentTick += event.deltaTime;
      event.tick = currentTick;
      this.events.push(event);
      switch (event.subtype) {
        case 'noteOn':
          noteOnEvents[event.number] = event;
          break;
        case 'noteOff':
          if (noteOnEvents[event.number] === undefined) throw "noteOff event without corresponding noteOn event";
          var noteOnEvent = noteOnEvents[event.number];
          var note = new _Note2['default'](noteOnEvent, event);
          note.track = this;
          this.notes.push(note);
          break;
      }
    }
  }

  _createClass(Track, [{
    key: 'notesOnAt',
    value: function notesOnAt(second) {
      return this.notes.filter(function (note) {
        return note.onAt(second);
      });
    }
  }, {
    key: 'notesOnDuring',
    value: function notesOnDuring(onSecond, offSecond) {
      return this.notes.filter(function (note) {
        return note.onDuring(onSecond, offSecond);
      });
    }
  }, {
    key: 'index',
    get: function get() {
      return this.midi.tracks.indexOf(this);
    }
  }]);

  return Track;
})();

exports['default'] = Track;
module.exports = exports['default'];
},{"./MidiReader":2,"./Note":3}]},{},[1])(1)
});