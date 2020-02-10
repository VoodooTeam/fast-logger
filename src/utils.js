'use strict';

/**
 * JSON stringify safe from circular references.
 */
exports.safeStringify = (obj) => {
  return JSON.stringify(obj, getCircularReplacer())
};

/**
 * Optimize cloning for an object
 *
 * @param {object} obj - The object you want to clone
 */
exports.clone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  } else if (Array.isArray(obj)) {
    let clonedArr = [];
    for (const data of obj) {
      clonedArr.push(exports.clone(data))
    }
    return clonedArr
  } else {
    let clonedObj = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
      clonedObj[key] = exports.clone(obj[key])
    }
    return clonedObj
  }
};

/**
 * Circular replacer used to prevent JSON.stringify from
 * breaking when processing an object with a circular reference.
 *
 */
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
};
