'use strict';

/**
 * Module dependencies.
 */
const cp = require('child_process'),
  sinon = require('sinon'),
  should = require('should'),
  proxyquire = require('proxyquire').noPreserveCache().noCallThru(),
  datetime = proxyquire('../lib/datetime', { 'child_process': cp });

Date.prototype.toIsoString = function() {
  let tzo = -this.getTimezoneOffset(),
    dif = tzo >= 0 ? '+' : '-',
    pad = function(num) {
      let norm = Math.abs(Math.floor(num));
      return (norm < 10 ? '0' : '') + norm;
    };
  return this.getFullYear() +
    '-' + pad(this.getMonth() + 1) +
    '-' + pad(this.getDate()) +
    'T' + pad(this.getHours()) +
    ':' + pad(this.getMinutes()) +
    ':' + pad(this.getSeconds()) +
    dif + pad(tzo / 60) +
    ':' + pad(tzo % 60);
};

describe('Testing datetime Functions', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  describe('Testing get Function', () => {
    
    it('should throw an error if the command failed', async () => {
      const expected = 'Some error occured!';
      const stub = sandbox.stub(cp, 'exec').callsFake((cmd, cb) => {
        cb(new Error(expected), null, null);
      });

      try {
        await datetime.get();
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to execute the get date command succefully', async () => {
      try {
        const result = await datetime.get('+"%Y-%m-%dT%H:%M:%S%z"');
        should.exist(result);

        const now = new Date().toIsoString().split('T')[0];
        const test = result.split('T')[0];

        now.should.equal(test);

      } catch (error) {
        should.fail(error);
      }
    });
  });


  describe('Testing set Function', () => {
    
    it('should throw an error if the time parameter is undefined', async () => {
      const expected = 'Undefined parameter time!';

      try {
        await datetime.set();
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should throw an error if the command failed', async () => {
      const expected = 'Some error occured!';
      const time = '2017-06-02 12:59:56';
      const stub = sandbox.stub(cp, 'exec').callsFake((cmd, cb) => {
        cb(new Error(expected), null, null);
      });

      try {
        await datetime.set(time);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to execute the set date command succefully', async () => {
      const time = '2017-06-02 12:59:56';
      const expected = `date --set="${time}"; hwclock --systohc;`;
      const stub = sandbox.stub(cp, 'exec').callsFake((cmd, cb) => {
        cb(null, cmd, null);
      });

      try {
        const result = await datetime.set(time);
        should.exist(result);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });
  });


  describe('Testing ntpSynchronize Function', () => {
    
    it('should throw an error if the command failed', async () => {
      const expected = 'Some error occured!';
      const stub = sandbox.stub(cp, 'exec').callsFake((cmd, cb) => {
        cb(new Error(expected), null, null);
      });

      try {
        await datetime.ntpSynchronize();
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to execute the ntpdate command succefully', async () => {
      const expected = 'ntpdate ntp.ubuntu.com';
      const stub = sandbox.stub(cp, 'exec').callsFake((cmd, cb) => {
        cb(null, cmd, null);
      });

      try {
        const result = await datetime.ntpSynchronize();
        should.exist(result);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });
  });

});
