"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MidiReader_1 = require("./MidiReader");
var Note_1 = require("./Note");
var Track = /** @class */ (function () {
    function Track(data) {
        if (data === void 0) { data = ''; }
        this.events = [];
        this.notes = [];
        this._noteOnEvents = {};
        var reader = new MidiReader_1.default(data);
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
                    var note = new Note_1.default(noteOnEvent, event);
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
exports.default = Track;
