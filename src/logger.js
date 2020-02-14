'use strict';

const utils = require('./utils'),
  LRU = require('lru-cache');

const cache = new LRU(50000);
let maxAge = 1000;

const levels = ['trace', 'debug', 'info', 'warn', 'error'];
const defaultLevel = 'info';
const APP_NAME = process.env.APP_NAME || 'UnknownAppName';
const LOG_LEVEL = process.env.LOG_LEVEL || defaultLevel;
const SKELETON_LOG = {
  app: APP_NAME,
  time: '',
  level: '',
  msg: '',
  err: ''
};

let loglevelIndex = levels.indexOf(LOG_LEVEL);
if (loglevelIndex === -1) {
  loglevelIndex = levels.indexOf(defaultLevel);
}
const logFunctions = {};

levels.forEach((level, index) => {
  logFunctions[level] = (...data) => {
    if (index >= loglevelIndex) {
      setImmediate(() => {
        generateLog(level, ...data)
      });
    }
  };
});

function generateLog(type, ...data) {
  let finalLog = utils.clone(SKELETON_LOG),
    keyName = 'data',
    keyIndex = 0,
    cacheName = `${type}:`;

  finalLog.level = type;
  finalLog.time = new Date();
  for (const d of data) {
    if (typeof d === 'string' && finalLog.msg === '') {
      finalLog.msg = d;
      cacheName += d;
    }
    else if (typeof d === 'number' || Array.isArray(d)) {
      finalLog[`${keyName}_${keyIndex}`] = d;
      keyIndex++;
      cacheName += d.toString();
    } else if (d instanceof Error) {
      finalLog.err = d.stack;
      finalLog.errObj = d;
      cacheName += d.toString();
      for (const key in d) {
        finalLog[key] = d[key]
      }
    } else if (typeof d === 'object') {
      cacheName += utils.safeStringify(d);
      for (const key in d) {
        finalLog[key] = d[key]
      }
    }
  }

  if (cache.has(cacheName)) return;
  cache.set(cacheName, true, maxAge);

  cleanLogs(finalLog);
  console.log(utils.safeStringify(finalLog));
}

function cleanLogs(log) {
  for (const key in log) {
    if (log[key] === '' || log[key] === null) delete log[key]
  }
}

/**
 * Set the TTL of items to the cache
 * Put -1 to disable the cache
 *
 * @param age of items in the cache
 */
const setCacheTTL = (age) => maxAge = age;

module.exports = {
  ...logFunctions,
  setCacheTTL,
  cache
};
