'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  readSync = path => (fs.readFileSync(path, 'utf8')),
  cp = require('child_process');

const END_LINE = '\r\n';
const SPACE = /\s/g;
const HASHTAG = '#';


/**
 * Normalize the /etc/network/interfaces file.
 *
 * @param  {String} interfaces - File content
 * @return {String}
 */

const normalize = (interfaces) => {
  const splitted = interfaces.toString()
    .replace(/\t/g, '') // remove tabs globally
    .split('\n')        // split by END_LINE
    .filter(l => l);    // remove empty array entries

  let normalized = [];
  for (let i = 0; i < splitted.length; i++) {
    const line = splitted[i].trim();
    const prevLine = splitted[i - 1];

    if (line.startsWith('iface') && prevLine && !prevLine.startsWith(HASHTAG)) {
      normalized.push(HASHTAG);
    }
    normalized.push(line);
  }

  // Add a # to the end of the normalized string
  normalized.push(HASHTAG);

  // Put it back together
  normalized = normalized.join(END_LINE);

  return normalized;
};


/**
 * Parses the /etc/network/interfaces file
 * @see https://regex101.com
 *
 * @example
 * const networking = require('setup').networking;
 *
 * networking.parse('/etc/network/interfaces')
 * .then((result) => console.log)
 * .catch((error) => console.error);
 *
 * @param  {Function} interfaces) [description]
 *
 * @return {Promise<Object|Error>}
 */

exports.parse = (filePath = '/etc/network/interfaces') => (
  new Promise((resolve, reject) => {
    try {
      const interfaces = readSync(filePath);
      const normalized = normalize(interfaces);

      let result = {
        auto: [],
        ifaces: []
      };

      // parse `auto` entries
      const lineAuto = /^auto(.+)$/gm.exec(normalized);
      if (!lineAuto) {
        throw new Error('Parse error! Missing `auto` definition!');
      }

      lineAuto[1] // get $1 regex group
        .split(SPACE)    // split by space
        .filter(l => l) // remove empty entries
        .forEach((auto) => {
          result.auto.push(auto);
        });

      // parse `iface` entries
      // positive lookahead to `#`, which has
      // been addes before each `iface` line and
      // at the last line during normalize(...)
      normalized.match(/^iface[\W\w]*?(?=#)/gm)
      .forEach((entry) => { // Loop all iface blocks
        const lines = entry
          .split(END_LINE)
          .filter(l => l);

        // Iface required 4 words
        //  iface $device inet $mode
        const definition = lines[0].split(SPACE);

        if (definition.length < 4) {
          throw new Error(`Parse error! Incorrect iface definition at: '${lines[0]}'`);
        }

        const device = definition[1] || null;
        const mode = definition[3] || null;

        // Define default object
        let iface = {
          auto: device && result.auto.includes(device),
          device: device || undefined,
          mode: mode || undefined,
          wired: device && device.includes('eth') || false,
          bluetooth: device && device.includes('bnep') || false,
          loopback: device && device.includes('lo') || false,
          wireless: device && device.includes('wlan') || false,
          static: mode && mode === 'static' ? {} : false,
          dhcp: mode && mode === 'dhcp' ? {} : false,
          raw: entry
        };

        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            const configs = lines[i].split(SPACE);
            const index = configs.shift(); // get and remove array first element
            const settings = configs;

            // Apply settings to the mode
            iface[mode][index] = settings.length === 1 ? settings[0] : settings;
          }
        }

        // Add parsed iface
        result.ifaces.push(iface);
      });

      resolve(result);
    } catch (error) {
      reject(error);
    }
  })
);


/**
 * Save the interfaces configuration to a file.
 *
 * @example
 * const networking = require('setup').networking;
 * const cfg = {
 *   auto: ['lo'],
 *   iface: [{
 *       device: 'eth0',
 *       mode: 'dhcp'
 *   }]
 * };
 *
 * networking.save(cfg, '/etc/network/myfile')
 * .then((result) => console.log)
 * .catch((error) => console.error);
 *
 * @param  {Object} config - The configuration object
 * @param  {String} [filePath='/etc/network/interfaces'] - The file to output the result
 *
 * @return {Promise<String|Error>}
 */

exports.save = (config, filePath = '/etc/network/interfaces') => (
  new Promise(async (resolve, reject) => {
    try {
      if (!config['auto']) {
        config['auto'] = ['lo'];
      } else if (!Array.isArray(config['auto'])) {
        config['auto'] = [config['auto']];
      }
      if (!config['iface']) {
        throw new Error('Invalid configuration, missing iface!');
      } else if (!Array.isArray(config['iface'])) {
        config['iface'] = [config['iface']];
      }

      // Add default comment
      let output = ['# generated by node.js package `setup`'];

      // Define required iface properties
      const iface_required = ['device', 'mode'];

      // generate `auto` settings line
      let index = 'auto';
      output.push(`${index} ` + config[index].join(' '));

      // generate `iface` setting lines
      index = 'iface';

      // create a set of lines foreach iface
      let set = '';
      config[index].forEach((iface) => {
        set += END_LINE;

        // Check required iface fields
        const iface_indexs = Object.keys(iface);
        iface_required.forEach((reqiface) => {
          if (!iface_indexs.includes(reqiface)) {
            throw new Error(`Missing property! Iface property '${reqiface}' is required!`);
          }
        });

        // Add the basic iface
        set +=  `${index} ${iface.device} inet ${iface.mode}${END_LINE}`;

        // Check for iface specific settings
        if (!iface[iface.mode]) return;

        // Parse iface settings
        const settings = iface[iface.mode];
        const settingsIndexs = Object.keys(settings);

        // Loop over settings object
        settingsIndexs.forEach((settingIndex) => {
          const value = settings[settingIndex];

          if (!value) throw new Error(`Undefined value! iface property '${settingIndex}' is '${value}'`);
          if (Array.isArray(value)) {
            set += `\t${settingIndex} ` + value.join(' ') + END_LINE;
          } else {
            set += `\t${settingIndex} ${value}${END_LINE}`;
          }
        });

      });


      // Add the set
      output.push(set);

      // Join every line
      output = output.join(END_LINE);

      // Save the output
      fs.writeFile(filePath, output, 'utf8', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    } catch (error) {
      reject(error);
    }
  })
);

/**
 * Restart the network
 *
 * @return {Promise<String|Error>}
 */
exports.restart = () => (
  new Promise((resolve, reject) => {
    const cmd = '/etc/init.d/networking restart';

    // Execute the child_process command
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