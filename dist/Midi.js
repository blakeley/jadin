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

    this.format = 0;
    this.ppqn = 480;
    this.tracks = [];
    this._tickToSecond = {};

    if (!!data) {
      var reader = new _MidiReader2['default'](data);

      var headerChunk = reader.readChunk();
      var headerReader = new _MidiReader2['default'](headerChunk.data);
      this.format = headerReader.readInt(2);
      if (this.format == 2) throw "MIDI format 2 not supported";
      var numberOfTracks = headerReader.readInt(2);
      this.ppqn = headerReader.readInt(2); // assumes metrical timing

      for (var i = 0; i < numberOfTracks; i++) {
        var trackChunk = reader.readChunk();
        this.createTrack(trackChunk.data);
      }
    } else {
      var tempoTrack = this.createTrack();
    }
  }

  _createClass(Midi, [{
    key: 'createTrack',
    value: function createTrack(data) {
      var track = new _Track2['default'](data);
      track.midi = this;
      this.tracks.push(track);
      return track;
    }
  }, {
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