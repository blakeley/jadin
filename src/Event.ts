import Track from './Track';
import Note from './Note';
import Midi from './Midi';

export default class Event {
  track?: Track;
  type?: string|number;
  subtype?: any;
  text?: string|number;
  port?: number;
  data?: string;
  tick?: number;
  deltaTime?: number;
  note?: Note;
  number?: number;
  tempo?: number;
  frameRate?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  frames?: number;
  subframes?: number;
  numerator?: number;
  denominator?: number;
  metronome?: number;
  thirtySeconds?: number;
  key?: number;
  scale?: number;
  velocity?: number;
  channel?: number;
  pressure?: number;
  controller?: number;
  value?: number;
  program?: number;

  constructor(){}

  get midi(): Midi|null {
    return this.track.midi; 
  }

  get second(): number|null {
    return this.midi.tickToSecond(this.tick);
  }
}
