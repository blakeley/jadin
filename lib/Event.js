"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
var Event = /** @class */ (function () {
    function Event(raw, track, tick) {
        this.raw = raw;
        this.track = track;
        this.tick = tick;
    }
    Object.defineProperty(Event.prototype, "midi", {
        get: function () {
            return this.track.midi;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "second", {
        get: function () {
            return this.midi.tickToSecond(this.tick);
        },
        enumerable: false,
        configurable: true
    });
    return Event;
}());
exports.Event = Event;
