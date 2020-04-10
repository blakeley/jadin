import Midi from "../src/Midi";
import { TextEvent, Event } from "../src/Event";
import { expect } from "chai";

let midi = new Midi();
let track = midi.createTrack();
let textEvent: TextEvent = {
  deltaTime: 50,
  type: "meta",
  text: "~",
  subtype: "text",
};
let event = new Event<TextEvent>(textEvent, track, 480);
(track as any).addEvent(event);

describe("Event", function () {
  it("#new should construct an Event instance", function () {
    expect(event).not.to.be.null;
  });

  it("#midi should return the associated Midi object", function () {
    expect(event.midi).to.equal(midi);
  });

  it("#second should return the second of this Event", function () {
    expect(midi.tickToSecond(event.tick)).to.equal(0.5);
  });
});
