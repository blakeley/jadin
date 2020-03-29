import Event from './Event';
import Track from './Track';

export default class Note {
  onEvent: Event;
  offEvent: Event;
  track!: Track;

  constructor(onEvent = new Event(), offEvent = new Event()) {
    this.onEvent = onEvent;
    this.offEvent = offEvent;
    onEvent.note = this;
    offEvent.note = this;
  }

  get onTick() {
    return this.onEvent.tick;
  }

  set onTick(value) {
    if (value! >= this.offTick) throw "Cannot set onTick to be greater than or equal to offTick"
    this.onEvent.tick = value;
  }

  get offTick() {
    return this.offEvent.tick!;
  }

  set offTick(value: number) {
    if (value <= this.onTick!) throw "Cannot set offTick to be less than or equal to onTick"
    this.offEvent.tick = value;
  }

  get midi() {
    return this.track.midi; 
  }

  get number() {
    return this.onEvent.number;
  }

  set number(value) {
    this.onEvent.number = value;
    this.offEvent.number = value;
  }

  get onSecond() {
    return this.onEvent.second;
  }

  get offSecond() {
    return this.offEvent.second;
  }

  get duration() {
    return this.offSecond! - this.onSecond!;  
  }

  onAt(second: number) {
    return this.onSecond! <= second && second <= this.offSecond!;
  }

  onDuring(onSecond: number, offSecond: number) {
    return this.onSecond! <= offSecond && this.offSecond! >= onSecond;  
  }
}
