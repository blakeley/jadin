"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MidiReader_1 = require("./MidiReader");
var Track_1 = require("./Track");
var Cursor_1 = require("./Cursor");
var Event_1 = require("./Event");
Array.prototype.last = function () {
    return this[this.length - 1];
};
var Midi = /** @class */ (function () {
    function Midi(data) {
        this.format = 0;
        this.ppqn = 480;
        this.tracks = [];
        this._tickToSecond = {};
        this._tempoEvents = [];
        if (!!data) {
            var reader = new MidiReader_1.default(data);
            var headerChunk = reader.readChunk();
            var headerReader = new MidiReader_1.default(headerChunk.data);
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
        var track = new Track_1.default(data);
        track.midi = this;
        this.tracks.push(track);
        return track;
    };
    Midi.prototype.newCursor = function () {
        return new Cursor_1.default(this.events.sort(function (e1, e2) { return e1.tick - e2.tick; }));
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
            //.sort((e1,e2) => e1.tick < e2.tick);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Midi.prototype, "tempoEvents", {
        get: function () {
            if (this._tempoEvents.length > 0)
                return this._tempoEvents; // return if memoized
            function isSetTempoEvent(event) {
                return event.raw.type === "meta" && event.raw.subtype === "setTempo";
            }
            // format 0: All events are on the zeroth track, including tempo events
            // format 1: All tempo events are on the zeroth track
            // format 2: Every track has tempo events (not supported)
            return this.tracks[0].events.filter(isSetTempoEvent);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Midi.prototype, "duration", {
        get: function () {
            return Math.max.apply(Math, this.tracks.map(function (track) { var _a; return ((_a = track.notes.last()) === null || _a === void 0 ? void 0 : _a.offSecond) || 0; }));
        },
        enumerable: true,
        configurable: true
    });
    Midi.prototype.tickToSecond = function (tick) {
        if (tick === 0)
            return 0;
        if (this._tickToSecond[tick])
            return this._tickToSecond[tick];
        var mostRecentSetTempoEvent = new Event_1.Event({
            type: "meta",
            subtype: "setTempo",
            deltaTime: 0,
            microsecondsPerBeat: 500000,
        }, this.tracks[0], 0);
        for (var _i = 0, _a = this.tempoEvents; _i < _a.length; _i++) {
            var setTempoEvent = _a[_i];
            if (setTempoEvent.tick < tick) {
                mostRecentSetTempoEvent = setTempoEvent;
            }
            else {
                break;
            }
        }
        var totalSeconds = mostRecentSetTempoEvent.second +
            (((tick - mostRecentSetTempoEvent.tick) / this.ppqn) *
                mostRecentSetTempoEvent.raw.microsecondsPerBeat) /
                1000000;
        this._tickToSecond[tick] = totalSeconds;
        return totalSeconds;
    };
    Midi.prototype.notesOnAt = function (second) {
        return [].concat.apply([], this.tracks.map(function (track) { return track.notesOnAt(second); }));
    };
    Midi.prototype.notesOnDuring = function (onSecond, offSecond) {
        return [].concat.apply([], this.tracks.map(function (track) {
            return track.notesOnDuring(onSecond, offSecond);
        }));
    };
    return Midi;
}());
exports.default = Midi;
