'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs');

function hosts (data, hostnameFilePath = '/etc/hostname') {

  const hostName = fs.readFileSync(hostnameFilePath, 'utf8');
  let output = [];

  output.push('127.0.0.1 localhost');
  output.push(`127.0.1.1 ${hostName}`);
  output.push('');

  // add IPv6
  output.push('# The following lines are desirable for IPv6 capable hosts');
  output.push('::1       ip6-localhost ip6-loopback');
  output.push('fe00::0   ip6-localnet');
  output.push('ff00::0   ip6-mcastprefix');
  output.push('ff02::1   ip6-allnodes');
  output.push('ff02::2:  ip6-allrouters');

  Object.keys(data)
  .forEach((ip) => {
    const host = data[ip];
    output.push(`${ip} ${host}`);
  });

  const result = output.join('\r\n');
  hosts.hostsConfig = result;

  return hosts;
}

hosts.save = (outPath = '/etc/hosts') => (
  new Promise((resolve, reject) => {
    if (!hosts.hostsConfig) {
      reject(new Error('Undefined hostsConfig!'));
    }

    fs.writeFile(outPath, hosts.hostsConfig, 'utf8', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(hosts.hostsConfig);
      }
    });
  })
);

module.exports = hosts;
