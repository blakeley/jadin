var MidiReader = require('./MidiReader');


function Track(data) {
  var reader = new MidiReader(data);

}


module.exports = Track;
