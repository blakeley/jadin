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