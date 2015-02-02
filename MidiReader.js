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

MidiReader.prototype.readEvent = function() {
  var event = {};
  event.deltaTime = this.readVLQ();

  var firstByte = this.readInt8();
  if(firstByte == 0xff){
    event.type = 'meta';
    var subtypeByte = this.readInt8();
    var length = this.readVLQ();
    switch(subtypeByte){
      case 0x00:
        event.subtype = 'sequenceNumber';
        if (length != 2) throw "Length for this sequenceNumber event was " + length + ", but must be 2";
        event.number = this.readInt16();
        return event;
      case 0x01:
        event.subtype = 'text';
        event.text = this.read(length);
        return event;
      case 0x02:
        event.subtype = 'copyright';
        event.text = this.read(length);
        return event;
      case 0x03:
        event.subtype = 'trackName';
        event.text = this.read(length);
        return event;
      case 0x04:
        event.subtype = 'instrumentName';
        event.text = this.read(length);
        return event;
      case 0x05:
        event.subtype = 'lyric';
        event.text = this.read(length);
        return event;
      case 0x06:
        event.subtype = 'marker';
        event.text = this.read(length);
        return event;
      case 0x07:
        event.subtype = 'cuePoint';
        event.text = this.read(length);
        return event;
      case 0x08:
        event.subtype = 'programName';
        event.text = this.read(length);
        return event;
      case 0x09:
        event.subtype = 'deviceName';
        event.text = this.read(length);
        return event;
      case 0x20:
        event.subtype = 'channelPrefix';
        event.text = this.readInt8();
        if (length != 1) throw "Length for this midiChannelPrefix event was " + length + ", but must be 1";
        return event;
      case 0x21:
        event.subtype = 'port';
        event.port = this.readInt8();
        if (length != 1) throw "Length for this port event was " + length + ", but must be 1";
        return event;
      case 0x2f:
        event.subtype = 'endOfTrack';
        if (length != 0) throw "Length for this endOfTrack event was " + length + ", but must be 0";
        return event;


    }

  } else {
    event.type = 'channel';
    var statusByte, dataByte1;
    if(firstByte < 0x80){ // running status; first byte is the first data byte
      dataByte1 = firstByte;
      statusByte = this.lastStatusByte; 
    } else { // new status; first byte is the status byte
      dataByte1 = this.readInt8();
      statusByte = firstByte;
      this.lastStatusByte = statusByte;
    }

    event.channel = statusByte & 0x0f;
    var eventSubtype = statusByte >> 4;
    switch(eventSubtype) {
      case 0x8:
        event.subtype = 'noteOff';
        event.pitch = dataByte1;
        event.velocity = this.readInt8();
        return event;
      case 0x9:
        event.pitch = dataByte1;
        event.velocity = this.readInt8();
        event.subtype = (event.velocity==0 ? 'noteOff' : 'noteOn')
        return event;
      case 0xa:
        event.subtype = 'aftertouch';
        event.pitch = dataByte1;
        event.pressure = this.readInt8();
        return event;
      case 0xb:
        event.subtype = 'controller';
        event.controller = dataByte1;
        event.value = this.readInt8();
        return event;
      case 0xc:
        event.subtype = 'program';
        event.program = dataByte1;
        return event;
      case 0xd:
        event.subtype = 'channelPressure';
        event.pressure = dataByte1;
        return event;
      case 0xe:
        event.subtype = 'pitchBend';
        event.value = (this.readInt8() << 7) + dataByte1
        return event;
    }    
  }





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
