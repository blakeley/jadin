export default class Event {
  constructor(){}

  get midi() {
    return this.track.midi; 
  }

  get second() {
    return this.midi.tickToSecond(this.tick);
  }
}
