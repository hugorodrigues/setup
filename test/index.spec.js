'use strict';

/**
 * Module dependencies.
 */
const should = require('should'),
  index = require('../lib/index');

describe('Testing index Module', () => {

  ['hostname', 'hosts', 'datetime', 'networking']
  .forEach((module) => {

    it(`should expose the '${module}' module`, () => {
      should.exist(index);
      index.should.have.property(module);
    });

  });

});
