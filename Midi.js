var MidiReader = require('./MidiReader');

function Midi(data) {
  this.reader = new MidiReader(data);
};

module.exports = Midi;
