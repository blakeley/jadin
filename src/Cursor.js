export default class Cursor {
  constructor(events){
    this.events = events;
    this.index = 0;
  }

  get event(){
    return this.events[this.index]
  }

  wind(second, callbacks={}){
    while(!!this.event && this.event.second <= second){
      if(!!callbacks[this.event.subtype]){
        callbacks[this.event.subtype](this.event);
      }
      this.index++;
    }
  }
}