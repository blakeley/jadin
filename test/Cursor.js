import Cursor from '../src/Cursor';
import {expect} from 'chai';

describe('Cursor', function(){
  it('#new should construct a Cursor instance', function(){
    expect(new Cursor([])).to.not.be.null();
  });

  it('#event returns the event at the current position', function(){
    const cursor = new Cursor(['a','b','c']);
    expect(cursor.event).to.equal('a');
    cursor.index = 2;
    expect(cursor.event).to.equal('c');
  });

  it('#wind advances the cursor to the first event which occurs after the given time', function(){
    const cursor = new Cursor([
        {second: 0, subtype: 'noteOn'},
        {second: 1, subtype: 'noteOn'},
        {second: 2, subtype: 'noteOn'},
        {second: 3, subtype: 'noteOn'},
      ]);

    cursor.wind(1, {
      noteOn: function(){}
    });

    expect(cursor.index).to.equal(2);
  });

  it('#wind can advance to the end of the event array', function(){
    const cursor = new Cursor([
        {second: 0, subtype: 'noteOn'},
        {second: 1, subtype: 'noteOn'},
        {second: 2, subtype: 'noteOn'},
        {second: 3, subtype: 'noteOn'},
      ]);

    cursor.wind(99, {
      noteOn: function(){}
    });

    expect(cursor.index).to.equal(4);
  });

  it('#wind calls the corresponding callback for each event it advances through', function(){
    const cursor = new Cursor([{second: 1, subtype: 'noteOn'}]);

    let callbackFired = false;
    cursor.wind(2, {
      noteOn: function(event){
        if(event.second === 1){
          callbackFired = true;
        }
      }
    });

    expect(callbackFired).to.be.true;
  });

  it('#wind works with null callbacks', function(){
    const cursor = new Cursor([{second: 1, subtype: 'noteOn'}]);
    cursor.wind(2);
    expect('everthing').to.be.ok;
  });
});
