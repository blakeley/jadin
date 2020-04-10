import Midi from "../src/Midi";
import Note from "../src/Note";
import { expect } from "chai";
import * as fs from "fs";

var cScaleData = fs.readFileSync("fixtures/c.mid", "binary");
var cScaleMidi = new Midi(cScaleData);

describe("Note", function () {
  it("#number should return this note's MIDI number", function () {
    expect(cScaleMidi.tracks[1].notes[0].number).to.equal(65);
  });

  it("#track should return the associated Track object", function () {
    expect(cScaleMidi.tracks[1].notes[0]["track"]).to.equal(
      cScaleMidi.tracks[1]
    );
  });

  it("#midi should return the associated Midi object", function () {
    expect(cScaleMidi.tracks[1].notes[0].midi).to.equal(cScaleMidi);
  });

  it("#onTick should return the MIDI tick starting this Note", function () {
    expect(cScaleMidi.tracks[1].notes[0].onTick).to.equal(1920);
  });

  it("#offTick should return the MIDI tick ending this Note", function () {
    expect(cScaleMidi.tracks[1].notes[0].offTick).to.equal(2400);
  });

  it("#onSecond should return the second starting this Note", function () {
    expect(cScaleMidi.tracks[1].notes[0].onSecond).to.equal(1.9375);
  });

  it("#offSecond should return the second ending this Note", function () {
    expect(cScaleMidi.tracks[1].notes[0].offSecond).to.equal(2.1875);
  });

  it("#duration should return the duration of this Note in seconds", function () {
    expect(cScaleMidi.tracks[1].notes[0].duration).to.equal(0.25);
  });

  it("#onAt should return true when a note is on at the given second", function () {
    expect(cScaleMidi.tracks[2].notes[0].onAt(0)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onAt(0.25)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onAt(0.5)).to.be.true;
  });

  it("#onAt should return false when a note is not on at the given second", function () {
    expect(cScaleMidi.tracks[2].notes[0].onAt(-1)).to.be.false;
    expect(cScaleMidi.tracks[2].notes[0].onAt(1)).to.be.false;
  });

  it("#onDuring should return true when a note is on during the given time range", function () {
    expect(cScaleMidi.tracks[2].notes[0].onDuring(-0.5, 0)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(0, 0.5)).to.be.true;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(0.5, 1)).to.be.true;
  });

  it("#onDuring should return false when a note is not on during the given time range", function () {
    expect(cScaleMidi.tracks[2].notes[0].onDuring(-1, -0.01)).to.be.false;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(0.51, 1)).to.be.false;
    expect(cScaleMidi.tracks[2].notes[0].onDuring(20, 30)).to.be.false;
  });
});
