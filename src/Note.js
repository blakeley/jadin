export default class Note {
  constructor(number, onTick, offTick) {
    this.number = number;
    this._onTick = onTick;
    this._offTick = offTick;
  }

  get onTick() {
    return this._onTick
  }

  set onTick(value) {
    if (value >= this.offTick) throw "Cannot set onTick to be greater than or equal to offTick"
    this._onTick = value;
  }

  get offTick() {
    return this._offTick;
  }

  set offTick(value) {
    if (value <= this.onTick) throw "Cannot set offTick to be less than or equal to onTick"
    this._offTick = value;
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
