'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');

exports.save = (data, outPath = '/etc/hostname') => (
  new Promise((resolve, reject) => {
    if (!data) {
      reject(new Error('Undefined parameter data!'));
    }

    fs.writeFile(outPath, data, 'utf8', (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  })
);
