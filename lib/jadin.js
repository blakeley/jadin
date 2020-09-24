"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = exports.Note = exports.MidiReader = exports.Midi = exports.Cursor = void 0;
var Cursor_1 = require("./Cursor");
exports.Cursor = Cursor_1.default;
__exportStar(require("./Event"), exports);
var Midi_1 = require("./Midi");
exports.Midi = Midi_1.default;
var MidiReader_1 = require("./MidiReader");
exports.MidiReader = MidiReader_1.default;
var Note_1 = require("./Note");
exports.Note = Note_1.default;
var Track_1 = require("./Track");
exports.Track = Track_1.default;
