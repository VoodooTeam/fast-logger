'use strict';

const utils = require('./utils'),
  LRU = require('lru-cache');

const option = {maxAge: 1000, max: 5000},
  cache = new LRU(option);

const APP_NAME = process.env.APP_NAME || 'UnknownAppName',
  SKELETON_LOG = {
    app: APP_NAME,
    time: '',
    level: '',
    msg: '',
    err: ''
  };

const info = (...data) => {
  if (cache.get(data.toString())) return;
  cache.set(data.toString(), true);
  setImmediate(() => {
    generateLog('info', ...data)
  })
};

const error = (...data) => {
  if (cache.get(data.toString())) return;
  cache.set(data.toString(), true);
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
      finalLog.errInfo = d.moreInfo
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


module.exports = {
  info: info,
  error: error,
};
