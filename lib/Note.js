"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Note = /** @class */ (function () {
    function Note(onEvent, offEvent, track) {
        this.onEvent = onEvent;
        this.offEvent = offEvent;
        this.track = track;
    }
    Object.defineProperty(Note.prototype, "onTick", {
        get: function () {
            return this.onEvent.tick;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "offTick", {
        get: function () {
            return this.offEvent.tick;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "midi", {
        get: function () {
            return this.track.midi;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "number", {
        get: function () {
            return this.onEvent.raw.noteNumber;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "onSecond", {
        get: function () {
            return this.onEvent.second;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "offSecond", {
        get: function () {
            return this.offEvent.second;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Note.prototype, "duration", {
        get: function () {
            return this.offSecond - this.onSecond;
        },
        enumerable: false,
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
exports.default = Note;
