import Cursor from '../src/Cursor';
import {expect} from 'chai';

describe('Cursor', function(){
  it('#new should construct a Cursor instance', function(){
    expect(new Cursor([])).to.not.be.null();
  });

  it('#nextEvent returns the event immediately following the current position', function(){
    const cursor = new Cursor(['a','b','c']);
    expect(cursor.nextEvent).to.equal('a');
    cursor.index = 2;
    expect(cursor.nextEvent).to.equal('c');
  });

  it('#forward moves the cursor to the first event which occurs strictly after the given time', function(){
    const cursor = new Cursor([
        {second: 0, subtype: 'noteOn'},
        {second: 1, subtype: 'noteOn'},
        {second: 2, subtype: 'noteOn'},
        {second: 3, subtype: 'noteOn'},
      ]);

    cursor.forward(1, {
      noteOn: function(){}
    });

    expect(cursor.index).to.equal(2);
  });

  it('#forward can advance to the end of the event array', function(){
    const cursor = new Cursor([
        {second: 0, subtype: 'noteOn'},
        {second: 1, subtype: 'noteOn'},
        {second: 2, subtype: 'noteOn'},
        {second: 3, subtype: 'noteOn'},
      ]);

    cursor.forward(99, {
      noteOn: function(){}
    });

    expect(cursor.index).to.equal(4);
  });

  it('#forward calls the corresponding callback for each event it advances through', function(){
    const cursor = new Cursor([{second: 1, subtype: 'noteOn'}]);

    let callbackFired = false;
    cursor.forward(2, {
      noteOn: function(event){
        if(event.second === 1){
          callbackFired = true;
        }
      }
    });

    expect(callbackFired).to.be.true;
  });

  it('#forward works with null callbacks', function(){
    const cursor = new Cursor([{second: 1, subtype: 'unknown'}]);
    cursor.forward(2);
    expect('everthing').to.be.ok;
  });

  it('#forward sets second', function(){
    const cursor = new Cursor([{second: 1, subtype: 'unknown'}]);
    cursor.forward(2);
    expect(cursor.second).to.equal(2);
  });

  it('#previousEvent returns the event immediately preceding the current position', function(){
    const cursor = new Cursor(['a','b','c']);
    expect(cursor.previousEvent).to.be.undefined;
    cursor.index = 2;
    expect(cursor.previousEvent).to.equal('b');    
  });

  it('#backward moves the cursor to the last event which occurs at or after the given time', function(){
    const cursor = new Cursor([
        {second: 0, subtype: 'noteOn'},
        {second: 1, subtype: 'noteOn'},
        {second: 2, subtype: 'noteOn'},
        {second: 3, subtype: 'noteOn'},
      ]);

    cursor.index = 4;
    cursor.backward(1, {
      noteOn: function(){}
    });

    expect(cursor.index).to.equal(2);
  });

  it('#backward can advance to the beginning of the event array', function(){
    const cursor = new Cursor([
        {second: 0, subtype: 'noteOn'},
        {second: 1, subtype: 'noteOn'},
        {second: 2, subtype: 'noteOn'},
        {second: 3, subtype: 'noteOn'},
      ]);

    cursor.index = 4;
    cursor.backward(-1, {
      noteOn: function(){}
    });

    expect(cursor.index).to.equal(0);
  });

  it('#backward calls the corresponding callback for each event it advances through', function(){
    const cursor = new Cursor([{second: 1, subtype: 'noteOn'}]);
    cursor.index = 1;

    let callbackFired = false;
    cursor.backward(0, {
      noteOn: function(event){
        if(event.second === 1){
          callbackFired = true;
        }
      }
    });

    expect(callbackFired).to.be.true;
  });

  it('#backward works with null callbacks', function(){
    const cursor = new Cursor([{second: 1, subtype: 'unknown'}]);
    cursor.index = 1;
    cursor.backward(0);
    expect('everthing').to.be.ok;
  });


  it('#backward sets second', function(){
    const cursor = new Cursor([{second: 1, subtype: 'unknown'}]);
    cursor.backward(0);
    expect(cursor.second).to.equal(0);
  });
});
