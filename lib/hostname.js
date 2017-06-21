'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');

exports.save = (data, outPath = '/etc/hostname') => (
  new Promise((resolve, reject) => {
    if (!data) {
      reject(new Error('Undefined parameter data!'));
      return;
    }

    fs.writeFile(outPath, data, 'utf8', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
);
