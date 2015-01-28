function MidiReader(data) {
  this.data = data;
  this.position = 0;
};

MidiReader.prototype.read = function(length) {
  var result = this.data.substr(this.position, length);
  this.position += length;
  return result;
}

MidiReader.prototype.readInt8 = function(){
  var result = this.data.charCodeAt(this.position);
  this.position += 1;
  return result;
}

MidiReader.prototype.readInt16 = function(){
  var result = (
    (this.data.charCodeAt(this.position    ) <<  8) +
    (this.data.charCodeAt(this.position + 1)      ) );
  this.position += 2;
  return result;
}

MidiReader.prototype.readInt32 = function() {
  var result = (
    (this.data.charCodeAt(this.position    ) << 24) +
    (this.data.charCodeAt(this.position + 1) << 16) +
    (this.data.charCodeAt(this.position + 2) <<  8) +
    (this.data.charCodeAt(this.position + 3)      ) );
  this.position += 4;
  return result;
}

MidiReader.prototype.readVLQ = function() {
  var result = 0;

  do {
    result <<= 7;
    octet = this.readInt8();
    result += (octet & 0x7f);
  } while (octet & 0x80)

  return result;
}


MidiReader.prototype.readChunk = function(){
  var type = this.read(4);
  var length = this.readInt32();
  var data = this.read(length);
  return {
    type: type,
    length: length,
    data: data,
  };
};

MidiReader.prototype.isAtEndOfFile = function(){
  return this.position >= this.data.length;
}

module.exports = MidiReader;
