var Note = require('../Note');
var fs = require('fs');
var expect = require('chai').expect;

var note = new Note({pitch: 60}, {pitch: 60});

describe('Note', function(){
  it('should construct a Note instance', function(){
    expect(note).to.not.be.null();
  });

  it('#pitch should return this note\'s pitch', function(){
    expect(note.pitch).to.equal(60);
  });


})
