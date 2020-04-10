"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MidiReader_1 = require("./MidiReader");
var Note_1 = require("./Note");
var Event_1 = require("./Event");
var Track = /** @class */ (function () {
    function Track(data) {
        if (data === void 0) { data = ""; }
        this.events = [];
        this.notes = [];
        this._noteOnEvents = {};
        var reader = new MidiReader_1.default(data);
        var currentTick = 0;
        while (!reader.isAtEndOfFile()) {
            var rawEvent = reader.readEvent();
            currentTick += rawEvent.deltaTime;
            this.addEvent(rawEvent, currentTick);
        }
        // remove unpaired noteOn events
        for (var number in this._noteOnEvents) {
            this.removeEvent(this._noteOnEvents[number]);
        }
    }
    Track.prototype.addEvent = function (rawEvent, tick) {
        var event = new Event_1.Event(rawEvent, this, tick);
        this.events.push(event);
        if (rawEvent.type === "channel") {
            switch (rawEvent.subtype) {
                case "noteOn":
                    var invalidEvent = this._noteOnEvents[rawEvent.noteNumber];
                    if (!!invalidEvent) {
                        // previous noteOn event was invalid
                        this.removeEvent(invalidEvent);
                    }
                    this._noteOnEvents[rawEvent.noteNumber] = event;
                    break;
                case "noteOff":
                    var noteOnEvent = this._noteOnEvents[rawEvent.noteNumber];
                    if (!noteOnEvent || noteOnEvent.tick >= event.tick) {
                        // this noteOff event is invalid - needs corresponding preceding noteOn event
                        this.removeEvent(event);
                    }
                    else {
                        var note = new Note_1.default(noteOnEvent, event, this);
                        this.notes.push(note);
                        delete this._noteOnEvents[rawEvent.noteNumber];
                    }
                    break;
            }
        }
        return event;
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
exports.default = Track;
