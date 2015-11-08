export default class Note {
  constructor(onEvent, offEvent) {
    this.number = onEvent.number;
    this.onTick = onEvent.tick;
    this.offTick = offEvent.tick;
  }

  get midi() {
    return this.track.midi; 
  }

  get onSecond() {
    return this.midi.tickToSecond(this.onTick);
  }

  get offSecond() {
    return this.midi.tickToSecond(this.offTick);
  }

  get duration() {
    return this.offSecond - this.onSecond;  
  }

  onAt(second) {
    return this.onSecond <= second && second <= this.offSecond;  
  }

  onDuring(onSecond, offSecond) {
    return this.onSecond <= offSecond && this.offSecond >= onSecond;  
  }
}
