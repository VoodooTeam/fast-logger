'use strict';

const utils = require('./utils'),
  LRU = require('lru-cache');

const cache = new LRU(50000);
let maxAge = 1000;

const APP_NAME = process.env.APP_NAME || 'UnknownAppName',
  SKELETON_LOG = {
    app: APP_NAME,
    time: '',
    level: '',
    msg: '',
    err: ''
  };

const info = (...data) => {
  const cacheName = 'info:' + data.toString();
  if (cache.has(cacheName)) return;
  cache.set(cacheName, true, maxAge);
  setImmediate(() => {
    generateLog('info', ...data)
  })
};

const error = (...data) => {
  const cacheName = 'error:' + data.toString();
  if (cache.has(cacheName)) return;
  cache.set(cacheName, true, maxAge);
  setImmediate(() => {
    generateLog('error', ...data)
  })
};

function generateLog(type, ...data) {
  let finalLog = utils.clone(SKELETON_LOG),
    keyName = 'data',
    keyIndex = 0;

  finalLog.level = type;
  finalLog.time = new Date();
  for (const d of data) {
    if (typeof d === 'string' && finalLog.msg === '') finalLog.msg = d;
    else if (typeof d === 'number' || typeof d === 'number' || Array.isArray(d)) {
      finalLog[`${keyName}_${keyIndex}`] = d;
      keyIndex++
    } else if (d instanceof Error) {
      finalLog.err = d.stack;
      for (const key in d) {
        finalLog[key] = d[key]
      }
    } else if (typeof d === 'object') {
      for (const key in d) {
        finalLog[key] = d[key]
      }
    }
  }
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
  info,
  error,
  setCacheTTL,
  cache
};
