var Midi = require('../Midi');
var expect = require('chai').expect;

var cScaleMidi = new Midi();

describe('Midi', function(){
  it('should construct a Midi instance', function(){
    expect(cScaleMidi).to.not.be.null()
  });
})