import { expect } from "chai";
import Cursor from "../src/Cursor";

describe("Cursor", function () {
  it("#new should construct a Cursor instance", function () {
    expect(new Cursor([])).not.to.be.null;
  });

  it("#nextEvent returns the event immediately following the current position", function () {
    const cursor = new Cursor(["a", "b", "c"] as any);
    expect(cursor.nextEvent).to.equal("a");
    cursor.index = 2;
    expect(cursor.nextEvent).to.equal("c");
  });

  it("#forward moves the cursor to the first event which occurs strictly after the given time", function () {
    const cursor = new Cursor([
      { second: 0, subtype: "noteOn" },
      { second: 1, subtype: "noteOn" },
      { second: 2, subtype: "noteOn" },
      { second: 3, subtype: "noteOn" },
    ] as any);

    cursor.forward(1);

    expect(cursor.index).to.equal(2);
  });

  it("#forward can advance to the end of the event array", function () {
    const cursor = new Cursor([
      { second: 0, subtype: "noteOn" },
      { second: 1, subtype: "noteOn" },
      { second: 2, subtype: "noteOn" },
      { second: 3, subtype: "noteOn" },
    ] as any);

    cursor.forward(99);

    expect(cursor.index).to.equal(4);
  });

  it("#forward sets second", function () {
    const cursor = new Cursor([{ second: 1, subtype: "unknown" }] as any);
    cursor.forward(2);
    expect(cursor.second).to.equal(2);
  });

  it("#previousEvent returns the event immediately preceding the current position", function () {
    const cursor = new Cursor(["a", "b", "c"] as any);
    expect(cursor.previousEvent).to.be.undefined;
    cursor.index = 2;
    expect(cursor.previousEvent).to.equal("b");
  });

  it("#backward moves the cursor to the last event which occurs at or after the given time", function () {
    const cursor = new Cursor([
      { second: 0, subtype: "noteOn" },
      { second: 1, subtype: "noteOn" },
      { second: 2, subtype: "noteOn" },
      { second: 3, subtype: "noteOn" },
    ] as any);

    cursor.index = 4;
    cursor.backward(1);

    expect(cursor.index).to.equal(2);
  });

  it("#backward can advance to the beginning of the event array", function () {
    const cursor = new Cursor([
      { second: 0, subtype: "noteOn" },
      { second: 1, subtype: "noteOn" },
      { second: 2, subtype: "noteOn" },
      { second: 3, subtype: "noteOn" },
    ] as any);

    cursor.index = 4;
    cursor.backward(-1);

    expect(cursor.index).to.equal(0);
  });

  it("#backward works with null callbacks", function () {
    const cursor = new Cursor([{ second: 1, subtype: "unknown" }] as any);
    cursor.index = 1;
    cursor.backward(0);
    expect("everthing").to.be.ok;
  });

  it("#backward sets second", function () {
    const cursor = new Cursor([{ second: 1, subtype: "unknown" }] as any);
    cursor.backward(0);
    expect(cursor.second).to.equal(0);
  });
});
