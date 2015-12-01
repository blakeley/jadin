import Cursor from '../src/Cursor';
import {expect} from 'chai';

describe('Cursor', function(){
  it('#new should construct a Cursor instance', function(){
    expect(new Cursor([])).to.not.be.null();
  });
});
