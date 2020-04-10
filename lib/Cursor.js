"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cursor = /** @class */ (function () {
    function Cursor(events) {
        this.events = events;
        this.index = 0;
        this.second = 0;
        this.notesOn = new Set();
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
    Cursor.prototype.forward = function (second) {
        this.second = second;
        var events = [];
        while (!!this.nextEvent && this.nextEvent.second <= second) {
            var event_1 = this.nextEvent;
            events.push(event_1);
            if (event_1.raw.type === "channel") {
                if (event_1.raw.subtype === "noteOn") {
                    this.notesOn.add(event_1.raw.noteNumber);
                }
                else if (event_1.raw.subtype === "noteOff") {
                    this.notesOn.delete(event_1.raw.noteNumber);
                }
            }
            this.index++;
        }
        return events;
    };
    Cursor.prototype.backward = function (second) {
        this.second = second;
        var events = [];
        while (!!this.previousEvent && this.previousEvent.second > second) {
            var event_2 = this.previousEvent;
            events.push(this.previousEvent);
            if (event_2.raw.type === "channel") {
                if (event_2.raw.subtype === "noteOn") {
                    this.notesOn.delete(event_2.raw.noteNumber);
                }
                else if (event_2.raw.subtype === "noteOff") {
                    this.notesOn.add(event_2.raw.noteNumber);
                }
            }
            this.index--;
        }
        return events;
    };
    return Cursor;
}());
exports.default = Cursor;
