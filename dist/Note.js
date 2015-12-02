"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Note = (function () {
  function Note() {
    var onEvent = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var offEvent = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Note);

    this.onEvent = onEvent;
    this.offEvent = offEvent;
    onEvent.note = this;
    offEvent.note = this;
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
      return this.onEvent.tick;
    },
    set: function set(value) {
      if (value >= this.offTick) throw "Cannot set onTick to be greater than or equal to offTick";
      this.onEvent.tick = value;
    }
  }, {
    key: "offTick",
    get: function get() {
      return this.offEvent.tick;
    },
    set: function set(value) {
      if (value <= this.onTick) throw "Cannot set offTick to be less than or equal to onTick";
      this.offEvent.tick = value;
    }
  }, {
    key: "midi",
    get: function get() {
      return this.track.midi;
    }
  }, {
    key: "number",
    get: function get() {
      return this.onEvent.number;
    },
    set: function set(value) {
      this.onEvent.number = value;
      this.offEvent.number = value;
    }
  }, {
    key: "onSecond",
    get: function get() {
      return this.onEvent.second;
    }
  }, {
    key: "offSecond",
    get: function get() {
      return this.offEvent.second;
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