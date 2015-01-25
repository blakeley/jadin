function MidiReader(data) {
  this.data = data;
  this.position = 0;
};

MidiReader.prototype.read = function(length) {
  var result = this.data.substr(this.position, length);
  this.position += length;
  return result;
}


module.exports = MidiReader;