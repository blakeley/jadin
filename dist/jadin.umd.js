(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.jadin = {})));
}(this, (function (exports) { 'use strict';

  var Event = /** @class */ (function () {
      function Event() {
      }
      Object.defineProperty(Event.prototype, "midi", {
          get: function () {
              return this.track.midi;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Event.prototype, "second", {
          get: function () {
              return this.midi.tickToSecond(this.tick);
          },
          enumerable: true,
          configurable: true
      });
      return Event;
  }());

  var MidiReader = /** @class */ (function () {
      function MidiReader(data) {
          this.data = data;
          this.position = 0;
      }
      MidiReader.prototype.read = function (length) {
          var result = this.data.substr(this.position, length);
          this.position += length;
          return result;
      };
      MidiReader.prototype.readInt = function (numberOfBytes) {
          var result = 0;
          while (numberOfBytes > 0) {
              result <<= 8;
              result += this.data.charCodeAt(this.position);
              this.position += 1;
              numberOfBytes -= 1;
          }
          return result;
      };
      MidiReader.prototype.readVLQ = function () {
          var result = 0;
          var octet;
          do {
              result <<= 7;
              octet = this.readInt(1);
              result += (octet & 0x7f);
          } while (octet & 0x80);
          return result;
      };
      MidiReader.prototype.readEvent = function () {
          var event = new Event();
          event.deltaTime = this.readVLQ();
          var firstByte = this.readInt(1);
          if (firstByte == 0xff) {
              event.type = 'meta';
              var subtypeByte = this.readInt(1);
              var length_1 = this.readVLQ();
              switch (subtypeByte) {
                  case 0x00:
                      event.subtype = 'sequenceNumber';
                      if (length_1 != 2)
                          throw "Length for this sequenceNumber event was " + length_1 + ", but must be 2";
                      event.number = this.readInt(2);
                      return event;
                  case 0x01:
                      event.subtype = 'text';
                      event.text = this.read(length_1);
                      return event;
                  case 0x02:
                      event.subtype = 'copyright';
                      event.text = this.read(length_1);
                      return event;
                  case 0x03:
                      event.subtype = 'trackName';
                      event.text = this.read(length_1);
                      return event;
                  case 0x04:
                      event.subtype = 'instrumentName';
                      event.text = this.read(length_1);
                      return event;
                  case 0x05:
                      event.subtype = 'lyric';
                      event.text = this.read(length_1);
                      return event;
                  case 0x06:
                      event.subtype = 'marker';
                      event.text = this.read(length_1);
                      return event;
                  case 0x07:
                      event.subtype = 'cuePoint';
                      event.text = this.read(length_1);
                      return event;
                  case 0x08:
                      event.subtype = 'programName';
                      event.text = this.read(length_1);
                      return event;
                  case 0x09:
                      event.subtype = 'deviceName';
                      event.text = this.read(length_1);
                      return event;
                  case 0x20:
                      event.subtype = 'channelPrefix';
                      event.text = this.readInt(1);
                      if (length_1 != 1)
                          throw "Length for this midiChannelPrefix event was " + length_1 + ", but must be 1";
                      return event;
                  case 0x21:
                      event.subtype = 'port';
                      event.port = this.readInt(1);
                      if (length_1 != 1)
                          throw "Length for this port event was " + length_1 + ", but must be 1";
                      return event;
                  case 0x2f:
                      event.subtype = 'endOfTrack';
                      if (length_1 != 0)
                          throw "Length for this endOfTrack event was " + length_1 + ", but must be 0";
                      return event;
                  case 0x51:
                      event.subtype = 'setTempo';
                      if (length_1 != 3)
                          throw "Length for this setTempo event was " + length_1 + ", but must be 3";
                      event.tempo = this.readInt(3);
                      return event;
                  case 0x54:
                      event.subtype = 'smpteOffset';
                      if (length_1 != 5)
                          throw "Length for this smpteOffset event was " + length_1 + ", but must be 5";
                      var hourByte = this.readInt(1);
                      event.frameRate = { 0: 24, 1: 25, 2: 29.97, 3: 30 }[hourByte >> 6];
                      event.hours = hourByte & 0x1f;
                      event.minutes = this.readInt(1);
                      event.seconds = this.readInt(1);
                      event.frames = this.readInt(1);
                      event.subframes = this.readInt(1);
                      return event;
                  case 0x58:
                      event.subtype = 'timeSignature';
                      if (length_1 != 4)
                          throw "Length for this timeSignature event was " + length_1 + ", but must be 4";
                      event.numerator = this.readInt(1);
                      event.denominator = Math.pow(2, this.readInt(1));
                      event.metronome = this.readInt(1);
                      event.thirtySeconds = this.readInt(1);
                      return event;
                  case 0x59:
                      event.subtype = 'keySignature';
                      if (length_1 != 2)
                          throw "Length for this keySignature event was " + length_1 + ", but must be 2";
                      event.key = this.readInt(1);
                      if (event.key > 127)
                          event.key = 128 - event.key;
                      event.scale = { 0: 'major', 1: 'minor' }[this.readInt(1)];
                      return event;
                  case 0x7f:
                      event.subtype = 'sequencerSpecific';
                      event.data = this.read(length_1);
                      return event;
              }
          }
          else if (firstByte == 0xf0) {
              event.type = 'sysEx';
              var length_2 = this.readVLQ();
              event.data = this.read(length_2);
              return event;
          }
          else {
              event.type = 'channel';
              var statusByte = void 0, dataByte1 = void 0;
              if (firstByte < 0x80) { // running status; first byte is the first data byte
                  dataByte1 = firstByte;
                  statusByte = this.lastStatusByte;
              }
              else { // new status; first byte is the status byte
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
                      event.subtype = (event.velocity == 0 ? 'noteOff' : 'noteOn');
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
      };
      MidiReader.prototype.readChunk = function () {
          var type = this.read(4);
          var length = this.readInt(4);
          var data = this.read(length);
          return {
              type: type,
              length: length,
              data: data,
          };
      };
      MidiReader.prototype.isAtEndOfFile = function () {
          return this.position >= this.data.length;
      };
      return MidiReader;
  }());

  var Note = /** @class */ (function () {
      function Note(onEvent, offEvent) {
          if (onEvent === void 0) { onEvent = new Event(); }
          if (offEvent === void 0) { offEvent = new Event(); }
          this.onEvent = onEvent;
          this.offEvent = offEvent;
          onEvent.note = this;
          offEvent.note = this;
      }
      Object.defineProperty(Note.prototype, "onTick", {
          get: function () {
              return this.onEvent.tick;
          },
          set: function (value) {
              if (value >= this.offTick)
                  throw "Cannot set onTick to be greater than or equal to offTick";
              this.onEvent.tick = value;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Note.prototype, "offTick", {
          get: function () {
              return this.offEvent.tick;
          },
          set: function (value) {
              if (value <= this.onTick)
                  throw "Cannot set offTick to be less than or equal to onTick";
              this.offEvent.tick = value;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Note.prototype, "midi", {
          get: function () {
              return this.track.midi;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Note.prototype, "number", {
          get: function () {
              return this.onEvent.number;
          },
          set: function (value) {
              this.onEvent.number = value;
              this.offEvent.number = value;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Note.prototype, "onSecond", {
          get: function () {
              return this.onEvent.second;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Note.prototype, "offSecond", {
          get: function () {
              return this.offEvent.second;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Note.prototype, "duration", {
          get: function () {
              return this.offSecond - this.onSecond;
          },
          enumerable: true,
          configurable: true
      });
      Note.prototype.onAt = function (second) {
          return this.onSecond <= second && second <= this.offSecond;
      };
      Note.prototype.onDuring = function (onSecond, offSecond) {
          return this.onSecond <= offSecond && this.offSecond >= onSecond;
      };
      return Note;
  }());

  var Track = /** @class */ (function () {
      function Track(data) {
          if (data === void 0) { data = ''; }
          this.events = [];
          this.notes = [];
          this._noteOnEvents = {};
          var reader = new MidiReader(data);
          var currentTick = 0;
          while (!reader.isAtEndOfFile()) {
              var event_1 = reader.readEvent();
              currentTick += event_1.deltaTime;
              event_1.tick = currentTick;
              this.addEvent(event_1);
          }
          // remove unpaired noteOn events
          for (var number in this._noteOnEvents) {
              this.removeEvent(this._noteOnEvents[number]);
          }
      }
      Track.prototype.addEvent = function (event) {
          event.track = this;
          this.events.push(event);
          switch (event.subtype) {
              case 'noteOn':
                  var invalidEvent = this._noteOnEvents[event.number];
                  if (!!invalidEvent) { // previous noteOn event was invalid
                      this.removeEvent(invalidEvent);
                  }
                  this._noteOnEvents[event.number] = event;
                  break;
              case 'noteOff':
                  var noteOnEvent = this._noteOnEvents[event.number];
                  if (!noteOnEvent || noteOnEvent.tick >= event.tick) {
                      // this noteOff event is invalid - needs corresponding preceding noteOn event
                      this.removeEvent(event);
                  }
                  else {
                      var note = new Note(noteOnEvent, event);
                      note.track = this;
                      this.notes.push(note);
                      delete this._noteOnEvents[event.number];
                  }
                  break;
          }
      };
      Track.prototype.removeEvent = function (event) {
          var index = this.events.lastIndexOf(event); // index will typically be near the end of the array
          this.events.splice(index, 1);
      };
      Object.defineProperty(Track.prototype, "index", {
          get: function () {
              return this.midi.tracks.indexOf(this);
          },
          enumerable: true,
          configurable: true
      });
      Track.prototype.notesOnAt = function (second) {
          return this.notes.filter(function (note) {
              return note.onAt(second);
          });
      };
      Track.prototype.notesOnDuring = function (onSecond, offSecond) {
          return this.notes.filter(function (note) {
              return note.onDuring(onSecond, offSecond);
          });
      };
      return Track;
  }());

  var Cursor = /** @class */ (function () {
      function Cursor(events) {
          this.events = events;
          this.index = 0;
          this.second = 0;
      }
      Object.defineProperty(Cursor.prototype, "nextEvent", {
          get: function () {
              return this.events[this.index];
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Cursor.prototype, "previousEvent", {
          get: function () {
              return this.events[this.index - 1];
          },
          enumerable: true,
          configurable: true
      });
      Cursor.prototype.forward = function (second, callbacks) {
          if (callbacks === void 0) { callbacks = {}; }
          this.second = second;
          while (!!this.nextEvent && this.nextEvent.second <= second) {
              if (!!callbacks[this.nextEvent.subtype]) {
                  callbacks[this.nextEvent.subtype](this.nextEvent);
              }
              this.index++;
          }
      };
      Cursor.prototype.backward = function (second, callbacks) {
          if (callbacks === void 0) { callbacks = {}; }
          this.second = second;
          while (!!this.previousEvent && this.previousEvent.second > second) {
              if (!!callbacks[this.previousEvent.subtype]) {
                  callbacks[this.previousEvent.subtype](this.previousEvent);
              }
              this.index--;
          }
      };
      return Cursor;
  }());

  var Midi = /** @class */ (function () {
      function Midi(data) {
          this.format = 0;
          this.ppqn = 480;
          this.tracks = [];
          this._tickToSecond = {};
          this._tempoEvents = [];
          if (!!data) {
              var reader = new MidiReader(data);
              var headerChunk = reader.readChunk();
              var headerReader = new MidiReader(headerChunk.data);
              this.format = headerReader.readInt(2);
              if (this.format == 2)
                  throw "MIDI format 2 not supported";
              var numberOfTracks = headerReader.readInt(2);
              this.ppqn = headerReader.readInt(2); // assumes metrical timing
              for (var i = 0; i < numberOfTracks; i++) {
                  var trackChunk = reader.readChunk();
                  this.createTrack(trackChunk.data);
              }
          }
          else {
              var tempoTrack = this.createTrack();
          }
      }
      Midi.prototype.createTrack = function (data) {
          var track = new Track(data);
          track.midi = this;
          this.tracks.push(track);
          return track;
      };
      Midi.prototype.newCursor = function () {
          return new Cursor(this.events.sort(function (e1, e2) { return e1.tick - e2.tick; }));
      };
      Object.defineProperty(Midi.prototype, "notes", {
          get: function () {
              return this.tracks
                  .map(function (track) { return track.notes; })
                  .reduce(function (a, b) { return a.concat(b); });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Midi.prototype, "events", {
          get: function () {
              return this.tracks
                  .map(function (track) { return track.events; })
                  .reduce(function (a, b) { return a.concat(b); });
              //.sort(function(e1,e2){return e1.tick < e2.tick});
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Midi.prototype, "tempoEvents", {
          get: function () {
              if (this._tempoEvents.length > 0)
                  return this._tempoEvents; // return if memoized
              // format 0: All events are on the zeroth track, including tempo events
              // format 1: All tempo events are on the zeroth track
              // format 2: Every track has tempo events (not supported)
              return this._tempoEvents = this.tracks[0].events.filter(function (event) {
                  return event.subtype == 'setTempo';
              });
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Midi.prototype, "duration", {
          get: function () {
              return this.notes
                  .map(function (note) { return note.offSecond; })
                  .reduce(function (a, b) { return Math.max(a, b); }, 0);
          },
          enumerable: true,
          configurable: true
      });
      Midi.prototype.tickToSecond = function (tick) {
          if (this._tickToSecond[tick])
              return this._tickToSecond[tick];
          var currentTick = 0;
          var currentTempo = 500000;
          var totalTime = 0;
          for (var i = 0; i < this.tempoEvents.length; i++) {
              var event = this.tempoEvents[i];
              if (event.tick >= tick)
                  break;
              totalTime += ((event.tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
              currentTick = event.tick;
              currentTempo = event.tempo;
          }
          totalTime += ((tick - currentTick) / this.ppqn) * currentTempo / 1000000.0;
          return this._tickToSecond[tick] = totalTime;
      };
      Midi.prototype.notesOnAt = function (second) {
          return this.tracks.map(function (track) { return track.notesOnAt(second); }).flat();
      };
      Midi.prototype.notesOnDuring = function (onSecond, offSecond) {
          return this.tracks.map(function (track) { return track.notesOnDuring(onSecond, offSecond); }).flat();
      };
      return Midi;
  }());

  exports.Event = Event;
  exports.Midi = Midi;
  exports.MidiReader = MidiReader;
  exports.Note = Note;
  exports.Track = Track;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=jadin.umd.js.map
