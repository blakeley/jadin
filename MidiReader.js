function MidiReader(data) {
  this.data = data;
  this.position = 0;
};

MidiReader.prototype.read = function(length) {
  var result = this.data.substr(this.position, length);
  this.position += length;
  return result;
}

MidiReader.prototype.readLength = function() {
  var result = (
    (this.data.charCodeAt(this.position    ) << 24) +
    (this.data.charCodeAt(this.position + 1) << 16) +
    (this.data.charCodeAt(this.position + 2) <<  8) +
    (this.data.charCodeAt(this.position + 3)      ) ); 
  this.position += 4;
  return result;
}

MidiReader.prototype.readChunk = function(){
  var type = this.read(4);
  var length = this.readLength();
  var data = this.read(length);
  return {
    type: type,
    length: length,
    data: data,
  };
};



module.exports = MidiReader;
