var midi = require('../midi');
var assert = require('assert');
var expect = require('chai').expect;

it('should equal bar', function() {
  expect(midi.foo()).to.equal('bar');
});

it('should equal infinity', function() {
  expect(midi.INFINITY).to.equal('infinity');
});
