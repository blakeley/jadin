"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = Event;
//# sourceMappingURL=Event.js.map