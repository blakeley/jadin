import Track from "../src/Track";
import Midi from "../src/Midi";
import Note from "../src/Note";
import { Event, NoteOnEvent, NoteOffEvent, TextEvent } from "../src/Event";
import { expect } from "chai";
import * as fs from "fs";

var chai = require("chai");
chai.use(require("chai-change"));

var cScaleData = fs.readFileSync("fixtures/c.mid", "binary");
var cScaleMidi = new Midi(cScaleData);

const tick = 0;

describe("Track", function () {
  let rawEvent: TextEvent;
  let rawNoteOnEvent: NoteOnEvent;
  let rawNoteOffEvent: NoteOffEvent;

  this.beforeEach(() => {
    rawEvent = {
      type: "meta",
      subtype: "text",
      deltaTime: 60,
      text: "~",
    };
    rawNoteOnEvent = {
      type: "channel",
      subtype: "noteOn",
      deltaTime: 60,
      noteNumber: 60,
      velocity: 10,
      channel: 1,
    };
    rawNoteOffEvent = {
      type: "channel",
      subtype: "noteOff",
      deltaTime: 60,
      noteNumber: 60,
      velocity: 10,
      channel: 1,
    };
  });

  it("#constructor should construct a Track instance given binary track data", function () {
    expect(new Track("\x00\x91\x3e\x34\x00\x81\x3e\x34")).not.to.be.null;
  });

  it("#constructor should construct a Track instance given no arguments", function () {
    expect(new Track()).not.to.be.null;
  });

  it("#addEvent should add an event to this track's array of events", function () {
    const track = new Track();
    expect(() => {
      track.addEvent(rawEvent, tick);
    }).to.change(
      function () {
        return track.events.length;
      },
      {
        by: 1,
      } as any
    );
  });

  it("#addEvent should associate the event with the track", function () {
    const track = new Track();
    const event = track.addEvent(rawEvent, tick);
    expect(event.track).to.equal(track);
  });

  it("#addEvent should create a new note from a noteOn/noteOff pair", function () {
    const track = new Track();
    expect(function () {
      track.addEvent(rawNoteOnEvent, 1);
      track.addEvent(rawNoteOffEvent, 2);
    }).to.change(
      function () {
        return track.notes.length;
      },
      {
        by: 1,
      } as any
    );
  });

  it("#addEvent should create new events from a noteOn/noteOff pair", function () {
    const track = new Track();
    expect(track.events.length).to.equal(0);
    expect(function () {
      track.addEvent(rawNoteOnEvent, 1);
      track.addEvent(rawNoteOffEvent, 2);
    }).to.change(
      function () {
        return track.events.length;
      },
      {
        by: 2,
      } as any
    );
  });

  it("#addEvent should ignore unpaired noteOn events", function () {
    const track = new Track();
    expect(function () {
      track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 1);
      track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 2);
    }).to.change(
      function () {
        return track.events.length;
      },
      {
        by: 1,
      } as any
    );
  });

  it("addEvent should not create a new note from a removed noteOn event", function () {
    const track = new Track();
    track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 1);
    track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 2);
    track.addEvent({ ...rawNoteOffEvent, noteNumber: 60 }, 3);
    expect(track.events[0]).to.equal(track.notes[0]["onEvent"]);
  });

  it("#addEvent should ignore unpaired noteOff events", function () {
    const track = new Track();
    expect(function () {
      track.addEvent(rawNoteOffEvent, 0);
    }).to.change(
      function () {
        return track.events.length;
      },
      {
        by: 0,
      } as any
    );
  });

  it("#addEvent should ignore noteOff events following simultaneous noteOn events", function () {
    const track = new Track();
    expect(function () {
      track.addEvent({ ...rawNoteOnEvent, noteNumber: 60 }, 480);
      track.addEvent({ ...rawNoteOffEvent, noteNumber: 60 }, 480);
    }).to.change(
      function () {
        return track.events.length;
      },
      {
        by: 1,
      } as any
    );
  });

  it("#removeEvent should remove the given event from the events array", function () {
    const track = new Track();
    track.addEvent({ ...rawEvent }, 1);
    const removed = track.addEvent(rawEvent, 2);
    track.addEvent({ ...rawEvent }, 3);
    expect(function () {
      track.removeEvent(removed);
    }).to.change(
      function () {
        return track.events.length;
      },
      {
        by: -1,
      } as any
    );
  });

  it("#constructor should remove unpaired noteOn events", function () {
    const track = new Track("\x00\x91\x3e\x34");
    expect(track.events.length).to.equal(0);
  });

  it("#events should return an array of all events", function () {
    expect(cScaleMidi.tracks[0].events).to.not.be.undefined;
    expect(cScaleMidi.tracks[0].events.length).to.equal(6);
    expect(cScaleMidi.tracks[1].events.length).to.equal(11);
  });

  it("#notes should return an array of all notes", function () {
    expect(cScaleMidi.tracks[1].notes).to.not.be.undefined;
    expect(cScaleMidi.tracks[1].notes.length).to.equal(4);
    expect(cScaleMidi.tracks[1].notes[0].constructor).to.equal(Note);
  });

  it("#midi should return the associated Midi object", function () {
    expect(cScaleMidi.tracks[1].midi).to.equal(cScaleMidi);
  });

  it("#index should return the index of this track", function () {
    expect(cScaleMidi.tracks[0].index).to.equal(0);
    expect(cScaleMidi.tracks[1].index).to.equal(1);
    expect(cScaleMidi.tracks[2].index).to.equal(2);
  });

  it("#notesOnAt should return the notes on this track which are on at the given time", function () {
    expect(cScaleMidi.tracks[2].notesOnAt(-1).length).to.equal(0);
    expect(cScaleMidi.tracks[2].notesOnAt(0.5).length).to.equal(2);
    expect(cScaleMidi.tracks[2].notesOnAt(0.5)[0]).to.equal(
      cScaleMidi.tracks[2].notes[0]
    );
    expect(cScaleMidi.tracks[2].notesOnAt(1.9375).length).to.equal(1);
    expect(cScaleMidi.tracks[1].notesOnAt(1.9375).length).to.equal(1);
  });

  it("#index should return the index of this track", function () {
    expect(cScaleMidi.tracks[0].index).to.equal(0);
    expect(cScaleMidi.tracks[1].index).to.equal(1);
    expect(cScaleMidi.tracks[2].index).to.equal(2);
  });

  it("#notesOnDuring should return the notes on this track which are on during the given time range", function () {
    expect(cScaleMidi.tracks[2].notesOnDuring(-2, -1).length).to.equal(0);
    expect(cScaleMidi.tracks[2].notesOnDuring(0, 0.75).length).to.equal(2);
    expect(cScaleMidi.tracks[2].notesOnDuring(0, 0.75)[0]).to.equal(
      cScaleMidi.tracks[2].notes[0]
    );
    expect(cScaleMidi.tracks[2].notesOnDuring(0, 2).length).to.equal(4);
  });
});
