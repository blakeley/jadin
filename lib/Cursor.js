"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cursor = /** @class */ (function () {
    function Cursor(events) {
        console.log('event');
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
exports.default = Cursor;
