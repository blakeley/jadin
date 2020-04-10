import { expect } from "chai";
import { NoteOnEvent, NoteOffEvent, Event } from "../src/Event";
import Cursor from "../src/Cursor";
import Track from "../src/Track";
import Midi from "../src/Midi";

const MIDI = new Midi();
const TRACK = new Track();
TRACK.midi = MIDI;

function createNoteOnEvent(
  noteNumber: number,
  second: number
): Event<NoteOnEvent> {
  const rawNoteOnEvent: NoteOnEvent = {
    deltaTime: 0,
    channel: 1,
    type: "channel",
    subtype: "noteOn",
    noteNumber,
    velocity: 20,
  };

  return new Event(rawNoteOnEvent, TRACK, second * 960);
}

function createNoteOffEvent(
  noteNumber: number,
  second: number
): Event<NoteOffEvent> {
  const rawNoteOffEvent: NoteOffEvent = {
    deltaTime: 0,
    channel: 1,
    type: "channel",
    subtype: "noteOff",
    noteNumber,
    velocity: 20,
  };

  return new Event(rawNoteOffEvent, TRACK, second * 960);
}

describe("Cursor", () => {
  it("initially has no notesOn", () => {
    expect(new Cursor([]).notesOn).to.be.empty;
  });

  describe("forward", () => {
    it("returns all events encountered", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(49, 2),
        createNoteOnEvent(50, 3),
        createNoteOnEvent(51, 4),
      ];
      const cursor = new Cursor(events);

      expect(cursor.forward(2.5)).to.eql([events[0], events[1]]);
    });

    it("advances nextEvent to the first event which occurs strictly after the given time", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(49, 2),
        createNoteOnEvent(50, 3),
        createNoteOnEvent(51, 4),
      ];
      const cursor = new Cursor(events);
      cursor.forward(2);

      expect(cursor.nextEvent).to.eql(events[2]);
      expect(cursor.previousEvent).to.eql(events[1]);
    });

    it("advances beyond the end of the event array", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(49, 2),
        createNoteOnEvent(50, 3),
        createNoteOnEvent(51, 4),
      ];
      const cursor = new Cursor(events);
      cursor.forward(9999);

      expect(cursor.nextEvent).to.be.undefined;
    });

    it("sets second", () => {
      const cursor = new Cursor([]);

      cursor.forward(7);

      expect(cursor.second).to.equal(7);
    });

    it("adds notes that were turned on", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(60, 2),
        createNoteOnEvent(61, 2),
        createNoteOnEvent(62, 3),
        createNoteOnEvent(63, 5),
      ];
      const cursor = new Cursor(events);
      cursor.forward(2);

      expect(Array.from(cursor.notesOn)).to.eql([48, 60, 61]);
    });

    it("removes notes that were turned off", () => {
      const events = [
        createNoteOnEvent(60, 1),
        createNoteOnEvent(61, 2),
        createNoteOffEvent(60, 3),
      ];
      const cursor = new Cursor(events);
      cursor.forward(4);

      expect(Array.from(cursor.notesOn)).to.eql([61]);
    });
  });

  describe("backward", () => {
    it("returns all events encountered", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(49, 2),
        createNoteOnEvent(50, 3),
        createNoteOnEvent(51, 4),
      ];
      const cursor = new Cursor(events);

      cursor.forward(6);

      expect(cursor.backward(2.5)).to.eql([events[3], events[2]]);
    });

    it("advances the cursor to the first event which occurs strictly after the given time", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(49, 2),
        createNoteOnEvent(50, 3),
        createNoteOnEvent(51, 4),
      ];
      const cursor = new Cursor(events);

      cursor.forward(6);
      cursor.backward(2);

      expect(cursor.nextEvent).to.eql(events[2]);
      expect(cursor.previousEvent).to.eql(events[1]);
    });

    it("advances beyond the beginning of the event array", () => {
      const events = [
        createNoteOnEvent(48, 1),
        createNoteOnEvent(49, 2),
        createNoteOnEvent(50, 3),
        createNoteOnEvent(51, 4),
      ];
      const cursor = new Cursor(events);
      cursor.backward(-10);

      expect(cursor.previousEvent).to.be.undefined;
    });

    it("sets second", () => {
      const cursor = new Cursor([]);

      cursor.backward(7);

      expect(cursor.second).to.equal(7);
    });

    it("adds notes that were turned off", () => {
      const events = [
        createNoteOffEvent(48, 1),
        createNoteOffEvent(60, 2),
        createNoteOffEvent(61, 2),
        createNoteOffEvent(62, 3),
        createNoteOffEvent(63, 4),
      ];
      const cursor = new Cursor(events);
      cursor.forward(5);
      cursor.backward(1.5);

      expect(Array.from(cursor.notesOn)).to.eql([63, 62, 61, 60]);
    });

    it("removes notes that were turned on", () => {
      const events = [createNoteOnEvent(60, 1)];
      const cursor = new Cursor(events);
      cursor.forward(2);
      cursor.backward(1);

      expect(cursor.notesOn).to.be.empty;
    });
  });
});
