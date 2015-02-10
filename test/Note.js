var Note = require('../Note');
var fs = require('fs');
var expect = require('chai').expect;

describe('Note', function(){
  it('should construct a Note instance', function(){
    expect(new Note({},{})).to.not.be.null()
  });


})
