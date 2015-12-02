'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Event = require('./Event');

var _Event2 = _interopRequireDefault(_Event);

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
      var event = new _Event2['default']();
      event.deltaTime = this.readVLQ();

      var firstByte = this.readInt(1);
      if (firstByte == 0xff) {
        event.type = 'meta';
        var subtypeByte = this.readInt(1);
        var _length = this.readVLQ();
        switch (subtypeByte) {
          case 0x00:
            event.subtype = 'sequenceNumber';
            if (_length != 2) throw "Length for this sequenceNumber event was " + _length + ", but must be 2";
            event.number = this.readInt(2);
            return event;
          case 0x01:
            event.subtype = 'text';
            event.text = this.read(_length);
            return event;
          case 0x02:
            event.subtype = 'copyright';
            event.text = this.read(_length);
            return event;
          case 0x03:
            event.subtype = 'trackName';
            event.text = this.read(_length);
            return event;
          case 0x04:
            event.subtype = 'instrumentName';
            event.text = this.read(_length);
            return event;
          case 0x05:
            event.subtype = 'lyric';
            event.text = this.read(_length);
            return event;
          case 0x06:
            event.subtype = 'marker';
            event.text = this.read(_length);
            return event;
          case 0x07:
            event.subtype = 'cuePoint';
            event.text = this.read(_length);
            return event;
          case 0x08:
            event.subtype = 'programName';
            event.text = this.read(_length);
            return event;
          case 0x09:
            event.subtype = 'deviceName';
            event.text = this.read(_length);
            return event;
          case 0x20:
            event.subtype = 'channelPrefix';
            event.text = this.readInt(1);
            if (_length != 1) throw "Length for this midiChannelPrefix event was " + _length + ", but must be 1";
            return event;
          case 0x21:
            event.subtype = 'port';
            event.port = this.readInt(1);
            if (_length != 1) throw "Length for this port event was " + _length + ", but must be 1";
            return event;
          case 0x2f:
            event.subtype = 'endOfTrack';
            if (_length != 0) throw "Length for this endOfTrack event was " + _length + ", but must be 0";
            return event;
          case 0x51:
            event.subtype = 'setTempo';
            if (_length != 3) throw "Length for this setTempo event was " + _length + ", but must be 3";
            event.tempo = this.readInt(3);
            return event;
          case 0x54:
            event.subtype = 'smpteOffset';
            if (_length != 5) throw "Length for this smpteOffset event was " + _length + ", but must be 5";
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
            if (_length != 4) throw "Length for this timeSignature event was " + _length + ", but must be 4";
            event.numerator = this.readInt(1);
            event.denominator = Math.pow(2, this.readInt(1));
            event.metronome = this.readInt(1);
            event.thirtySeconds = this.readInt(1);
            return event;
          case 0x59:
            event.subtype = 'keySignature';
            if (_length != 2) throw "Length for this keySignature event was " + _length + ", but must be 2";
            event.key = this.readInt(1);
            if (event.key > 127) event.key = 128 - event.key;
            event.scale = ({ 0: 'major', 1: 'minor' })[this.readInt(1)];
            return event;
          case 0x7f:
            event.subtype = 'sequencerSpecific';
            event.data = this.read(_length);
            return event;
        }
      } else if (firstByte == 0xf0) {
        event.type = 'sysEx';
        var _length2 = this.readVLQ();
        event.data = this.read(_length2);
        return event;
      } else {
        event.type = 'channel';
        var statusByte = undefined,
            dataByte1 = undefined;
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