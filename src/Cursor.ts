import Event from './Event';

export default class Cursor {
  events: Event[];
  index: number;
  second: number;

  constructor(events){
    this.events = events;
    this.index = 0;
    this.second = 0;
  }

  get nextEvent(){
    return this.events[this.index];
  }

  get previousEvent(){
    return this.events[this.index-1];
  }

  forward(second, callbacks={}){
    this.second = second;

    while(!!this.nextEvent && this.nextEvent.second <= second){
      if(!!callbacks[this.nextEvent.subtype]){
        callbacks[this.nextEvent.subtype](this.nextEvent);
      }

      this.index++;
    }
  }

  backward(second, callbacks={}){
    this.second = second;

    while(!!this.previousEvent && this.previousEvent.second > second){
      if(!!callbacks[this.previousEvent.subtype]){
        callbacks[this.previousEvent.subtype](this.previousEvent);
      }

      this.index--;
    }    
  }
}
