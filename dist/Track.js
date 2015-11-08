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