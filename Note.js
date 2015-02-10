function Note(onEvent, offEvent) {
  this.pitch = onEvent.pitch;

  Object.defineProperty(this, 'midi', {
    get: function() {
      return this.track.midi;
    }
  });
};

module.exports = Note;