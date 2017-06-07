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

This will set your wlan0 card to connect at boot, use dhcp for ip settings, e connect to the SSID 'myWirelessName'.
Your ethernet card will have a static ip.

```js
const networking = require('setup').networking;
const cfg = {
  auto: ['lo'],
  ifaces: [{
    device: 'eth0',
    mode: 'dhcp',
    dhcp: {
      'address': '192.168.1.15',
      'netmask': '255.255.255.0',
      'gateway': '192.168.1.254',
      'broadcast': '192.168.0.255',
      'dns-search': ['example.com', 'sales.example.com', 'dev.example.com'],
      'dns-nameservers': '192.168.1.3'
  	}
  }]
};

networking.save(cfg, '/etc/network/myfile')
.then((result) => console.log)
.catch((error) => console.error);
```

- setup.network.restart() 	  // Restart network interfaces


### Hostname

```js
const setup = require('setup');
const hostname = setup.hostname;

async function setHostname() {
	const newHostname = 'my.hostname';

	// Saves the new hosts to /etc/hostname
    const result = await hostname.save(newHostname);
	console.log(result);
}

setHostname();
```

### Hosts (dns)

```js
const setup = require('setup');
const hosts = setup.hosts;

async function setHosts() {
	const cfg = {
		'10.0.0.1': 'server1.example.com',
		'10.0.0.2': 'server2.example.com'
	};

	// Saves the new hosts to /etc/hosts
    const result = await hosts(cfg).save();
	console.log(result);
}

setHosts();
```

### Date/Time

#### Get

```js
const setup = require('setup');
const datetime = setup.datetime;

async function dateTime() {
	const currentTime = await datetime.get();
	console.log(currentTime);
}

dateTime();
```

#### Set

```js
const setup = require('setup');
const datetime = setup.datetime;

async function dateTime() {
	// Set date/time and sync BIOS clock
	await datetime.set('2017-06-07 12:34:56');
}

dateTime();
```
