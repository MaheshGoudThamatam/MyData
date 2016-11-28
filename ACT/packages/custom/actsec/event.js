'use strict';

const EventEmitter = require('events');

class Events extends EventEmitter {}

const event = new Events();
event.setMaxListeners(1000);

module.exports = event;