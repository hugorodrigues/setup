'use strict';

/**
 * Module dependencies.
 */
const cp = require('child_process');

/**
 * Returns the formatted date-time of the operating system
 * using linux date command.
 *
 * @see http://man7.org/linux/man-pages/man1/date.1.html
 *
 * @example
 * const result = await datetime.get('+"%Y-%m-%dT%H:%M:%S%z"');
 * console.log(result);
 * @param {String} [format='+"%Y-%m-%dT%H:%M:%S%z"'] - Time format
 * @return {Proimse<String|Error>}
 */
exports.get = (format = '+"%Y-%m-%dT%H:%M:%S%z"') => (
  new Promise((resolve, reject) => {
    const cmd = 'date ' + format;

    // child_process execute command
    cp.exec(cmd, cb);
    function cb(error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    }
  })
);


/**
 * Set the new system time and set the Hardware Clock to the current System Time.
 *
 * @see http://man7.org/linux/man-pages/man1/date.1.html
 *
 * @param  {String}   time - The new System Time
 *
 * @return {Promise<String|Error>}
 */
exports.set = time => (
  new Promise((resolve, reject) => {
    if (!time || !time.length) {
      throw new Error('Undefined parameter time!');
    }
    // Set the time and
    // Set the Hardware Clock to the current System Time.
    const cmd = `date --set="${time}"; hwclock --systohc;`;

    // child_process execute command
    cp.exec(cmd, cb);
    function cb(error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    }
  })
);

/**
 * Set the date and time via NTP
 *
 * @see https://help.ubuntu.com/lts/serverguide/NTP.html
 *
 * @return {Promise<String|Error>}
 */
exports.ntpSynchronize = () => (

  new Promise((resolve, reject) => {
    // Set the time and
    // Set the Hardware Clock to the current System Time.
    const cmd = 'ntpdate ntp.ubuntu.com';

    // child_process execute command
    cp.exec(cmd, cb);
    function cb(error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    }
  })
);
