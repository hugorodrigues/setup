'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  cp = require('child_process'),
  mockfs = require('mock-fs'),
  sinon = require('sinon'),
  should = require('should'),
  proxyquire = require('proxyquire').noPreserveCache().noCallThru(),
  hosts = proxyquire('../lib/hosts', { 'child_process': cp });

describe('Testing hosts Functions', () => {

  const sandbox = sinon.sandbox.create();
  const hostnameFilePath = '/etc/hostname';
  const filePath = '/etc/hosts';
  const myHostname = 'setup.hostname';

  beforeEach(() => {
    mockfs({
      [hostnameFilePath]: myHostname
    });
  });

  after(() => {
    mockfs.restore();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Testing constructor function', () => {

    it('should throw an error if fs.readfileSync failed', () => {
      const expected = 'Some error occured';
      const stub = sandbox.stub(fs, 'readFileSync')
        .throws(new Error(expected));

      try {
        hosts();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to return the new hosts string succesfully', () => {
      const expected = '127.0.0.1 localhost\r\n' +
        `127.0.1.1 ${myHostname}\r\n\r\n` +
        '# The following lines are desirable for IPv6 capable hosts\r\n' +
        '::1       ip6-localhost ip6-loopback\r\n' +
        'fe00::0   ip6-localnet\r\n' +
        'ff00::0   ip6-mcastprefix\r\n' +
        'ff02::1   ip6-allnodes\r\n' +
        'ff02::2:  ip6-allrouters\r\n' +
        '10.0.0.1 server1.example.com\r\n' +
        '10.0.0.2 server2.example.com';

      const cfg = {
        '10.0.0.1': 'server1.example.com',
        '10.0.0.2': 'server2.example.com'
      };

      try {
        hosts(cfg);
        const result = hosts.hostsConfig;
        should.exist(result);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });

  });

  describe('Testing save function', () => {

    it('should throw an error if fs.writeFile failed', async () => {

      const expected = 'Some error occured!';

      sandbox.stub(fs, 'writeFile').callsFake((fPath, data, options, cb) => {
        cb(new Error(expected));
      });

      try {
        const result = await hosts.save(filePath);
        should.fail(result);
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    });

    it('should throw an error if hostsConfig is undefined', async () => {

      const expected = 'Undefined hostsConfig!';

      try {
        hosts.hostsConfig = null;
        const result = await hosts.save(filePath);
        should.fail(result);
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    });


    it('should be able to save the generated configuration succesfully', async () => {

      const expected = '127.0.0.1 localhost\r\n' +
        `127.0.1.1 ${myHostname}\r\n\r\n` +
        '# The following lines are desirable for IPv6 capable hosts\r\n' +
        '::1       ip6-localhost ip6-loopback\r\n' +
        'fe00::0   ip6-localnet\r\n' +
        'ff00::0   ip6-mcastprefix\r\n' +
        'ff02::1   ip6-allnodes\r\n' +
        'ff02::2:  ip6-allrouters\r\n' +
        '10.0.0.1 server1.example.com\r\n' +
        '10.0.0.2 server2.example.com';

      const cfg = {
        '10.0.0.1': 'server1.example.com',
        '10.0.0.2': 'server2.example.com'
      };

      try {
        const result = await hosts(cfg).save(filePath);
        const output = fs.readFileSync(filePath, 'utf8');

        should.exist(result);
        result.should.equal(expected);

        should.exist(output);
        result.should.equal(output);
      } catch (error) {
        should.fail(error);
      }
    });

    it('should be able to save the generated configuration to /etc/hosts by default', async () => {

      const expected = '127.0.0.1 localhost\r\n' +
        `127.0.1.1 ${myHostname}\r\n\r\n` +
        '# The following lines are desirable for IPv6 capable hosts\r\n' +
        '::1       ip6-localhost ip6-loopback\r\n' +
        'fe00::0   ip6-localnet\r\n' +
        'ff00::0   ip6-mcastprefix\r\n' +
        'ff02::1   ip6-allnodes\r\n' +
        'ff02::2:  ip6-allrouters\r\n' +
        '10.0.0.1 server1.example.com\r\n' +
        '10.0.0.2 server2.example.com';

      const cfg = {
        '10.0.0.1': 'server1.example.com',
        '10.0.0.2': 'server2.example.com'
      };

      try {
        const result = await hosts(cfg).save();
        const output = fs.readFileSync(filePath, 'utf8');

        should.exist(result);
        result.should.equal(expected);

        should.exist(output);
        result.should.equal(output);
      } catch (error) {
        should.fail(error);
      }
    });
  });
});
