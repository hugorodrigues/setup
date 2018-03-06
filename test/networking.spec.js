'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  cp = require('child_process'),
  mockfs = require('mock-fs'),
  path = require('path'),
  sinon = require('sinon'),
  should = require('should'),
  proxyquire = require('proxyquire').noPreserveCache().noCallThru(),
  networking = proxyquire('../lib/networking', { 'child_process': cp });

describe('Testing networking Functions', () => {

  const sandbox = sinon.sandbox.create();
  let interfaces = './test/interfaces';
  const filePath = '/etc/network/interfaces';

  beforeEach(() => {
    mockfs({
      [filePath]: ''
    });
  });

  after(() => {
    mockfs.restore();
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('Testing parseSync function', () => {

    it('should throw an error if the auto definition is missing', () => {
      const data = 'iface foo inet';
      const expected = 'Parse error! Missing `auto` definition!';

      try {
        fs.writeFileSync(filePath, data, 'utf8');
        networking.parseSync(filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should throw an error if an iface definition is incorrect', () => {
      const data = 'auto lo\n\niface foo inet';
      const expected = `Parse error! Incorrect iface definition at: 'iface foo inet'`;

      try {
        fs.writeFileSync(filePath, data, 'utf8');
        networking.parseSync(filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to parseSync the /etc/network/interfaces by default', () => {

      const data = 'auto lo\n\niface lo inet loopback';

      try {
        fs.writeFileSync(filePath, data, 'utf8');
        const result = networking.parseSync();
        should.exist(result);
        result.should.have.property('auto', ['lo']);
        result.should.have.property('ifaces').which.is.an.Array();
        result.ifaces.should.have.lengthOf(1);
      } catch (error) {
        should.not.exist(error);
      }

    });

    it('should be able to parseSync the interfaces file succesfully', () => {
      try {
        mockfs.restore();// disable mockfs

        const result = networking.parseSync(interfaces);
        let expected_settings, raw;

        result.should.have.property('auto', [ 'lo' ]);
        result.should.have.property('ifaces').which.is.an.Array();
        result.ifaces.should.have.lengthOf(4);

        // iface lo inet loopback
        raw = 'iface lo inet loopback\n';
        result.ifaces[0].should.have.property('auto', true);
        result.ifaces[0].should.have.property('device', 'lo');
        result.ifaces[0].should.have.property('mode', 'loopback');
        result.ifaces[0].should.have.property('wired', false);
        result.ifaces[0].should.have.property('bluetooth', false);
        result.ifaces[0].should.have.property('loopback', true);
        result.ifaces[0].should.have.property('wireless', false);
        result.ifaces[0].should.have.property('static', false);
        result.ifaces[0].should.have.property('dhcp', false);
        result.ifaces[0].should.have.property('raw', raw);

        // iface wlan0 inet dhcp
        //   wpa-driver nl80211
        //   wpa-conf /etc/wpa_suppliant.conf
        expected_settings = {
          'wpa-driver': 'nl80211',
          'wpa-conf': '/etc/wpa_suppliant.conf'
        };
        raw = 'iface wlan0 inet dhcp\nwpa-driver nl80211\nwpa-conf /etc/wpa_suppliant.conf\n'

        result.ifaces[1].should.have.property('auto', false);
        result.ifaces[1].should.have.property('device', 'wlan0');
        result.ifaces[1].should.have.property('mode', 'dhcp');
        result.ifaces[1].should.have.property('wired', false);
        result.ifaces[1].should.have.property('bluetooth', false);
        result.ifaces[1].should.have.property('loopback', false);
        result.ifaces[1].should.have.property('wireless', true);
        result.ifaces[1].should.have.property('static', false);
        result.ifaces[1].should.have.property('dhcp', expected_settings);
        result.ifaces[1].should.have.property('raw', raw);

        // iface eth0 inet static
        //   address 192.168.1.15
        // netmask 255.255.255.0
        // gateway 192.168.1.254
        // broadcast 192.168.0.255
        // dns-nameservers 192.168.1.3
        expected_settings = {
          'address': '192.168.1.15',
          'netmask': '255.255.255.0',
          'gateway': '192.168.1.254',
          'broadcast': '192.168.0.255',
          'dns-search': ['example.com', 'sales.example.com', 'dev.example.com'],
          'dns-nameservers': ['192.168.1.3']
        };
        raw = 'iface eth0 inet static\n'+
        'address 192.168.1.15\n' +
        'netmask 255.255.255.0\n' +
        'gateway 192.168.1.254\n' +
        'broadcast 192.168.0.255\n' +
        'dns-search example.com sales.example.com dev.example.com\n' +
        'dns-nameservers 192.168.1.3\n';

        result.ifaces[2].should.have.property('auto', false);
        result.ifaces[2].should.have.property('device', 'eth0');
        result.ifaces[2].should.have.property('mode', 'static');
        result.ifaces[2].should.have.property('wired', true);
        result.ifaces[2].should.have.property('bluetooth', false);
        result.ifaces[2].should.have.property('loopback', false);
        result.ifaces[2].should.have.property('wireless', false);
        result.ifaces[2].should.have.property('static', expected_settings);
        result.ifaces[2].should.have.property('dhcp', false);
        result.ifaces[2].should.have.property('raw', raw);


        // iface bnep0 inet dhcp
        raw = 'iface bnep0 inet dhcp\n';
        result.ifaces[3].should.have.property('auto', false);
        result.ifaces[3].should.have.property('device', 'bnep0');
        result.ifaces[3].should.have.property('mode', 'dhcp');
        result.ifaces[3].should.have.property('wired', false);
        result.ifaces[3].should.have.property('bluetooth', true);
        result.ifaces[3].should.have.property('loopback', false);
        result.ifaces[3].should.have.property('wireless', false);
        result.ifaces[3].should.have.property('static', false);
        result.ifaces[3].should.have.property('dhcp', {});
        result.ifaces[3].should.have.property('raw', raw);
      } catch (error) {
        should.fail(error);
      }
    });
  });

  describe('Testing saveSync function', () => {

    it('should throw an error if an iface definition is missing', () => {
      const expected = 'Invalid configuration, missing ifaces!';

      const config = {
        auto: ['lo']
      };

      try {
        networking.saveSync(config, filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should throw an error if the required iface property `device` is missing', () => {
      const expected = `Missing property! Iface property 'device' is required!`;

      const config = {
        auto: ['lo'],
        ifaces: {
          mode: 'dhcp'
        }
      };

      try {
        networking.saveSync(config, filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should throw an error if the required iface property `mode` is missing', () => {
      const expected = `Missing property! Iface property 'mode' is required!`;

      const config = {
        auto: ['lo'],
        ifaces: {
          device: 'eth0'
        }
      };

      try {
        networking.saveSync(config, filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should throw an error if an iface settings has an undefined value', () => {
      const expected = 'Undefined value! iface property \'address\' is \'null\'';

      const config = {
        auto: ['lo'],
        ifaces: {
          device: 'eth0',
          mode: 'static',
          static: {
            'address': null, // undefined value
            'netmask': '255.255.255.0',
            'gateway': '192.168.3.1',
            'dns-search': ['example.com', 'sales.example.com', 'dev.example.com'],
            'dns-nameservers': ['192.168.3.45', '192.168.8.10']
          }
        }
      };

      try {
        networking.saveSync(config, filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should throw an error if fs.writeFile failed', () => {
      const expected = 'Some error occured!';
      const stub = sandbox.stub(fs, 'writeFileSync')
        .throws(new Error(expected));

      const config = {
        auto: 'lo',
        ifaces: [{
          device: 'eth0',
          mode: 'dhcp'
        }]
      };

      try {
        networking.saveSync(config, filePath);
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to saveSync if the auto value is not an Array', () => {
      const expected = '# generated by node.js package `setup`\n' +
        'auto lo\n\n' +
        'iface eth0 inet dhcp\n';

      const config = {
        auto: 'lo',
        ifaces: [{
          device: 'eth0',
          mode: 'dhcp'
        }]
      };

      try {
        const result = networking.saveSync(config, filePath);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });

    it('should be able to saveSync if the iface value is not an Array', () => {
      const expected = '# generated by node.js package `setup`\n' +
        'auto lo\n\n' +
        'iface eth0 inet dhcp\n';

      const config = {
        auto: 'lo',
        ifaces: {
          device: 'eth0',
          mode: 'dhcp'
        }
      };

      try {
        const result = networking.saveSync(config, filePath);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });

    it('should be able to saveSync `auto` as loopback by default', () => {
      const expected = '# generated by node.js package `setup`\n' +
        'auto lo\n\n' +
        'iface eth0 inet dhcp\n';

      const config = {
        ifaces: [{
          device: 'eth0',
          mode: 'dhcp'
        }]
      };

      try {
        const result = networking.saveSync(config, filePath);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });

    it('should be able to saveSync the basic configuration', () => {
      const expected = '# generated by node.js package `setup`\n' +
        'auto lo\n\n' +
        'iface eth0 inet dhcp\n';

      const config = {
        auto: ['lo'],
        ifaces: [{
          device: 'eth0',
          mode: 'dhcp'
        }]
      };

      try {
        const result = networking.saveSync(config, filePath);
        result.should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    })

    it('should be able to saveSync the configuration succesfully', () => {
      const expected = '# generated by node.js package `setup`\n'+
        'auto eth0 wlan0\n\n' +
        'iface eth0 inet static\n' +
        'address 192.168.3.3\n' +
        'netmask 255.255.255.0\n' +
        'gateway 192.168.3.1\n' +
        'dns-search example.com sales.example.com dev.example.com\n' +
        'dns-nameservers 192.168.3.45 192.168.8.10\n\n' +
        'iface wlan0 inet dhcp\n\n' +
        'iface bnep0 inet dhcp\n';

      const config = {
        auto: ['eth0', 'wlan0'],
        ifaces: [{
          device: 'eth0',
          mode: 'static',
          static: {
            'address': '192.168.3.3',
            'netmask': '255.255.255.0',
            'gateway': '192.168.3.1',
            'dns-search': ['example.com', 'sales.example.com', 'dev.example.com'],
            'dns-nameservers': ['192.168.3.45', '192.168.8.10']
          }
        }, {
          device: 'wlan0',
          mode: 'dhcp'
        }, {
          device: 'bnep0',
          mode: 'dhcp'
        }]
      };

      try {
        const result = networking.saveSync(config, filePath);

      } catch (error) {
        should.fail(error);
      }
    });
  });

  describe('Testing restartSync Function', () => {
    
    it('should throw an error if the command failed', () => {
      const expected = 'Some error occured!';
      const stub = sandbox.stub(cp, 'execSync').throws(new Error(expected));

      try {
        networking.restartSync();
        should.fail();
      } catch (error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }
    });

    it('should be able to execute the networking restartSync command succefully', () => {
      const expected = '/etc/init.d/networking restart';
      const stub = sandbox.stub(cp, 'execSync');

      try {
        networking.restartSync();
        stub.should.have.been.called;
        const calls = stub.getCalls();
        const args = calls[0].args;

        args[0].should.equal(expected);
      } catch (error) {
        should.fail(error);
      }
    });
  });
});
