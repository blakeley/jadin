"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = (function () {
  function Event() {
    _classCallCheck(this, Event);
  }

  _createClass(Event, [{
    key: "midi",
    get: function get() {
      return this.track.midi;
    }
  }, {
    key: "second",
    get: function get() {
      return this.midi.tickToSecond(this.tick);
    }
  }]);

  return Event;
})();

exports["default"] = Event;
module.exports = exports["default"];