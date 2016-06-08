'use strict';

describe('Basic', function() {
  Helper.runPanel( 'console.panel' );

  it('should recv ipc "console:log"', function() {
    let targetEL = Helper.targetEL;

    Helper.send('console:log', 'foo bar');

    expect(targetEL.logs[0] ).to.deep.equal({
      type: 'log',
      text: 'foo bar',
      desc: 'foo bar',
      detail: '',
      count: 0,
    });
  });

  it('should recv ipc "console:warn"', function() {
    let targetEL = Helper.targetEL;

    Helper.send('console:warn', 'foo bar');
    expect(targetEL.logs[0] ).to.deep.equal({
      type: 'warn',
      text: 'foo bar',
      desc: 'foo bar',
      detail: '',
      count: 0,
    });
  });

  it('should recv ipc "console:error"', function() {
    let targetEL = Helper.targetEL;

    Helper.send('console:error', 'foo bar');
    expect(targetEL.logs[0] ).to.deep.equal({
      type: 'error',
      text: 'foo bar',
      desc: 'foo bar',
      detail: '',
      count: 0,
    });
  });

  it('should recv logs in order', function() {
    let targetEL = Helper.targetEL;

    Helper.send('console:log', 'foobar 01');
    Helper.send('console:log', 'foobar 02');
    Helper.send('console:error', 'foobar 03 error');
    Helper.send('console:warn', 'foobar 04 warn');
    Helper.send('console:log', 'foobar 05');

    expect( targetEL.logs[0] ).to.have.property( 'text', 'foobar 01' );
    expect( targetEL.logs[1] ).to.have.property( 'text', 'foobar 02' );
    expect( targetEL.logs[2] ).to.have.property( 'text', 'foobar 03 error' );
    expect( targetEL.logs[3] ).to.have.property( 'text', 'foobar 04 warn' );
    expect( targetEL.logs[4] ).to.have.property( 'text', 'foobar 05' );
  });

  it('should recv ipc "console:clear"', function() {
    let targetEL = Helper.targetEL;

    Helper.send('console:log', 'foobar 01');
    Helper.send('console:log', 'foobar 02');
    Helper.send('console:log', 'foobar 03');
    Helper.send('console:clear');

    expect( targetEL.logs.length ).to.equal(0);
  });
});
