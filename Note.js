function Note(onEvent, offEvent) {
  this.number = onEvent.number;
  this.onTick = onEvent.tick;
  this.offTick = offEvent.tick;

  Object.defineProperty(this, 'midi', {
    get: function() {
      return this.track.midi;
    }
  });

  Object.defineProperty(this, 'onSecond', {
    get: function() {
      return this.midi.tickToSecond(this.onTick);
    }
  });

  Object.defineProperty(this, 'offSecond', {
    get: function() {
      return this.midi.tickToSecond(this.offTick);
    }
  });

  Object.defineProperty(this, 'duration', {
    get: function() {
      return this.offSecond - this.onSecond;
    }
  });
};

Note.prototype.onAt = function(second){
  return this.onSecond <= second && second <= this.offSecond;  
};

Note.prototype.onDuring = function(onSecond, offSecond){
  return this.onSecond <= offSecond && this.offSecond >= onSecond;
};



module.exports = Note;
