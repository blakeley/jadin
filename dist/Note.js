"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Note = (function () {
  function Note(number, onTick, offTick) {
    _classCallCheck(this, Note);

    this.number = number;
    this._onTick = onTick;
    this._offTick = offTick;
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
    key: "onTick",
    get: function get() {
      return this._onTick;
    },
    set: function set(value) {
      if (value >= this.offTick) throw "Cannot set onTick to be greater than or equal to offTick";
      this._onTick = value;
    }
  }, {
    key: "offTick",
    get: function get() {
      return this._offTick;
    },
    set: function set(value) {
      if (value <= this.onTick) throw "Cannot set offTick to be less than or equal to onTick";
      this._offTick = value;
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