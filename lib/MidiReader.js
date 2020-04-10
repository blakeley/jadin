"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            result += octet & 0x7f;
        } while (octet & 0x80);
        return result;
    };
    MidiReader.prototype.readEvent = function () {
        var deltaTime = this.readVLQ();
        var firstByte = this.readInt(1);
        if (firstByte == 0xff) {
            var type = "meta";
            var subtypeByte = this.readInt(1);
            var length_1 = this.readVLQ();
            switch (subtypeByte) {
                case 0x00:
                    if (length_1 != 2) {
                        throw ("Length for this sequenceNumber event was " +
                            length_1 +
                            ", but must be 2");
                    }
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "sequenceNumber",
                        number: this.readInt(2),
                    };
                case 0x01:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "text",
                        text: this.read(length_1),
                    };
                case 0x02:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "copyrightNotice",
                        text: this.read(length_1),
                    };
                case 0x03:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "trackName",
                        text: this.read(length_1),
                    };
                case 0x04:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "instrumentName",
                        text: this.read(length_1),
                    };
                case 0x05:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "lyrics",
                        text: this.read(length_1),
                    };
                case 0x06:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "marker",
                        text: this.read(length_1),
                    };
                case 0x07:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "cuePoint",
                        text: this.read(length_1),
                    };
                case 0x08:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "programName",
                        text: this.read(length_1),
                    };
                case 0x09:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "deviceName",
                        text: this.read(length_1),
                    };
                case 0x20:
                    if (length_1 !== 1)
                        throw new Error("Expected length for channelPrefix event is 1, got " + length_1);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "channelPrefix",
                        channel: this.readInt(1),
                    };
                case 0x21:
                    if (length_1 !== 1)
                        throw new Error("Length for this channelPrefex event was " +
                            length_1 +
                            ", but must be 1");
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "portPrefix",
                        port: this.readInt(1),
                    };
                case 0x2f:
                    if (length_1 !== 0)
                        throw new Error("Length for this endOfTrack event was " +
                            length_1 +
                            ", but must be 0");
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "endOfTrack",
                    };
                case 0x51:
                    if (length_1 !== 3)
                        throw new Error("Length for this setTempo event was " + length_1 + ", but must be 3");
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "setTempo",
                        microsecondsPerBeat: this.readInt(3),
                    };
                case 0x54:
                    if (length_1 !== 5)
                        throw new Error("Length for this smpteOffset event was " + length_1 + ", but must be 5");
                    var table = {
                        0: 24,
                        1: 25,
                        2: 29.97,
                        3: 30,
                    };
                    var hourByte = this.readInt(1);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "smpteOffset",
                        frameRate: table[hourByte >> 6],
                        hours: hourByte & 0x1f,
                        minutes: this.readInt(1),
                        seconds: this.readInt(1),
                        frames: this.readInt(1),
                        subframes: this.readInt(1),
                    };
                case 0x58:
                    if (length_1 !== 4)
                        throw new Error("Expected length for timeSignature event is 4, got " + length_1);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "timeSignature",
                        numerator: this.readInt(1),
                        denominator: Math.pow(2, this.readInt(1)),
                        metronome: this.readInt(1),
                        thirtySeconds: this.readInt(1),
                    };
                case 0x59:
                    if (length_1 !== 2)
                        throw new Error("Expected length for keySignature event is 2, got " + length_1);
                    var key = this.readInt(1);
                    if (key > 127)
                        key = 128 - key;
                    var scale = { 0: "major", 1: "minor" }[this.readInt(1)];
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "keySignature",
                        key: key,
                        scale: scale,
                    };
                case 0x7f:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "sequencerSpecific",
                        data: this.read(length_1),
                    };
                default:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        subtype: "unknown",
                        data: this.read(length_1),
                    };
            }
        }
        else if (firstByte == 0xf0) {
            var length_2 = this.readVLQ();
            return {
                deltaTime: deltaTime,
                type: "sysEx",
                data: this.read(length_2),
            };
        }
        else {
            var statusByte = void 0, dataByte1 = void 0;
            if (firstByte < 0x80) {
                // running status; first byte is the first data byte
                dataByte1 = firstByte;
                statusByte = this.lastStatusByte;
            }
            else {
                // new status; first byte is the status byte
                dataByte1 = this.readInt(1);
                statusByte = firstByte;
                this.lastStatusByte = statusByte;
            }
            var channel = statusByte & 0x0f;
            var eventSubtype = statusByte >> 4;
            var type = "channel";
            switch (eventSubtype) {
                case 0x8:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "noteOff",
                        noteNumber: dataByte1,
                        velocity: this.readInt(1),
                    };
                case 0x9:
                    var velocity = this.readInt(1);
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: velocity === 0 ? "noteOff" : "noteOn",
                        noteNumber: dataByte1,
                        velocity: velocity,
                    };
                case 0xa:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "noteAftertouch",
                        noteNumber: dataByte1,
                        amount: this.readInt(1),
                    };
                case 0xb:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "controller",
                        controllerType: dataByte1,
                        value: this.readInt(1),
                    };
                case 0xc:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "programChange",
                        value: dataByte1,
                    };
                case 0xd:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "channelAftertouch",
                        amount: dataByte1,
                    };
                case 0x0e:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "pitchBend",
                        value: dataByte1 + (this.readInt(1) << 7),
                    };
                default:
                    return {
                        deltaTime: deltaTime,
                        type: type,
                        channel: channel,
                        subtype: "unknown",
                        data: this.readInt(1),
                    };
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
exports.default = MidiReader;
