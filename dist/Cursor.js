"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cursor = (function () {
  function Cursor(events) {
    _classCallCheck(this, Cursor);

    this.events = events;
    this.index = 0;
    this.second = 0;
  }

  _createClass(Cursor, [{
    key: "forward",
    value: function forward(second) {
      var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.second = second;

      while (!!this.nextEvent && this.nextEvent.second <= second) {
        if (!!callbacks[this.nextEvent.subtype]) {
          callbacks[this.nextEvent.subtype](this.nextEvent);
        }

        this.index++;
      }
    }
  }, {
    key: "backward",
    value: function backward(second) {
      var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.second = second;

      while (!!this.previousEvent && this.previousEvent.second > second) {
        if (!!callbacks[this.previousEvent.subtype]) {
          callbacks[this.previousEvent.subtype](this.previousEvent);
        }

        this.index--;
      }
    }
  }, {
    key: "nextEvent",
    get: function get() {
      return this.events[this.index];
    }
  }, {
    key: "previousEvent",
    get: function get() {
      return this.events[this.index - 1];
    }
  }]);

  return Cursor;
})();

exports["default"] = Cursor;
module.exports = exports["default"];