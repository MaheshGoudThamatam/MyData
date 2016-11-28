var winston = require('winston');

var info = new winston.Logger({
  levels: {
    info: 1
  },
  transports: [
    new (winston.transports.File)({ filename: 'logsmymatchbox/info.log', level: 'info'}),
  ]
});

var warn = new winston.Logger({
  levels: {
    warn: 2
  },
  transports: [
    new (winston.transports.File)({filename:'logsmymatchbox/warning.log', level: 'warn'}),
  ]
});

var error = new winston.Logger({
  levels: {
    error: 3
  },
  transports: [
    new (winston.transports.File)({ filename:'logsmymatchbox/error.log', level: 'error'}),
  ]
});

var exports = {
  info: function(msg){
    info.info(msg);
  },
  warn: function(msg){
    warn.warn(msg);
  },
  error: function(msg){
    error.error(msg);
  },
  log: function(level,msg){
    var lvl = exports[level];
    lvl(msg);
  }
};


module.exports = exports;