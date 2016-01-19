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
  function Track() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    _classCallCheck(this, Track);

    this.events = [];
    this.notes = [];
    this._noteOnEvents = {};

    var reader = new _MidiReader2['default'](data);
    var currentTick = 0;
    while (!reader.isAtEndOfFile()) {
      var _event = reader.readEvent();
      currentTick += _event.deltaTime;
      _event.tick = currentTick;
      this.addEvent(_event);
    }
    // remove unpaired noteOn events
    for (var number in this._noteOnEvents) {
      this.removeEvent(this._noteOnEvents[number]);
    }
  }

  _createClass(Track, [{
    key: 'addEvent',
    value: function addEvent(event) {
      event.track = this;
      this.events.push(event);
      switch (event.subtype) {
        case 'noteOn':
          var invalidEvent = this._noteOnEvents[event.number];
          if (!!invalidEvent) {
            // previous noteOn event was invalid
            this.removeEvent(invalidEvent);
          }
          this._noteOnEvents[event.number] = event;
          break;
        case 'noteOff':
          var noteOnEvent = this._noteOnEvents[event.number];
          if (!noteOnEvent || noteOnEvent.tick >= event.tick) {
            // this noteOff event is invalid - needs corresponding preceding noteOn event
            this.removeEvent(event);
          } else {
            var note = new _Note2['default'](noteOnEvent, event);
            note.track = this;
            this.notes.push(note);
            delete this._noteOnEvents[event.number];
          }
          break;
      }
    }
  }, {
    key: 'removeEvent',
    value: function removeEvent(event) {
      var index = this.events.lastIndexOf(event); // index will typically be near the end of the array
      this.events.splice(index, 1);
    }
  }, {
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