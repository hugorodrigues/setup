# setup

[![Build Status](https://travis-ci.org/ninox92/setup.svg?branch=master)](https://travis-ci.org/ninox92/setup)
[![Coverage Status](https://coveralls.io/repos/github/ninox92/setup/badge.svg?branch=master)](https://coveralls.io/github/ninox92/setup?branch=master)

A server config utility for nodejs
Change: hostname, network interfaces, hosts and date/time

## Features

- Set your network configuration. supports wireless adapters
- Change your hostname
- Set your hosts file (local dns)
- Modify server date/time and BIOS update
- Only works in linux :)

You need to install wpasupplicant for wireless options


# Install
```bash
npm install setup
```

## API

### Networking
- setup.network.parse(filePath)
- setup.network.save(config, outFile) 	  // Saves the configuration
- setup.network.restart() 	  // Restart network interfaces


### Hostname
- setup.hosts.save(hostname, outFile)


### Hosts (dns)
- setup.hosts.config(hosts)
- setup.hosts.save(config, outFile)


### Date/Time
- setup.clock.set(time) // Set date/time and sync BIOS clock


## Examples

### Set network interfaces

This will set your wlan0 card to connect at boot, use dhcp for ip settings, e connect to the SSID 'myWirelessName'.
Your ethernet card will have a static ip.

```js
const networking = require('setup').networking;
const cfg = {
  auto: ['lo'],
  iface: [{
      device: 'eth0',
      mode: 'dhcp'
  }]
};

networking.save(cfg, '/etc/network/myfile')
.then((result) => console.log)
.catch((error) => console.error);
```


### Change Hostname
```js
setup.hostname.save('nodejs.example.com');
```

### Change hosts
```js
const hosts = await setup.hosts({
	'10.0.0.1':'server1.example.com',
	'10.0.0.2':'server2.example.com'
}).save('/etc/hosts');
```


