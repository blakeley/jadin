function Note(onEvent, offEvent) {
  this.pitch = onEvent.pitch;
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


};

module.exports = Note;