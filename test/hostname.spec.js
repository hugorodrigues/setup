'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  mockfs = require('mock-fs'),
  sinon = require('sinon'),
  should = require('should'),
  hostname = require('../lib/hostname');

describe('Testing hosts Functions', () => {

  const sandbox = sinon.sandbox.create();
  const filePath = '/etc/hostname';
  const myHostname = 'setup.hostname';

  beforeEach(() => {
    mockfs({
      [filePath]: myHostname
    });
  });

  after(() => {
    mockfs.restore();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Testing save function', () => {

    it('should throw an error if the data parameter is undefined', async () => {

      const expected = 'Undefined parameter data!';

      try {
        const result = await hostname.save(null, filePath);
        should.fail(result);
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    })
    it('should throw an error if fs.writeFile failed', async () => {

      const expected = 'Some error occured!';

      sandbox.stub(fs, 'writeFile').callsFake((fPath, data, options, cb) => {
        cb(new Error(expected));
      });

      try {
        const result = await hostname.save('my.new.host.name', filePath);
        should.fail(result);
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    });

    it('should be able to save the new hostname succesfully', async () => {
      
      const hostName = 'my.new.host.name';

      try {
        const result = await hostname.save(hostName, filePath);

        should.exist(result);
        result.should.equal(hostName);

        const data = fs.readFileSync(filePath, 'utf8');

        should.exist(data);
        data.should.equal(hostName);

      } catch (error) {
        console.log(error);
        should.not.exist(error);
      }
    });

    it('should be able to save the new hostname to /etc/hostname by default', async () => {
      
      const hostName = 'my.new.host.name';

      try {
        const result = await hostname.save(hostName);

        should.exist(result);
        result.should.equal(hostName);

        const data = fs.readFileSync(filePath, 'utf8');

        should.exist(data);
        data.should.equal(hostName);

      } catch (error) {
        console.log(error);
        should.not.exist(error);
      }
    });
  });

});
