"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Event_1 = __importDefault(require("./Event"));
var Note = /** @class */ (function () {
    function Note(onEvent, offEvent) {
        if (onEvent === void 0) { onEvent = new Event_1.default(); }
        if (offEvent === void 0) { offEvent = new Event_1.default(); }
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
exports.default = Note;
//# sourceMappingURL=Note.js.map